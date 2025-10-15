export interface DatabaseConfig {
  uri: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface ResponsiveConfig {
  enabled: boolean;
  defaultBreakpoints: {
    mobile: { width: number; height: number; quality: number };
    tablet: { width: number; height: number; quality: number };
    desktop: { width: number; height: number; quality: number };
  };
  maxVariants: number;
  preserveAspectRatio: boolean;
}

export interface UploadConfig {
  maxImageSize: number;
  maxVideoSize: number;
  allowedTypes: string[];
  path: string;
  responsive: ResponsiveConfig;
}

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface CdnConfig {
  baseUrl: string;
}

export interface SecurityConfig {
  apiKey: string;
}

export interface LoggingConfig {
  level: string;
  file: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  upload: UploadConfig;
  r2: R2Config;
  cdn: CdnConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
}
