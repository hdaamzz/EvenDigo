export const getCookieConfig = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as const,
  maxAge,
  domain: process.env.NODE_ENV === 'production' ? process.env.CLIENT_SERVER : undefined,
});

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Usage in controllers:
// res.cookie('accessToken', result.accessToken, getCookieConfig(ACCESS_TOKEN_MAX_AGE));
// res.cookie('refreshToken', result.refreshToken, getCookieConfig(REFRESH_TOKEN_MAX_AGE));