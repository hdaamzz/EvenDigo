import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../models/userModel';

export const AuthActions = createActionGroup({
    source: 'Auth',
    events: {
        'Login': props<{email: string, password: string}>(),
        'Login Success': props<{ user: User; token: string }>(),
        'Login Failure': props<{error: string}>(),
        'Admin Login': props<{email: string, password: string}>(),
        'Admin Login Success': props<{ user: User; token: string }>(),
        'Admin Login Failure': props<{error: string}>(),
        'Google Login': emptyProps(),
        'Google Login Success': props<{ user: User; token: string }>(),
        'Google Login Failure': props<{error: string}>(),
        'Restore Session': props<{user: User; token: string}>(),
        'Logout': emptyProps(),
        'Logout Success': emptyProps(),
        'Logout Failure': props<{error: string}>(),
    }
});