import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../../src/repositories/implementation/user.repository";
import { AuthRepository } from "../../src/repositories/implementation/auth.repository";
import { AuthService } from "../../src/services/implementation/user/auth.service";
import { AuthController } from "../controllers/implementation/user/auth/auth.controller";
import { ExploreController } from "../controllers/implementation/user/explore/explore.controller";
import { BookingRepository } from "../../src/repositories/implementation/booking.repository";
import { CouponRepository } from "../../src/repositories/implementation/coupon.repository";
import { VerificationRepository } from "../../src/repositories/implementation/verification.repository";
import { WalletRepository } from "../../src/repositories/implementation/wallet.repository";
import { ProfileService } from "../../src/services/implementation/user/profile.service";
import { ExploreService } from "../services/implementation/user/explore/explore.service";
import { BookingsModel } from "../../src/models/BookingModel";
import { AdminAuthService } from "../../src/services/implementation/admin/admin.auth.service";
import { CouponService } from "../../src/services/implementation/admin/admin.coupon.service";
import { AdminEventsService } from "../../src/services/implementation/admin/admin.events.service";
import { AdminUsersService } from "../../src/services/implementation/admin/admin.users.service";
import { AchievementRepository } from "../../src/repositories/implementation/achievements.repository";
import { AchievementService } from "../../src/services/implementation/admin/admin.achievements";
import { FinanceService } from "../../src/services/implementation/admin/admin.revenue.service";
import { FinanceRepository } from "../../src/repositories/implementation/finance.repository";
import { WalletModel } from "../../src/models/WalletModel";
import { RevenueDistributionModel } from "../../src/models/RevenueModal";
import { RevenueDistributionRepository } from "../../src/repositories/implementation/revenue.repository";
import { RevenueDistributionService } from "../../src/services/implementation/admin/distribution.service";
import { RevenueDistributionCronService } from "../../src/services/implementation/cronjob/revenue.distribution";
import { EventModel } from "../../src/models/EventModel";
import { Logger } from "../../src/utils/logger";
import { UserAchievementRepository } from "../../src/repositories/implementation/badge.repository";
import { UserAchievementService } from "../../src/services/implementation/user/achievements/achivements.service";
import { SubscriptionController } from "../../src/controllers/implementation/user/premium/subscription.controller";
import { SubscriptionRepository } from "../repositories/implementation/subscription.repository";
import { SubscriptionModel } from "../../src/models/user/SubscriptionModal";
import { AdminSubscriptionService } from "../../src/services/implementation/admin/admin.subscription.service";
import { AdminSubscriptionController } from "../../src/controllers/implementation/admin/subscription/admin.subscription.controller";
import { AdminAuthController } from "../../src/controllers/implementation/admin/auth/admin.auth.controller";
import { CouponController } from "../../src/controllers/implementation/admin/coupon/admin.coupon.controller";
import { AdminEventsController } from "../../src/controllers/implementation/admin/event/admin.events.controller";
import { AdminUsersController } from "../../src/controllers/implementation/admin/user/admin.users.controller";
import { AchievementController } from "../../src/controllers/implementation/admin/achievement/admin.achievements.controller";
import { RevenueDistributionController } from "../../src/controllers/implementation/admin/finance/admin.distribution.controller";
import { EventService } from "../../src/services/implementation/user/dashboard/event.service";
import { EventMapper } from "../../src/services/implementation/user/dashboard/eventMapper.service";
import { FileService } from "../../src/services/implementation/user/dashboard/file.service";
import { EventRepository } from "../../src/repositories/implementation/event.repository";
import { DashboardController } from "../../src/controllers/implementation/user/dashboard/dashboard.controller";
import { PaymentService } from "../../src/services/implementation/user/explore/payment.service";
import { BookingService } from "../../src/services/implementation/user/explore/booking.service";
import { SubscriptionQueryService } from "../../src/services/implementation/user/subscription/SubscriptionQueryService";
import { WalletSubscriptionService } from "../../src/services/implementation/user/subscription/WalletSubscriptionService";
import { CheckoutService } from "../../src/services/implementation/user/subscription/CheckoutService";
import { StripeProvider } from "../../src/utils/stripeProvider";
import { ProfileBookingController } from "../../src/controllers/implementation/user/profile/profileBooking.controller";
import { ProfileEventsController } from "../../src/controllers/implementation/user/profile/profileEvents.controller";
import { ProfileWalletController } from "../../src/controllers/implementation/user/profile/profileWallet.controller";
import { ProfileUserController } from "../../src/controllers/implementation/user/profile/profileUser.controller";



