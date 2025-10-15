export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'url',
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
};

export const apiConfig = {
  authUrl: process.env.NEXT_PUBLIC_API_URL || 'url',
};

export const appConfig = {
  port: process.env.PORT || 3009,
};
