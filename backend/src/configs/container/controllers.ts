import { container } from "tsyringe";

// User Controllers
import { AuthController } from "../../controllers/implementation/user/auth/auth.controller";
import { DashboardController } from "../../../src/controllers/implementation/user/dashboard/dashboard.controller";
import { ExploreController } from "../../controllers/implementation/user/explore/explore.controller";
import { SubscriptionController } from "../../../src/controllers/implementation/user/premium/subscription.controller";
import { ProfileBookingController } from "../../../src/controllers/implementation/user/profile/profileBooking.controller";
import { ProfileEventsController } from "../../../src/controllers/implementation/user/profile/profileEvents.controller";
import { ProfileWalletController } from "../../../src/controllers/implementation/user/profile/profileWallet.controller";
import { ProfileUserController } from "../../../src/controllers/implementation/user/profile/profileUser.controller";
import { PersonalChatController } from "../../../src/controllers/implementation/user/chat/chat-management.controller";
import { PersonalMessageController } from "../../../src/controllers/implementation/user/chat/message.controller";
// import { EventChatController } from "../../../src/controllers/implementation/user/chat/event-chat.controller";


// Admin Controllers
import { AdminAuthController } from "../../../src/controllers/implementation/admin/auth/admin.auth.controller";
import { CouponController } from "../../../src/controllers/implementation/admin/coupon/admin.coupon.controller";
import { AdminEventsController } from "../../../src/controllers/implementation/admin/event/admin.events.controller";
import { AdminUsersController } from "../../../src/controllers/implementation/admin/user/admin.users.controller";
import { AchievementController } from "../../../src/controllers/implementation/admin/achievement/admin.achievements.controller";
import { RevenueDistributionController } from "../../../src/controllers/implementation/admin/finance/admin.distribution.controller";
import { AdminSubscriptionController } from "../../../src/controllers/implementation/admin/subscription/admin.subscription.controller";
import { SubscriptionPlanController } from "../../../src/controllers/implementation/admin/subscription/admin.subscriptionPlan.controller";
import { AdminHomeController } from "../../../src/controllers/implementation/admin/home/admin.home.controller";


export function registerControllers() {
  // User
  container.register("AuthController", { useClass: AuthController });
  container.register("DashboardController", { useClass: DashboardController });
  container.register("ExploreController", { useClass: ExploreController });
  container.register("SubscriptionController", { useClass: SubscriptionController });
  container.register("ProfileBookingController", { useClass: ProfileBookingController });
  container.register("ProfileEventsController", { useClass: ProfileEventsController });
  container.register("ProfileWalletController", { useClass: ProfileWalletController });
  container.register("ProfileUserController", { useClass: ProfileUserController });
  container.register("SubscriptionPlanController", { useClass: SubscriptionPlanController });
  container.register("PersonalChatController", { useClass:  PersonalChatController});
  container.register("PersonalMessageController", { useClass: PersonalMessageController });
  // container.register("EventChatController", { useClass: EventChatController });


  // Admin
  container.register("AdminAuthController", { useClass: AdminAuthController });
  container.register("CouponController", { useClass: CouponController });
  container.register("AdminEventsController", { useClass: AdminEventsController });
  container.register("AdminUsersController", { useClass: AdminUsersController });
  container.register("AchievementController", { useClass: AchievementController });
  container.register("RevenueDistributionController", { useClass: RevenueDistributionController });
  container.register("AdminSubscriptionController", { useClass: AdminSubscriptionController });
  container.register("AdminHomeController", { useClass: AdminHomeController });

}
