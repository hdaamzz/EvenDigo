import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { filter, map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthActions } from "./auth.actions";
import { routerNavigatedAction } from '@ngrx/router-store';
import Notiflix from "notiflix";
import { GoogleAuthService } from "../../services/user/googleAuth/google-auth.service";
import { AdminAuthService } from "../../services/admin/auth/admin.auth.service";
import { AuthService } from "../../services/user/auth/auth.service";




@Injectable({
    providedIn: 'root'
})
export class AuthEffects {
    private authService: AuthService = inject(AuthService);
    private googleAuthService: GoogleAuthService = inject(GoogleAuthService)
    private actions$: Actions = inject(Actions);
    private router: Router = inject(Router);
    private adminAuthService:AdminAuthService=inject(AdminAuthService)


    checkAuth$ = createEffect(() =>
        this.actions$.pipe(
            ofType(routerNavigatedAction),
            filter(() => {
                const currentUrl = this.router.url;
                return !currentUrl.includes('/login') && 
                       !currentUrl.includes('/register') && 
                       !currentUrl.includes('/reset-password') &&
                       !currentUrl.includes('/admin/login');
            }),
            switchMap(() =>
                this.authService.checkAuthStatus().pipe(
                    map(response => {
                        if (response.isAuthenticated && response.user) {
                            return AuthActions.restoreSession({
                                user: response.user,
                                token: response.token || ""
                            });
                        }
                        return { type: 'NO_ACTION' } as any;
                    }),
                    catchError((error) => {
                        if (error.status !== 401) {
                            return of(AuthActions.loginFailure({
                                error: error.message || 'Failed to check auth status'
                            }));
                        }
                        return of({ type: 'NO_ACTION' } as any);
                    })
                )
            ),
            filter(action => action.type !== 'NO_ACTION')
        )
    );

    handleAuthFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginFailure),
                tap(({ error }) => {
                    const currentUrl = this.router.url;
                    if (!currentUrl.includes('/login') &&
                        !currentUrl.includes('/register')) {
                        this.router.navigate(['/']);
                    }
                })
            ),
        { dispatch: false }
    );

    adminHandleAuthFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.adminLoginFailure),
                tap(({ error }) => {
                    this.router.navigate(['/admin/login']);
                })
            ),
        { dispatch: false }
    );



    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(({ email, password }) =>
                this.authService.userLogin({ email, password }).pipe(
                    map(response => {
                        if (response.success) {
                            Notiflix.Notify.success('Welcome to EvenDigo');
                           

                            return AuthActions.loginSuccess({
                                user: response.user,
                                token: response.token
                            });
                        }
                        throw new Error(response.message || 'Login Failed');
                    }),
                    catchError(error => {
                        const errorMessage = error.error?.message || error.message || 'Failed to Login';
                        Notiflix.Notify.failure(errorMessage);
                        return of(AuthActions.loginFailure({
                            error: errorMessage
                        }));
                    })
                )
            )
        )
    );

    adminLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.adminLogin),
            switchMap(({ email, password }) =>
                this.adminAuthService.adminLogin({ email, password }).pipe(
                    map(response => {
                        console.log("adminLogin",response);
                        
                        if (response.success) {
                            Notiflix.Notify.success('Welcome to EvenDigo');
                           

                            return AuthActions.adminLoginSuccess({
                                user: response.user,
                                token: response.token
                            });
                        }
                        throw new Error(response.message || 'Login Failed');
                    }),
                    catchError(error => {
                        const errorMessage = error.message || error.error?.message || 'Admin Failed to Login';
                        Notiflix.Notify.failure(errorMessage);
                        return of(AuthActions.adminLoginFailure({
                            error: errorMessage
                        }));
                    })
                )
            )
        )
    );

    loginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                tap(() => {
                    this.router.navigate(['/']);
                })
            ),
        { dispatch: false }
    );


    adminLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.adminLoginSuccess),
                tap(() => {
                    this.router.navigate(['admin/dashboard']);
                })
            ),
        { dispatch: false }
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                switchMap(() =>
                    this.authService.logout().pipe(
                        map(() => {
                            this.router.navigate(['/']);
                            return AuthActions.logoutSuccess();
                        }),
                        catchError(error => {
                            Notiflix.Notify.failure('Logout failed');
                            return of(AuthActions.logoutFailure({ error: error.message }));
                        })
                    )
                )
            )
    );
    

    googleLogin$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.googleLogin),
            switchMap(() =>
                this.googleAuthService.loginWithGoogle().pipe(
                    map(response => {
                        if (response.success) {
                            Notiflix.Notify.success('Welcome to EvenDigo');
                            return AuthActions.googleLoginSuccess({
                                user: response.user,
                                token: response.token
                            });
                        }
                        throw new Error(response.message || 'Google Login Failed');
                    }),
                    catchError(error => {
                        const errorMessage = error.error?.message || error.message || 'Failed to Login with Google';
                        Notiflix.Notify.failure(errorMessage);
                        return of(AuthActions.googleLoginFailure({
                            error: errorMessage
                        }));
                    })
                )
            )
        )
    );

    googleLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.googleLoginSuccess),
                tap(() => {
                    this.router.navigate(['/']);
                })
            ),
        { dispatch: false }
    );

}