import { container } from "tsyringe";
import { UserRepository } from "../../repositories/implementation/user.repository";
import { AuthRepository } from "../../repositories/implementation/auth.repository";
import { BookingRepository } from "../../repositories/implementation/booking.repository";
import { CouponRepository } from "../../repositories/implementation/coupon.repository";
import { EventRepository } from "../../repositories/implementation/event.repository";
import { VerificationRepository } from "../../repositories/implementation/verification.repository";
import { WalletRepository } from "../../repositories/implementation/wallet.repository";
import { AchievementRepository } from "../../repositories/implementation/achievements.repository";
import { FinanceRepository } from "../../repositories/implementation/finance.repository";
import { RevenueDistributionRepository } from "../../repositories/implementation/revenue.repository";
import { UserAchievementRepository } from "../../repositories/implementation/badge.repository";
import { SubscriptionRepository } from "../../repositories/implementation/subscription.repository";
import { SubscriptionPlanRepository } from "../../repositories/implementation/subscriptionPlan.repository";
import { ChatRepository } from "../../repositories/implementation/chat.repository";
import { LiveStreamRepository } from "../../repositories/implementation/livestream.repository";


export function registerRepositories() {
  container.register("UserRepository", { useClass: UserRepository });
  container.register("AuthRepository", { useClass: AuthRepository });
  container.register("BookingRepository", { useClass: BookingRepository });
  container.register("CouponRepository", { useClass: CouponRepository });
  container.register("EventRepository", { useClass: EventRepository });
  container.register("VerificationRepository", { useClass: VerificationRepository });
  container.register("WalletRepository", { useClass: WalletRepository });
  container.register("AchievementRepository", { useClass: AchievementRepository });
  container.register("FinanceRepository", { useClass: FinanceRepository });
  container.register("RevenueDistributionRepository", { useClass: RevenueDistributionRepository });
  container.register("UserAchievementRepository", { useClass: UserAchievementRepository });
  container.register("SubscriptionRepository", { useClass: SubscriptionRepository });
  container.register("SubscriptionPlanRepository", { useClass: SubscriptionPlanRepository });
  container.register("ChatRepository", { useClass: ChatRepository });
  container.register("LiveStreamRepository", { useClass: LiveStreamRepository });

}
