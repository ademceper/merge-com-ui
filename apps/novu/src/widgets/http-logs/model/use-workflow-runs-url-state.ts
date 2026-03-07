import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ActivityFilters } from "@/entities/activity/api/activity";

export const defaultWorkflowRunsFilter: ActivityFilters = {
	channels: [],
	subscriberId: "",
	workflows: [],
};

// TODO: Consider merging this hook with useActivityUrlState/useSubscribersUrlState to reduce code duplication
type WorkflowRunsUrlState = {
	filterValues: ActivityFilters;
	handleFiltersChange: (filters: ActivityFilters) => void;
	resetFilters: () => void;
};

export function useWorkflowRunsUrlState(): WorkflowRunsUrlState {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const navigate = useNavigate();

	const filterValues = useMemo(() => {
		const rawChannels = search.channels;
		const channels = Array.isArray(rawChannels) ? rawChannels as string[] : rawChannels ? [String(rawChannels)] : [];
		const subscriberId = search.subscriberId ? String(search.subscriberId) : "";
		const rawWorkflows = search.workflows;
		const workflows = Array.isArray(rawWorkflows) ? rawWorkflows as string[] : rawWorkflows ? [String(rawWorkflows)] : [];

		return {
			channels,
			subscriberId,
			workflows,
		};
	}, [search]);

	const handleFiltersChange = useCallback(
		(filters: ActivityFilters) => {
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const next = { ...prev };

					delete next.channels;
					if (filters.channels && filters.channels.length > 0) {
						next.channels = filters.channels;
					}

					if (filters.subscriberId) {
						next.subscriberId = filters.subscriberId;
					} else {
						delete next.subscriberId;
					}

					delete next.workflows;
					if (filters.workflows && filters.workflows.length > 0) {
						next.workflows = filters.workflows;
					}

					return next;
				}) as never,
			});
		},
		[navigate],
	);

	const resetFilters = useCallback(() => {
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const next = { ...prev };
				delete next.channels;
				delete next.workflows;
				delete next.subscriberId;
				return next;
			}) as never,
		});
	}, [navigate]);

	return {
		filterValues,
		handleFiltersChange,
		resetFilters,
	};
}
