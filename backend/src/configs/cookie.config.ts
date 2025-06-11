import { CookieOptions } from 'express';

export interface TokenCookieConfig {
  accessToken: CookieOptions;
  refreshToken: CookieOptions;
}

class CookieConfig {
  private getBaseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.CLIENT_SERVER : 'localhost',
    };
  }

  public getTokenCookieOptions(): TokenCookieConfig {
    const baseOptions = this.getBaseCookieOptions();
    
    return {
      accessToken: {
        ...baseOptions,
        maxAge: 15 * 60 * 1000, 
      },
      refreshToken: {
        ...baseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      },
    };
  }

  public getLoginCookieOptions(): TokenCookieConfig {
    const baseOptions = this.getBaseCookieOptions();
    
    return {
      accessToken: {
        ...baseOptions,
        maxAge: 24 * 60 * 60 * 1000, 
      },
      refreshToken: {
        ...baseOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      },
    };
  }

  public getClearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.CLIENT_SERVER : 'localhost',
    };
  }
}

export const cookieConfig = new CookieConfig();