container.register("UserRepository", { useClass: UserRepository });
container.register("AuthRepository", { useClass: AuthRepository });
container.register("BookingRepository", { useClass: BookingRepository });
container.register("CouponRepository", { useClass: CouponRepository });
container.register("EventRepository", { useClass: EventRepository });
container.register("VerificationRepository", { useClass: VerificationRepository });
container.register("WalletRepository", { useClass: WalletRepository });
container.register("AchievementRepository", { useClass: AchievementRepository })
container.register("FinanceRepository", { useClass: FinanceRepository });
container.register("RevenueDistributionRepository", { useClass: RevenueDistributionRepository });
container.register("UserAchievementRepository", { useClass: UserAchievementRepository });
container.register("SubscriptionRepository", { useClass: SubscriptionRepository });




//SERVICES
//---user---
container.register("AuthService", { useClass: AuthService });
container.register("ExploreService", { useClass: ExploreService });
container.register("ProfileService", { useClass: ProfileService });
container.register("UserAchievementService", { useClass: UserAchievementService });
container.register("SubscriptionQueryService", { useClass: SubscriptionQueryService });
container.register("WalletSubscriptionService", { useClass: WalletSubscriptionService });
container.register("CheckoutService", { useClass: CheckoutService });
container.register("EventService", { useClass: EventService });
container.register("FileService", { useClass: FileService });
container.register("EventMapper", { useClass: EventMapper });
container.register("PaymentService", { useClass: PaymentService });
container.register("BookingService", { useClass: BookingService });
container.register("StripeProvider", { useClass: StripeProvider });







//---admin---
container.register("AdminAuthService", { useClass: AdminAuthService })
container.register("CouponService", { useClass: CouponService })
container.register("AdminEventsService", { useClass: AdminEventsService })
container.register("AdminUsersService", { useClass: AdminUsersService })
container.register("AchievementService", { useClass: AchievementService })
container.register("FinanceService", { useClass: FinanceService });
container.register("RevenueDistributionService", { useClass: RevenueDistributionService });
container.register("RevenueDistributionCronService", { useClass: RevenueDistributionCronService });
container.register("AdminSubscriptionService", { useClass: AdminSubscriptionService });




//CONRTOLLERS
//----user----
container.register("AuthController", { useClass: AuthController });
container.register("DashboardController", { useClass: DashboardController });
container.register("ExploreController", { useClass: ExploreController });
container.register("SubscriptionController", { useClass: SubscriptionController });
container.register("ProfileBookingController", { useClass: ProfileBookingController });
container.register("ProfileEventsController", { useClass: ProfileEventsController });
container.register("ProfileWalletController", { useClass: ProfileWalletController });
container.register("ProfileUserController", { useClass: ProfileUserController });





//----admin----
container.register("AdminAuthController", { useClass: AdminAuthController });
container.register("CouponController", { useClass: CouponController });
container.register("AdminEventsController", { useClass: AdminEventsController });
container.register("AdminUsersController", { useClass: AdminUsersController });
container.register("AchievementController", { useClass: AchievementController })
container.register("RevenueDistributionController", { useClass: RevenueDistributionController });
container.register("AdminSubscriptionController", { useClass: AdminSubscriptionController });




container.register("BookingModel", { useValue: BookingsModel });
container.register("WalletModel", { useValue: WalletModel });
container.register("RevenueDistributionModel", { useValue: RevenueDistributionModel });
container.register("EventModel", { useValue: EventModel });
container.register("SubscriptionModel", { useValue: SubscriptionModel });


container.register("Logger", { useClass: Logger });





export { container };
