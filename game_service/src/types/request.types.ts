import { JwtUser } from './auth.types';

export interface AuthenticatedRequest {
  user: JwtUser;
}
