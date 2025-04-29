import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../../src/repositories/user.repository";
import { AuthRepository } from "../../src/repositories/auth.repository";
import { AuthService } from "../../src/services/implementation/user/auth.service";
import { AuthController } from "../../src/controllers/implementation/user/auth.controller";
import { DashboardController } from "../../src/controllers/implementation/user/dashboard.controller";
import { ExploreController } from "../../src/controllers/implementation/user/explore.controller";
import { ProfileController } from "../../src/controllers/implementation/user/profile.controller";
import { BookingRepository } from "../../src/repositories/booking.repository";
import { CouponRepository } from "../../src/repositories/coupon.repository";
import { DashboardRepository } from "../../src/repositories/event.repository";
import { VerificationRepository } from "../../src/repositories/verification.repository";
import { WalletRepository } from "../../src/repositories/wallet.repository";
import { ProfileService } from "../../src/services/implementation/user/profile.service";
import { ExploreService } from "../../src/services/implementation/user/explore.service";
import { DashboardService } from "../../src/services/implementation/user/dashboard.service";
import { BookingsModel } from "../../src/models/BookingModel";
import { AdminAuthService } from "../../src/services/implementation/admin/admin.auth.service";
import { CouponService } from "../../src/services/implementation/admin/admin.coupon.service";
import { AdminEventsService } from "../../src/services/implementation/admin/admin.events.service";
import { AdminUsersService } from "../../src/services/implementation/admin/admin.users.service";
import { AdminAuthController } from "../../src/controllers/implementation/admin/admin.auth.controller";
import { CouponController } from "../../src/controllers/implementation/admin/admin.coupon.controller";
import { AdminEventsController } from "../../src/controllers/implementation/admin/admin.events.controller";
import { AdminUsersController } from "../../src/controllers/implementation/admin/admin.users.controller";
import { AchievementRepository } from "../../src/repositories/achievements.repository";
import { AchievementService } from "../../src/services/implementation/admin/admin.achievements";
import { AchievementController } from "../../src/controllers/implementation/admin/admin.achievements.controller";
import { FinanceService } from "../../src/services/implementation/admin/admin.revenue.service";
import { FinanceRepository } from "../../src/repositories/finance.repository";
import { WalletModel } from "../../src/models/WalletModel";
import { RevenueDistributionModel } from "../../src/models/RevenueModal";
import { RevenueDistributionRepository } from "../../src/repositories/revenue.repository";
import { RevenueDistributionService } from "../../src/services/implementation/admin/distribution.service";
import { RevenueDistributionCronService } from "../../src/services/implementation/cronjob/revenue.distribution";
import { RevenueDistributionController } from "../../src/controllers/implementation/admin/admin.distribution.controller";
import { EventModel } from "../../src/models/EventModel";
import { Logger } from "../../src/utils/logger";
import { UserAchievementRepository } from "../../src/repositories/badge.repository";
import { UserAchievementService } from "../../src/services/implementation/user/achievements/achivements.service";

// Register repositories and services directly with their string token as the identifier
container.register("UserRepository", { useClass: UserRepository });
container.register("AuthRepository", { useClass: AuthRepository });
container.register("BookingRepository", { useClass: BookingRepository });
container.register("CouponRepository", { useClass: CouponRepository });
container.register("DashboardRepository", { useClass: DashboardRepository });
container.register("VerificationRepository", { useClass: VerificationRepository });
container.register("WalletRepository", { useClass: WalletRepository });
container.register("AchievementRepository",{useClass: AchievementRepository})
container.register("FinanceRepository", { useClass: FinanceRepository });
container.register("RevenueDistributionRepository", { useClass: RevenueDistributionRepository });
container.register("UserAchievementRepository", { useClass: UserAchievementRepository });




//SERVICES
//---user---
container.register("AuthService", { useClass: AuthService });
container.register("DashboardService", { useClass: DashboardService });
container.register("ExploreService", { useClass: ExploreService });
container.register("ProfileService", { useClass: ProfileService });
container.register("UserAchievementService", { useClass: UserAchievementService });


//---admin---
container.register("AdminAuthService",{useClass:AdminAuthService})
container.register("CouponService",{useClass:CouponService})
container.register("AdminEventsService",{useClass:AdminEventsService})
container.register("AdminUsersService",{useClass:AdminUsersService})
container.register("AchievementService",{useClass:AchievementService })
container.register("FinanceService", {useClass: FinanceService });
container.register("RevenueDistributionService",  { useClass: RevenueDistributionService } );
container.register("RevenueDistributionCronService", { useClass: RevenueDistributionCronService });




//CONRTOLLERS
//----user----
container.register("AuthController", { useClass: AuthController });
container.register("DashboardController", { useClass: DashboardController });
container.register("ExploreController", { useClass: ExploreController });
container.register("ProfileController", { useClass: ProfileController });



//----admin----
container.register("AdminAuthController", { useClass: AdminAuthController });
container.register("CouponController", { useClass: CouponController });
container.register("AdminEventsController", { useClass: AdminEventsController });
container.register("AdminUsersController", { useClass: AdminUsersController });
container.register("AchievementController",{useClass:AchievementController})
container.register("RevenueDistributionController", { useClass: RevenueDistributionController });



container.register("BookingModel", { useValue: BookingsModel });
container.register("WalletModel", { useValue: WalletModel });
container.register("RevenueDistributionModel", { useValue: RevenueDistributionModel });
container.register("EventModel", { useValue: EventModel });


container.register("Logger", { useClass: Logger });





export { container };
