import { Routes } from '@angular/router';
import { RegisterComponent } from './modules/user/register/register.component';
import { HomeComponent } from './modules/user/home/home.component';
import { LoginComponent } from './modules/user/login/login.component';
import { isAdmin, isLogged, isLogout } from './core/guards/user/user.auth.guard';
import { AdminLoginComponent } from './modules/admin/admin-login/admin-login.component';
import { DashboardComponent } from './modules/admin/dashboard/dashboard.component';
import { adminIsLogged, adminIsLogout } from './core/guards/admin/admin.auth.guard';
import { ProfileComponent } from './modules/user/profile/profile.component';
import { ProfileDetailsComponent } from './modules/user/profile/profile.details/profile.details.component';
import { ProfileEventsComponent } from './modules/user/profile/profile.events/profile.events.component';
import { ResetPasswordComponent } from './modules/user/reset-password/reset-password.component';
import { UserDashboardComponent } from './modules/user/user-dashboard/user-dashboard.component';
import { UserExploreComponent } from './modules/user/user-explore/user-explore.component';
import { UserCheckoutComponent } from './modules/user/user-checkout/user-checkout.component';
import { PaymentSuccessComponent } from './modules/user/user-checkout/payment-success/payment-success.component';
import { ProfileWalletComponent } from './modules/user/profile/profile.wallet/profile.wallet.component';
import { ProfileBookingsComponent } from './modules/user/profile/profile.bookings/profile.bookings.component';

export const routes: Routes = [
    //user - side 
    {
        path:'',
        component:HomeComponent,
        canActivate:[isAdmin]
    },
    {
        path:'register',
        component:RegisterComponent,
        canActivate:[isLogout]
    },
    {
        path:'login',
        component:LoginComponent,
        canActivate:[isLogout]
    },
    {
        path: 'reset-password', 
        component: ResetPasswordComponent,
        canActivate:[isLogout]
    },
    {
        path:'profile',
        component:ProfileComponent,
        children: [
            {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
            },
            {
                path: 'details',
                component: ProfileDetailsComponent
            },
            {
                path: 'bookings',
                component: ProfileBookingsComponent
            },
            {
                path: 'events',
                component: ProfileEventsComponent
            },
            {
                path:'wallet',
                component:ProfileWalletComponent
            }
        ],
        canActivate:[isLogged]
    },
    {
        path:'dashboard',
        component:UserDashboardComponent,
        canActivate:[isLogged]
    },
    {
        path:'explore',
        component:UserExploreComponent,
        canActivate:[isLogged]
    },
    {
        path:'checkout',
        component:UserCheckoutComponent,
        canActivate:[isLogged]
    },
    { path: 'payment/success',
        component: PaymentSuccessComponent
    },

    //admin - side
    {
        path:'admin/login',
        component:AdminLoginComponent,
        canActivate:[adminIsLogout]
    },
    {
        path:'admin/dashboard',
        component:DashboardComponent,
        canActivate:[adminIsLogged]
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
      }
];
