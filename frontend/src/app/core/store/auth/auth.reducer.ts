import { createReducer, on } from "@ngrx/store";
import { AuthState } from "../../models/userModel";
import { AuthActions } from "./auth.actions";

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false
}

export const authReducer = createReducer(
    initialState,
    // Regular login
    on(AuthActions.login, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.loginSuccess, (state, { user, token }) => ({
        ...state,
        user,
        token,
        loading: false,
        error: null,
        isAuthenticated: true
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        user: null,
        token: null,
        loading: false,
        error,
        isAuthenticated: false
    })),
    //admin 
    on(AuthActions.adminLogin, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.adminLoginSuccess, (state, { user, token }) => ({
        ...state,
        user,
        token,
        loading: false,
        error: null,
        isAuthenticated: true
    })),
    on(AuthActions.adminLoginFailure, (state, { error }) => ({
        ...state,
        user: null,
        token: null,
        loading: false,
        error,
        isAuthenticated: false
    })),

    // Google login
    on(AuthActions.googleLogin, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(AuthActions.googleLoginSuccess, (state, { user, token }) => ({
        ...state,
        user,
        token,
        loading: false,
        error: null,
        isAuthenticated: true
    })),
    on(AuthActions.googleLoginFailure, (state, { error }) => ({
        ...state,
        user: null,
        token: null,
        loading: false,
        error,
        isAuthenticated: false
    })),

    // Session restoration
    on(AuthActions.restoreSession, (state, { user, token }) => ({
        ...state,
        user,
        token,
        loading: false,
        error: null,
        isAuthenticated: true
    })),

    // Logout
    on(AuthActions.logout, () => initialState),
    on(AuthActions.logoutSuccess, () => initialState),
    on(AuthActions.logoutFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    }))
);