import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3003),
  MONGODB_URI: Joi.string()
    .required()
    .default('mongodb://localhost:27017/vaoluoi-upload'),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  UPLOAD_MAX_IMAGE_SIZE: Joi.number().default(52428800), // 50MB
  UPLOAD_MAX_VIDEO_SIZE: Joi.number().default(104857600), // 100MB
  UPLOAD_ALLOWED_TYPES: Joi.string().default(
    'image/jpeg,image/png,image/gif,video/mp4,video/webm,video/avi',
  ),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  R2_ENDPOINT: Joi.string().required().uri(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  CDN_BASE_URL: Joi.string().required().uri(),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  LOG_FILE: Joi.string().default('./logs/upload-service.log'),
  // Responsive configuration
  RESPONSIVE_ENABLED: Joi.boolean().default(true),
  RESPONSIVE_MOBILE_WIDTH: Joi.number().default(480),
  RESPONSIVE_MOBILE_HEIGHT: Joi.number().default(640),
  RESPONSIVE_MOBILE_QUALITY: Joi.number().min(1).max(100).default(80),
  RESPONSIVE_TABLET_WIDTH: Joi.number().default(768),
  RESPONSIVE_TABLET_HEIGHT: Joi.number().default(1024),
  RESPONSIVE_TABLET_QUALITY: Joi.number().min(1).max(100).default(85),
  RESPONSIVE_DESKTOP_WIDTH: Joi.number().default(1920),
  RESPONSIVE_DESKTOP_HEIGHT: Joi.number().default(1080),
  RESPONSIVE_DESKTOP_QUALITY: Joi.number().min(1).max(100).default(90),
  RESPONSIVE_MAX_VARIANTS: Joi.number().min(1).max(10).default(5),
  RESPONSIVE_PRESERVE_ASPECT_RATIO: Joi.boolean().default(true),
});
