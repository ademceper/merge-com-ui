import type { ChannelTypeEnum, SeverityLevelEnum } from "@/shared";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ActivityFilters } from "@/entities/activity/api/activity";
import { DEFAULT_DATE_RANGE } from "@/pages/activity/ui/constants";
import type { ActivityFiltersData, ActivityUrlState } from "@/shared/model/activity";

function parseFilters(searchParams: URLSearchParams): ActivityFilters {
	const result: ActivityFilters = {};

	const channels = searchParams.get("channels")?.split(",").filter(Boolean);

	if (channels?.length) {
		result.channels = channels as ChannelTypeEnum[];
	}

	const workflows = searchParams.get("workflows")?.split(",").filter(Boolean);

	if (workflows?.length) {
		result.workflows = workflows;
	}

	const transactionId = searchParams.get("transactionId");
	const transactionIds = searchParams.getAll("transactionId");

	if (transactionIds.length > 1) {
		result.transactionId = transactionIds.join(",");
	} else if (transactionId) {
		result.transactionId = transactionId;
	}

	const subscriberId = searchParams.get("subscriberId");

	if (subscriberId) {
		result.subscriberId = subscriberId;
	}

	const topicKey = searchParams.get("topicKey");

	if (topicKey) {
		result.topicKey = topicKey;
	}

	const subscriptionId = searchParams.get("subscriptionId");

	if (subscriptionId) {
		result.subscriptionId = subscriptionId;
	}

	const dateRange = searchParams.get("dateRange");
	result.dateRange = dateRange || DEFAULT_DATE_RANGE;

	const severity = searchParams.get("severity")?.split(",").filter(Boolean);
	if (severity?.length) {
		result.severity = severity as SeverityLevelEnum[];
	}

	const contextKeys = searchParams.getAll("contextKeys");

	if (contextKeys.length > 0) {
		result.contextKeys = contextKeys;
	}

	return result;
}

function parseFilterValues(searchParams: URLSearchParams): ActivityFiltersData {
	const transactionIds = searchParams.getAll("transactionId");

	return {
		dateRange: searchParams.get("dateRange") || DEFAULT_DATE_RANGE,
		channels:
			(searchParams
				.get("channels")
				?.split(",")
				.filter(Boolean) as ChannelTypeEnum[]) || [],
		workflows: searchParams.get("workflows")?.split(",").filter(Boolean) || [],
		transactionId: transactionIds.length > 0 ? transactionIds.join(", ") : "",
		subscriberId: searchParams.get("subscriberId") || "",
		topicKey: searchParams.get("topicKey") || "",
		subscriptionId: searchParams.get("subscriptionId") || "",
		severity:
			(searchParams
				.get("severity")
				?.split(",")
				.filter(Boolean) as SeverityLevelEnum[]) || [],
		contextKeys: searchParams.getAll("contextKeys"),
	};
}

export function useActivityUrlState(): ActivityUrlState & {
	handleActivitySelect: (activityItemId: string) => void;
	handleFiltersChange: (data: ActivityFiltersData) => void;
} {
	const search = useSearch({ strict: false }) as Record<string, string | string[]>;
	const navigate = useNavigate();
	const searchParams = useMemo(() => {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(search)) {
			if (Array.isArray(value)) {
				for (const v of value) {
					params.append(key, v);
				}
			} else if (value !== undefined && value !== null) {
				params.set(key, String(value));
			}
		}
		return params;
	}, [search]);
	const activityItemId = searchParams.get("activityItemId");

	const handleActivitySelect = useCallback(
		(newActivityItemId: string) => {
			const newParams = new URLSearchParams(searchParams);

			if (newActivityItemId === activityItemId) {
				newParams.delete("activityItemId");
			} else {
				newParams.set("activityItemId", newActivityItemId);
			}

			navigate({
				search: Object.fromEntries(newParams),
				replace: true,
			});
		},
		[activityItemId, searchParams, navigate],
	);

	const handleFiltersChange = useCallback(
		(data: ActivityFiltersData) => {
			const newSearch: Record<string, string | string[]> = {};

			// First, preserve the activity selection if it exists
			if (activityItemId) {
				newSearch.activityItemId = activityItemId;
			}

			// Then set the filter values
			if (data.channels?.length) {
				newSearch.channels = data.channels.join(",");
			}

			if (data.workflows?.length) {
				newSearch.workflows = data.workflows.join(",");
			}

			if (data.transactionId) {
				// Parse comma-delimited string into array for backend
				const transactionIds = data.transactionId
					.split(",")
					.map((id) => id.trim())
					.filter(Boolean);

				if (transactionIds.length > 1) {
					newSearch.transactionId = transactionIds;
				} else {
					newSearch.transactionId = data.transactionId;
				}
			}

			if (data.subscriberId) {
				newSearch.subscriberId = data.subscriberId;
			}

			if (data.topicKey) {
				newSearch.topicKey = data.topicKey;
			}

			if (data.subscriptionId) {
				newSearch.subscriptionId = data.subscriptionId;
			}

			if (data.dateRange && data.dateRange !== DEFAULT_DATE_RANGE) {
				newSearch.dateRange = data.dateRange;
			}

			if (searchParams.get("page")) {
				newSearch.page = searchParams.get("page") || "0";
			}

			if (data.severity?.length) {
				newSearch.severity = data.severity.join(",");
			}

			if (data.contextKeys?.length) {
				newSearch.contextKeys = data.contextKeys;
			}

			navigate({
				search: newSearch,
				replace: true,
			});
		},
		[activityItemId, navigate, searchParams],
	);

	const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
	const filterValues = useMemo(
		() => parseFilterValues(searchParams),
		[searchParams],
	);

	return {
		activityItemId,
		filters,
		filterValues,
		handleActivitySelect,
		handleFiltersChange,
	};
}
