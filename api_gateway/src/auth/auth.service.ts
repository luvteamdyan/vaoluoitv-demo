import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '@/schemas/user.schema';
import { WebhookService } from '@/webhook/webhook.service';
import { RecaptchaService } from '@/auth/recaptcha.service';
import {
  WebhookRequestDto,
  WebhookLoginRequestDto,
} from '@/webhook/dto/webhook.dto';
import { RegisterV2Dto } from '@/auth/dto/register-v2.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private webhookService: WebhookService,
    private recaptchaService: RecaptchaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async validateUserWithWebhook(
    identifier: string,
    password: string,
  ): Promise<any> {
    try {
      this.logger.log(`Validating user with webhook: ${identifier}`);

      // Gửi login request đến auth webhook trước
      const loginData: WebhookLoginRequestDto = {
        identifier: identifier, // Sử dụng identifier (có thể là email hoặc username)
        password,
      };

      const webhookResponse =
        await this.webhookService.sendLoginRequest(loginData);

      this.logger.log(
        `Webhook login response received for user: ${identifier}`,
      );
      this.logger.log(
        `Webhook response data: ${JSON.stringify(webhookResponse.data)}`,
      );

      // Kiểm tra response từ webhook
      if (!webhookResponse.success || !webhookResponse.data) {
        throw new UnauthorizedException(
          'Invalid credentials from auth webhook',
        );
      }

      // Lấy access_token từ webhook response
      const accessToken = webhookResponse.data.access_token;
      if (!accessToken) {
        throw new UnauthorizedException(
          'Access token not found in webhook response',
        );
      }

      // Gọi /users/me để lấy thông tin user đầy đủ
      this.logger.log(`Getting user profile from /users/me endpoint`);
      const userProfileResponse =
        await this.webhookService.getUserProfile(accessToken);

      if (!userProfileResponse.success || !userProfileResponse.data) {
        throw new UnauthorizedException(
          'Failed to get user profile from webhook',
        );
      }

      const webhookUserData = userProfileResponse.data.user;
      const webhookUsername = webhookUserData?.username;

      if (!webhookUsername) {
        throw new UnauthorizedException(
          'Username not found in user profile response',
        );
      }

      // Tìm user trong database local dựa trên username từ webhook response
      let user: UserDocument | null = await this.userModel
        .findOne({ username: webhookUsername })
        .exec();

      if (!user) {
        // Nếu user chưa có trong DB local nhưng webhook thành công
        // Tự động tạo user mới từ webhook response và đăng nhập luôn
        this.logger.log(
          `User not found in local database, auto-registering from webhook data: ${webhookUsername}`,
        );

        try {
          const newUser = await this.createUserFromWebhookResponse(
            webhookUserData,
            password,
          );
          user = newUser;
          this.logger.log(
            `User auto-registered and ready for login: ${webhookUsername}`,
          );
        } catch (createError) {
          this.logger.error(
            `Failed to auto-register user from webhook: ${webhookUsername}`,
            createError.stack,
          );
          throw new UnauthorizedException(
            `Auto-registration failed: ${createError.message}`,
          );
        }
      } else {
        // User đã tồn tại, cập nhật thông tin từ webhook response
        this.logger.log(
          `User found in local database, updating from webhook: ${webhookUsername}`,
        );

        try {
          await this.updateUserFromWebhookResponse(user, webhookUserData);
          this.logger.log(`User data updated from webhook: ${webhookUsername}`);
        } catch (updateError) {
          this.logger.warn(
            `Failed to update user data from webhook: ${webhookUsername}`,
            updateError.message,
          );
          // Không throw error, chỉ log warning và tiếp tục với data cũ
        }
      }

      // Trả về user data (loại bỏ password)
      if (!user) {
        throw new UnauthorizedException(
          'User not found after webhook validation',
        );
      }
      const { password: _password, ...result } = user.toObject();
      return result;
    } catch (error) {
      this.logger.error(
        `Webhook validation failed for user: ${identifier}`,
        error.stack,
      );

      // Nếu webhook fail, fallback về validation local
      // Thử tìm user bằng email hoặc username
      this.logger.warn(
        `Falling back to local validation for user: ${identifier}`,
      );

      // Kiểm tra xem identifier có phải là email không
      const isEmail = identifier.includes('@');
      if (isEmail) {
        return await this.validateUser(identifier, password);
      } else {
        // Nếu là username, tìm user bằng username
        const user = await this.userModel
          .findOne({ username: identifier })
          .exec();
        if (user && (await bcrypt.compare(password, user.password))) {
          const { password: _password, ...result } = user.toObject();
          return result;
        }
        return null;
      }
    }
  }

  login(user: any): { access_token: string; user: any } {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      external_id: user.external_id,
    };

    // Update last_login
    void this.userModel
      .findByIdAndUpdate(user._id, { last_login: new Date() })
      .exec();

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        sms_verified: user.sms_verified,
        points: user.points,
        referral_code: user.referral_code,
        invited_by: user.invited_by,
        role: user.role,
        last_login: user.last_login,
        is_active: user.is_active,
        external_id: user.external_id,
      },
    };
  }

  async register(
    username: string,
    email: string,
    password: string,
    phone_number?: string,
    address?: string,
    referral_code?: string,
    display_name?: string,
  ) {
    // Kiểm tra user đã tồn tại chưa
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email }, { username }],
      })
      .exec();

    if (existingUser) {
      throw new UnauthorizedException('Email or username already exists');
    }

    // Gửi dữ liệu đến webhook endpoint trước khi tạo user
    this.logger.log(`Sending user data to webhook for registration: ${email}`);

    const webhookData: WebhookRequestDto = {
      username,
      email,
      password, // Gửi password gốc
      phone_number,
      address,
      referral_code: referral_code,
    };

    try {
      // Gọi webhook và chờ response
      const webhookResponse = await this.webhookService.registerV1(webhookData);

      this.logger.log(`Webhook response received for user: ${email}`);
      this.logger.log(
        `Webhook response data: ${JSON.stringify(webhookResponse.data)}`,
      );

      // Sử dụng response từ webhook để tạo user
      // Giả sử webhook trả về thông tin user đã được tạo
      const webhookUserData = webhookResponse.data.user;

      // Hash password cho database local
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user với dữ liệu từ webhook response (không tự generate referral_code)
      const user = new this.userModel({
        username: webhookUserData.username || username,
        display_name: webhookUserData.display_name || display_name,
        email: webhookUserData.email || email,
        password: hashedPassword,
        phone_number: webhookUserData.phone_number || phone_number,
        address: webhookUserData.address || address,
        sms_verified: webhookUserData.sms_verified || false,
        points: webhookUserData.points || 0,
        referral_code: webhookUserData.referral_code || null,
        invited_by: webhookUserData.invited_by || referral_code,
        role: webhookUserData.role || 'user',
        is_active:
          webhookUserData.is_active !== undefined
            ? webhookUserData.is_active
            : true,
        external_id: webhookUserData.id || null,
      });

      await user.save();

      this.logger.log(`User created successfully with webhook data: ${email}`);

      const { password: _password, ...result } = user.toObject();
      return result;
    } catch (error) {
      this.logger.error(
        `Webhook failed for user registration: ${email}`,
        error.stack,
      );

      // Xử lý lỗi chi tiết từ webhook - trả về trực tiếp message từ webhook
      if (error.response?.data) {
        const webhookError = error.response.data;
        const webhookErrorDetails = webhookError.webhookError;

        // Tạo thông báo lỗi chi tiết theo format field:message
        let errorMessage = 'Đăng ký thất bại';

        if (webhookErrorDetails?.field && webhookErrorDetails?.message) {
          // Lỗi cụ thể về field - format: "field_name: error_message"
          errorMessage = `${webhookErrorDetails.field}: ${webhookErrorDetails.message}`;
        } else if (webhookErrorDetails?.message) {
          // Lỗi chung - sử dụng message trực tiếp từ webhook
          errorMessage = webhookErrorDetails.message;
        } else if (webhookError?.error) {
          // Fallback - sử dụng error trực tiếp từ webhook
          errorMessage = webhookError.error;
        } else if (webhookError?.message) {
          // Sử dụng message trực tiếp từ webhook response
          errorMessage = webhookError.message;
        }

        this.logger.error(
          `Webhook error for user ${email}: ${errorMessage}`,
          JSON.stringify(webhookError, null, 2),
        );

        throw new UnauthorizedException(errorMessage);
      }

      // Nếu webhook fail, throw error để không tạo user
      throw new UnauthorizedException(`Đăng ký thất bại: ${error.message}`);
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByExternalId(externalId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ external_id: externalId }).exec();
  }

  /**
   * Đăng ký user với reCAPTCHA v3 validation
   * Note: reCAPTCHA verification được thực hiện ở webhook endpoint https://auth.luck8event.com/api/v1/auth/v2/register
   */
  async registerV2(registerDto: RegisterV2Dto) {
    this.logger.log(
      `Starting registration with reCAPTCHA for user: ${registerDto.email}`,
    );

    // 1. Kiểm tra reCAPTCHA token có tồn tại và format hợp lệ
    try {
      await this.recaptchaService.verifyTokenWithRetry(
        registerDto.recaptchaToken,
        undefined,
        'register',
        1,
      );
      this.logger.log(
        `reCAPTCHA token format validation successful for user: ${registerDto.email}`,
      );
    } catch (error) {
      this.logger.error(
        `reCAPTCHA token validation failed for user: ${registerDto.email}`,
        error.message,
      );
      throw new UnauthorizedException(
        `reCAPTCHA token validation failed: ${error.message}`,
      );
    }

    // 2. Kiểm tra user đã tồn tại chưa
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email: registerDto.email }, { username: registerDto.username }],
      })
      .exec();

    if (existingUser) {
      throw new UnauthorizedException('Email or username already exists');
    }

    // 3. Gửi dữ liệu đến webhook endpoint với reCAPTCHA token
    this.logger.log(
      `Sending user data to webhook for registration: ${registerDto.email}`,
    );

    const webhookData: WebhookRequestDto = {
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      phone_number: registerDto.phone_number,
      address: registerDto.address,
      referral_code: registerDto.referral_code,
      recaptchaToken: registerDto.recaptchaToken,
    };

    try {
      // Gọi webhook và chờ response
      const webhookResponse = await this.webhookService.registerV2(webhookData);

      this.logger.log(
        `Webhook response received for user: ${registerDto.email}`,
      );
      this.logger.log(
        `Webhook response data: ${JSON.stringify(webhookResponse.data)}`,
      );

      // Sử dụng response từ webhook để tạo user
      const webhookUserData = webhookResponse.data.user;

      // Hash password cho database local
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Tạo user với dữ liệu từ webhook response (không tự generate referral_code)
      const user = new this.userModel({
        username: webhookUserData.username || registerDto.username,
        display_name: webhookUserData.display_name || registerDto.display_name,
        email: webhookUserData.email || registerDto.email,
        password: hashedPassword,
        phone_number: webhookUserData.phone_number || registerDto.phone_number,
        address: webhookUserData.address || registerDto.address,
        sms_verified: webhookUserData.sms_verified || false,
        points: webhookUserData.points || 0,
        referral_code: webhookUserData.referral_code || null,
        invited_by: webhookUserData.invited_by || registerDto.referral_code,
        role: webhookUserData.role || 'user',
        is_active:
          webhookUserData.is_active !== undefined
            ? webhookUserData.is_active
            : true,
        external_id: webhookUserData.id || null,
      });

      await user.save();

      this.logger.log(
        `User created successfully with webhook data: ${registerDto.email}`,
      );

      const { password: _password, ...result } = user.toObject();
      return result;
    } catch (error) {
      this.logger.error(
        `Webhook failed for user registration: ${registerDto.email}`,
        error.stack,
      );

      // Xử lý lỗi chi tiết từ webhook
      if (error.response?.data) {
        const webhookError = error.response.data;
        const webhookErrorDetails = webhookError.webhookError;

        // Tạo thông báo lỗi chi tiết
        let errorMessage = 'Đăng ký thất bại';

        if (webhookErrorDetails?.field && webhookErrorDetails?.message) {
          // Lỗi cụ thể về field
          errorMessage = `${webhookErrorDetails.field}: ${webhookErrorDetails.message}`;
        } else if (webhookErrorDetails?.message) {
          // Lỗi chung
          errorMessage = webhookErrorDetails.message;
        } else if (webhookError?.error) {
          // Fallback
          errorMessage = webhookError.error;
        }

        this.logger.error(
          `Detailed webhook error for user ${registerDto.email}: ${errorMessage}`,
          JSON.stringify(webhookError, null, 2),
        );

        throw new UnauthorizedException(errorMessage);
      }

      // Nếu webhook fail, throw error để không tạo user
      throw new UnauthorizedException(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Tạo user mới từ webhook response khi đăng nhập thành công
   * nhưng user chưa có trong database local
   */
  private async createUserFromWebhookResponse(
    webhookUserData: any,
    password: string,
  ): Promise<UserDocument> {
    try {
      this.logger.log(
        `Creating user from webhook data: ${JSON.stringify(webhookUserData)}`,
      );

      // Hash password cho database local
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo user với dữ liệu từ webhook response (không tự generate referral_code)
      const user = new this.userModel({
        username:
          webhookUserData.username ||
          webhookUserData.email?.split('@')[0] ||
          'user',
        display_name: webhookUserData.display_name || null,
        email: webhookUserData.email,
        password: hashedPassword,
        phone_number: webhookUserData.phone_number || null,
        address: webhookUserData.address || null,
        sms_verified: webhookUserData.sms_verified || false,
        points: webhookUserData.points || 0,
        referral_code: webhookUserData.referral_code || null,
        invited_by: webhookUserData.invited_by || null,
        role: webhookUserData.role || 'user',
        is_active:
          webhookUserData.is_active !== undefined
            ? webhookUserData.is_active
            : true,
        external_id: webhookUserData.id || null,
      });

      const savedUser = await user.save();
      this.logger.log(
        `User successfully created from webhook response: ${savedUser.email}`,
      );

      return savedUser;
    } catch (error) {
      this.logger.error(
        `Failed to create user from webhook response: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException(
        `Failed to create user from webhook: ${error.message}`,
      );
    }
  }

  /**
   * Cập nhật thông tin user từ webhook response
   */
  private async updateUserFromWebhookResponse(
    user: UserDocument,
    webhookUserData: any,
  ): Promise<void> {
    try {
      this.logger.log(
        `Updating user from webhook data: ${JSON.stringify(webhookUserData)}`,
      );

      // Cập nhật các field từ webhook response
      const updateData: any = {};

      // Cập nhật các field có thể thay đổi từ webhook
      if (webhookUserData.display_name !== undefined) {
        updateData.display_name = webhookUserData.display_name;
      }
      if (webhookUserData.email !== undefined) {
        updateData.email = webhookUserData.email;
      }
      if (webhookUserData.phone_number !== undefined) {
        updateData.phone_number = webhookUserData.phone_number;
      }
      if (webhookUserData.address !== undefined) {
        updateData.address = webhookUserData.address;
      }
      if (webhookUserData.sms_verified !== undefined) {
        updateData.sms_verified = webhookUserData.sms_verified;
      }
      if (webhookUserData.points !== undefined) {
        updateData.points = webhookUserData.points;
      }
      if (webhookUserData.referral_code !== undefined) {
        updateData.referral_code = webhookUserData.referral_code;
      }
      if (webhookUserData.invited_by !== undefined) {
        updateData.invited_by = webhookUserData.invited_by;
      }
      if (webhookUserData.role !== undefined) {
        updateData.role = webhookUserData.role;
      }
      if (webhookUserData.is_active !== undefined) {
        updateData.is_active = webhookUserData.is_active;
      }
      if (webhookUserData.last_login !== undefined) {
        updateData.last_login = new Date(webhookUserData.last_login);
      }
      if (webhookUserData.id !== undefined) {
        updateData.external_id = webhookUserData.id;
      }

      // Chỉ update nếu có dữ liệu để update
      if (Object.keys(updateData).length > 0) {
        await this.userModel.findByIdAndUpdate(user._id, updateData).exec();
        this.logger.log(
          `User successfully updated from webhook response: ${user.username}`,
        );
      } else {
        this.logger.log(`No data to update for user: ${user.username}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update user from webhook response: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
