import { Routes } from '@angular/router';
import { isAdmin, isLogged, isLogout } from './core/guards/user/user.auth.guard';
import { adminIsLogged, adminIsLogout } from './core/guards/admin/admin.auth.guard';
import { subscriptionGuard } from './core/guards/subscription/subscription.guard';

export const routes: Routes = [
    // User - side
    {
        path: '',
        loadComponent: () => import('./modules/user/home/home.component').then(m => m.HomeComponent),
        canActivate: [isAdmin]
    },
    {
        path: 'register',
        loadComponent: () => import('./modules/user/register/register.component').then(m => m.RegisterComponent),
        canActivate: [isLogout]
    },
    {
        path: 'login',
        loadComponent: () => import('./modules/user/login/login.component').then(m => m.LoginComponent),
        canActivate: [isLogout]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./modules/user/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        canActivate: [isLogout]
    },
    {
        path: 'profile',
        loadComponent: () => import('./modules/user/profile/profile.component').then(m => m.ProfileComponent),
        children: [
            {
                path: '',
                redirectTo: 'details',
                pathMatch: 'full'
            },
            {
                path: 'details',
                loadComponent: () => import('./modules/user/profile/profile.details/profile.details.component').then(m => m.ProfileDetailsComponent)
            },
            {
                path: 'bookings',
                loadComponent: () => import('./modules/user/profile/profile.bookings/profile.bookings.component').then(m => m.ProfileBookingsComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./modules/user/profile/profile.events/profile.events.component').then(m => m.ProfileEventsComponent)
            },
            {
                path: 'edit-event/:id',
                loadComponent: () => import('./modules/user/profile/profile.events/event-edit/event-edit.component').then(m => m.EventEditComponent)
            },
            {
                path: 'subscription',
                loadComponent: () => import('./modules/user/profile/profile.subscription/profile.subscription.component').then(m => m.ProfileSubscriptionComponent)
            },
            {
                path: 'wallet',
                loadComponent: () => import('./modules/user/profile/profile.wallet/profile.wallet.component').then(m => m.ProfileWalletComponent)
            }
        ],
        canActivate: [isLogged]
    },
    {
        path: 'chats',
        loadComponent: () => import('./modules/user/chat/chat.component').then(m => m.ChatComponent),
        canActivate: [isLogged, subscriptionGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./modules/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        canActivate: [isLogged]
    },
    {
        path: 'event-analytics/:id',
        loadComponent: () => import('./modules/user/user-dashboard/event-analytics/event-analytics.component').then(m => m.EventAnalyticsComponent),
        canActivate: [isLogged]
    },
    {
        path: 'explore',
        loadComponent: () => import('./modules/user/user-explore/user-explore.component').then(m => m.UserExploreComponent),
        canActivate: [isLogged]
    },
    {
        path: 'checkout',
        loadComponent: () => import('./modules/user/user-checkout/user-checkout.component').then(m => m.UserCheckoutComponent),
        canActivate: [isLogged]
    },
    {
        path: 'payment/success',
        loadComponent: () => import('./modules/user/user-checkout/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
        canActivate: [isLogged]
    },
    {
        path: 'premium/checkout',
        loadComponent: () => import('./modules/user/premium-checkout/premium-checkout.component').then(m => m.PremiumCheckoutComponent),
        canActivate: [isLogged]
    },
    {
        path: 'premium/success',
        loadComponent: () => import('./modules/user/premium-checkout/subscription-confirmation/subscription-confirmation.component').then(m => m.SubscriptionConfirmationComponent),
        canActivate: [isLogged]
    },
    {
        path: 'live-stream',
        loadComponent: () => import('./modules/user/live-stream/live-stream.component').then(m => m.LiveStreamComponent),
        canActivate: [isLogged, subscriptionGuard]
    },
    
    // Admin - side
    {
        path: 'admin/login',
        loadComponent: () => import('./modules/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
        canActivate: [adminIsLogout]
    },
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./modules/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [adminIsLogged]
    },
    
    // Wildcard route
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
    }
];
