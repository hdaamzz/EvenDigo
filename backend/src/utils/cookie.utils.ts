import { Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class CookieUtils {
  private static readonly ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; 
  private static readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

  private static getDefaultCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
  }

  static setAuthCookies(res: Response, tokens: AuthTokens): void {
    const defaultOptions = this.getDefaultCookieOptions();

    res.cookie('accessToken', tokens.accessToken, {
      ...defaultOptions,
      maxAge: this.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...defaultOptions,
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
    });
  }

  static setCookie(
    res: Response,
    name: string,
    value: string,
    options?: CookieOptions
  ): void {
    const defaultOptions = this.getDefaultCookieOptions();
    res.cookie(name, value, { ...defaultOptions, ...options });
  }

  static clearAuthCookies(res: Response): void {
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
  }

  static clearCookie(res: Response, name: string, options?: CookieOptions): void {
    const defaultOptions = this.getDefaultCookieOptions();
    res.clearCookie(name, { ...defaultOptions, ...options });
  }
}