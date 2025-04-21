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

// Register repositories and services directly with their string token as the identifier
container.register("UserRepository", { useClass: UserRepository });
container.register("AuthRepository", { useClass: AuthRepository });
container.register("BookingRepository", { useClass: BookingRepository });
container.register("CouponRepository", { useClass: CouponRepository });
container.register("DashboardRepository", { useClass: DashboardRepository });
container.register("VerificationRepository", { useClass: VerificationRepository });
container.register("WalletRepository", { useClass: WalletRepository });
container.register("AchievementRepository",{useClass: AchievementRepository})


//SERVICES
//---user---
container.register("AuthService", { useClass: AuthService });
container.register("DashboardService", { useClass: DashboardService });
container.register("ExploreService", { useClass: ExploreService });
container.register("ProfileService", { useClass: ProfileService });


//---admin---
container.register("AdminAuthService",{useClass:AdminAuthService})
container.register("CouponService",{useClass:CouponService})
container.register("AdminEventsService",{useClass:AdminEventsService})
container.register("AdminUsersService",{useClass:AdminUsersService})
container.register("AchievementService",{useClass:AchievementService })




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



container.register("BookingModel", { useValue: BookingsModel });





export { container };
