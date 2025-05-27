import { container } from "tsyringe";
import { BookingsModel } from "../../../src/models/BookingModel";
import { WalletModel } from "../../../src/models/WalletModel";
import { RevenueDistributionModel } from "../../../src/models/RevenueModal";
import { EventModel } from "../../../src/models/EventModel";
import { SubscriptionModel } from "../../models/SubscriptionModal";

export function registerModels() {
  container.register("BookingModel", { useValue: BookingsModel });
  container.register("WalletModel", { useValue: WalletModel });
  container.register("RevenueDistributionModel", { useValue: RevenueDistributionModel });
  container.register("EventModel", { useValue: EventModel });
  container.register("SubscriptionModel", { useValue: SubscriptionModel });
}
