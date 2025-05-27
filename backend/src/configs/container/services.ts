import { container } from "tsyringe";

// -- User Services --
import { AuthService } from "../../../src/services/implementation/user/auth/Auth.service";
import { OTPService } from "../../../src/services/implementation/user/auth/OTPService";
import { PasswordService } from "../../../src/services/implementation/user/auth/PasswordService";
import { EmailService } from "../../../src/services/implementation/user/auth/EmailService";
import { FirebaseAuthService } from "../../../src/services/implementation/user/auth/FirebaseAuthService";
import { TokenService } from "../../../src/services/implementation/user/auth/TokenService";
import { ExploreService } from "../../services/implementation/user/explore/explore.service";
import { SubscriptionQueryService } from "../../../src/services/implementation/user/subscription/SubscriptionQueryService";
import { WalletSubscriptionService } from "../../../src/services/implementation/user/subscription/WalletSubscriptionService";
import { CheckoutService } from "../../../src/services/implementation/user/subscription/CheckoutService";
import { EventService } from "../../../src/services/implementation/user/dashboard/event.service";
import { FileService } from "../../../src/services/implementation/user/dashboard/file.service";
import { EventMapper } from "../../../src/services/implementation/user/dashboard/eventMapper.service";
import { PaymentService } from "../../../src/services/implementation/user/explore/payment.service";
import { BookingService } from "../../../src/services/implementation/user/explore/booking.service";
import { UserAchievementService } from "../../../src/services/implementation/user/achievements/achivements.service";
import { ProfileUserService } from "../../../src/services/implementation/user/profile/ProfileUser.service";
import { ProfileBookingService } from "../../../src/services/implementation/user/profile/ProfileBooking.service";
import { ProfileWalletService } from "../../../src/services/implementation/user/profile/ProfileWallet.service";
import { ProfileEventService } from "../../../src/services/implementation/user/profile/ProfileEvent.service";
import { UserAuthService } from "../../../src/services/implementation/user/auth/UserAuthService";
import { StripeProvider } from "../../../src/utils/stripeProvider";
import { ChatService } from "../../../src/services/implementation/user/chat/chat.service";

// -- Admin Services --
import { AdminAuthService } from "../../../src/services/implementation/admin/admin.auth.service";
import { CouponService } from "../../../src/services/implementation/admin/admin.coupon.service";
import { AdminEventsService } from "../../../src/services/implementation/admin/admin.events.service";
import { AdminUsersService } from "../../../src/services/implementation/admin/admin.users.service";
import { AchievementService } from "../../../src/services/implementation/admin/admin.achievements";
import { FinanceService } from "../../../src/services/implementation/admin/admin.revenue.service";
import { RevenueDistributionService } from "../../../src/services/implementation/admin/distribution.service";
import { RevenueDistributionCronService } from "../../../src/services/implementation/cronjob/revenue.distribution";
import { AdminSubscriptionService } from "../../../src/services/implementation/admin/admin.subscription.service";
import { SubscriptionPlanService } from "../../../src/services/implementation/admin/SubscriptionPlan.service";
import { DashboardService } from "../../../src/services/implementation/admin/admin.dashboard";

export function registerServices() {
  // User services
  container.register("AuthService", { useClass: AuthService });
  container.register("UserAuthService", { useClass: UserAuthService });
  container.register("OTPService", { useClass: OTPService });
  container.register("PasswordService", { useClass: PasswordService });
  container.register("EmailService", { useClass: EmailService });
  container.register("FirebaseAuthService", { useClass: FirebaseAuthService });
  container.register("TokenService", { useClass: TokenService });
  container.register("ExploreService", { useClass: ExploreService });
  container.register("SubscriptionQueryService", { useClass: SubscriptionQueryService });
  container.register("WalletSubscriptionService", { useClass: WalletSubscriptionService });
  container.register("CheckoutService", { useClass: CheckoutService });
  container.register("EventService", { useClass: EventService });
  container.register("FileService", { useClass: FileService });
  container.register("EventMapper", { useClass: EventMapper });
  container.register("PaymentService", { useClass: PaymentService });
  container.register("BookingService", { useClass: BookingService });
  container.register("UserAchievementService", { useClass: UserAchievementService });
  container.register("ProfileUserService", { useClass: ProfileUserService });
  container.register("ProfileBookingService", { useClass: ProfileBookingService });
  container.register("ProfileWalletService", { useClass: ProfileWalletService });
  container.register("ProfileEventService", { useClass: ProfileEventService });
  container.register("UserAuthService", { useClass: UserAuthService });
  container.register("StripeProvider", { useClass: StripeProvider });
  container.register("ChatService", { useClass: ChatService });

  // Admin services
  container.register("AdminAuthService", { useClass: AdminAuthService });
  container.register("CouponService", { useClass: CouponService });
  container.register("AdminEventsService", { useClass: AdminEventsService });
  container.register("AdminUsersService", { useClass: AdminUsersService });
  container.register("AchievementService", { useClass: AchievementService });
  container.register("FinanceService", { useClass: FinanceService });
  container.register("RevenueDistributionService", { useClass: RevenueDistributionService });
  container.register("RevenueDistributionCronService", { useClass: RevenueDistributionCronService });
  container.register("AdminSubscriptionService", { useClass: AdminSubscriptionService });
  container.register("SubscriptionPlanService", { useClass: SubscriptionPlanService });
  container.register('DashboardService', { useClass: DashboardService });
}
