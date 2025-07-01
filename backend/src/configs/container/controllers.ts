import { container } from "tsyringe";

// User Controllers
import { AuthController } from "../../controllers/implementation/user/auth/auth.controller";
import { DashboardController } from "../../controllers/implementation/user/dashboard/dashboard.controller";
import { ExploreController } from "../../controllers/implementation/user/explore/explore.controller";
import { SubscriptionController } from "../../controllers/implementation/user/premium/subscription.controller";
import { ProfileBookingController } from "../../controllers/implementation/user/profile/profileBooking.controller";
import { ProfileEventsController } from "../../controllers/implementation/user/profile/profileEvents.controller";
import { ProfileWalletController } from "../../controllers/implementation/user/profile/profileWallet.controller";
import { ProfileUserController } from "../../controllers/implementation/user/profile/profileUser.controller";
import { PersonalChatController } from "../../controllers/implementation/user/chat/chat-management.controller";
import { PersonalMessageController } from "../../controllers/implementation/user/chat/message.controller";
// import { EventChatController } from "../../controllers/implementation/user/chat/event-chat.controller";


// Admin Controllers
import { AdminAuthController } from "../../controllers/implementation/admin/auth/admin.auth.controller";
import { CouponController } from "../../controllers/implementation/admin/coupon/admin.coupon.controller";
import { AdminEventsController } from "../../controllers/implementation/admin/event/admin.events.controller";
import { AdminUsersController } from "../../controllers/implementation/admin/user/admin.users.controller";
import { AchievementController } from "../../controllers/implementation/admin/achievement/admin.achievements.controller";
import { RevenueDistributionController } from "../../controllers/implementation/admin/finance/admin.distribution.controller";
import { AdminSubscriptionController } from "../../controllers/implementation/admin/subscription/admin.subscription.controller";
import { SubscriptionPlanController } from "../../controllers/implementation/admin/subscription/admin.subscriptionPlan.controller";
import { AdminHomeController } from "../../controllers/implementation/admin/home/admin.home.controller";
import { LiveStreamController } from "../../controllers/implementation/user/live/LiveStreamController";


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
  container.register("LiveStreamController", { useClass:  LiveStreamController});

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
