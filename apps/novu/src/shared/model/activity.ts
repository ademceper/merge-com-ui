import type { ChannelTypeEnum, SeverityLevelEnum } from "@/shared";
import type { ActivityFilters } from "@/entities/activity/api/activity";

export type ActivityFiltersData = {
	dateRange: string;
	channels: ChannelTypeEnum[];
	workflows: string[];
	transactionId: string;
	subscriberId: string;
	topicKey: string;
	subscriptionId: string;
	severity: SeverityLevelEnum[];
	contextKeys: string[];
};

export type ActivityUrlState = {
	activityItemId: string | null;
	filters: ActivityFilters;
	filterValues: ActivityFiltersData;
};
