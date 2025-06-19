export class DashboardStatsDto {
  totalCustomers: number;
  customerGrowth: number;
  activeEvents: number;
  eventGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  ticketsSold: number;
  ticketsGrowth: number;

  constructor(data: {
    totalCustomers: number;
    customerGrowth: number;
    activeEvents: number;
    eventGrowth: number;
    totalRevenue: number;
    revenueGrowth: number;
    ticketsSold: number;
    ticketsGrowth: number;
  }) {
    this.totalCustomers = data.totalCustomers;
    this.customerGrowth = data.customerGrowth;
    this.activeEvents = data.activeEvents;
    this.eventGrowth = data.eventGrowth;
    this.totalRevenue = data.totalRevenue;
    this.revenueGrowth = data.revenueGrowth;
    this.ticketsSold = data.ticketsSold;
    this.ticketsGrowth = data.ticketsGrowth;
  }
}

export class ChartDatasetDto {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;

  constructor(data: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }) {
    this.label = data.label;
    this.data = data.data;
    this.backgroundColor = data.backgroundColor;
    this.borderColor = data.borderColor;
    this.borderWidth = data.borderWidth;
  }
}

export class RevenueChartDto {
  labels: string[];
  datasets: ChartDatasetDto[];

  constructor(data: {
    labels: string[];
    datasets: any[];
  }) {
    this.labels = data.labels;
    this.datasets = data.datasets.map(dataset => new ChartDatasetDto(dataset));
  }
}

export class UserRegistrationChartDto {
  labels: string[];
  datasets: ChartDatasetDto[];

  constructor(data: {
    labels: string[];
    datasets: any[];
  }) {
    this.labels = data.labels;
    this.datasets = data.datasets.map(dataset => new ChartDatasetDto(dataset));
  }
}

export class RecentTransactionDto {
  type: string;
  amount: string;
  icon: string;
  isPositive: boolean;
  timestamp: string;
  description: string;

  constructor(data: {
    type: string;
    amount: string;
    icon: string;
    isPositive: boolean;
    timestamp: string;
    description: string;
  }) {
    this.type = data.type;
    this.amount = data.amount;
    this.icon = data.icon;
    this.isPositive = data.isPositive;
    this.timestamp = data.timestamp;
    this.description = data.description;
  }
}

export class SubscriptionPlanDto {
  name: string;
  users: number;
  percentage: number;
  icon: string;
  planId: string;

  constructor(data: {
    name: string;
    users: number;
    percentage: number;
    icon: string;
    planId: string;
  }) {
    this.name = data.name;
    this.users = data.users;
    this.percentage = data.percentage;
    this.icon = data.icon;
    this.planId = data.planId;
  }
}

export class RecentActivityDto {
  title: string;
  timeAgo: string;
  icon: string;
  userId: any;
  activityType: string;
  timestamp: string;
  eventId?: any;

  constructor(data: {
    title: string;
    timeAgo: string;
    icon: string;
    userId: any;
    activityType: string;
    timestamp: string;
    eventId?: any;
  }) {
    this.title = data.title;
    this.timeAgo = data.timeAgo;
    this.icon = data.icon;
    this.userId = data.userId;
    this.activityType = data.activityType;
    this.timestamp = data.timestamp;
    if (data.eventId) {
      this.eventId = data.eventId;
    }
  }
}

export class EventOrganizerDto {
  id: string;
  name: string;
  image: string;

  constructor(data: {
    id: string;
    name: string;
    image: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.image = data.image;
  }
}

export class UpcomingEventDto {
  _id: any;
  title: string;
  date: Date;
  location: string;
  organizer: EventOrganizerDto;
  ticketsSold: number;
  image: string;

  constructor(data: {
    id: any;
    title: string;
    date: Date;
    location: string;
    organizer: {
      id: string;
      name: string;
      image: string;
    };
    ticketsSold: number;
    image: string;
  }) {
    this._id = data.id; // Keeping _id as requested
    this.title = data.title;
    this.date = data.date;
    this.location = data.location;
    this.organizer = new EventOrganizerDto(data.organizer);
    this.ticketsSold = data.ticketsSold;
    this.image = data.image;
  }
}