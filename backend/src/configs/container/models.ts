import { container } from "tsyringe";
import { BookingsModel } from "../../models/BookingModel";
import { WalletModel } from "../../models/WalletModel";
import { RevenueDistributionModel } from "../../models/RevenueModal";
import { EventModel } from "../../models/EventModel";
import { SubscriptionModel } from "../../models/SubscriptionModal";

export function registerModels() {
  container.register("BookingModel", { useValue: BookingsModel });
  container.register("WalletModel", { useValue: WalletModel });
  container.register("RevenueDistributionModel", { useValue: RevenueDistributionModel });
  container.register("EventModel", { useValue: EventModel });
  container.register("SubscriptionModel", { useValue: SubscriptionModel });
}
