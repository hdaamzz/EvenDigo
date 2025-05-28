import { container } from "tsyringe";
import { UserRepository } from "../../../src/repositories/implementation/user.repository";
import { AuthRepository } from "../../../src/repositories/implementation/auth.repository";
import { BookingRepository } from "../../../src/repositories/implementation/booking.repository";
import { CouponRepository } from "../../../src/repositories/implementation/coupon.repository";
import { EventRepository } from "../../../src/repositories/implementation/event.repository";
import { VerificationRepository } from "../../../src/repositories/implementation/verification.repository";
import { WalletRepository } from "../../../src/repositories/implementation/wallet.repository";
import { AchievementRepository } from "../../../src/repositories/implementation/achievements.repository";
import { FinanceRepository } from "../../../src/repositories/implementation/finance.repository";
import { RevenueDistributionRepository } from "../../../src/repositories/implementation/revenue.repository";
import { UserAchievementRepository } from "../../../src/repositories/implementation/badge.repository";
import { SubscriptionRepository } from "../../repositories/implementation/subscription.repository";
import { SubscriptionPlanRepository } from "../../../src/repositories/implementation/subscriptionPlan.repository";
import { ChatRepository } from "../../../src/repositories/implementation/chat.repository";

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
}
