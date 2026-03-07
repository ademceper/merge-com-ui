import { useOrganization } from "@merge-rd/auth";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useFetchSubscription } from "@/shared/lib/hooks/use-fetch-subscription";
import {
	getPersistedPageSize,
	usePersistedPageSize,
} from "@/shared/lib/hooks/use-persisted-page-size";
import { getMaxAvailableLogsDateRange } from "@/shared/lib/logs-filters.utils";

const LOGS_TABLE_ID = "logs-table";

export interface LogsFilters {
	status: string[];
	transactionId: string;
	urlPattern: string;
	createdGte: string; // Timestamp string for creation time filter, defaults to calculated timestamp based on max available range
}

interface LogsUrlState {
	selectedLogId: string | null;
	handleLogSelect: (logId: string) => void;
	currentPage: number;
	limit: number;
	handleNext: () => void;
	handlePrevious: () => void;
	handleFirst: () => void;
	handlePageSizeChange: (newLimit: number) => void;
	filters: LogsFilters;
	handleFiltersChange: (newFilters: LogsFilters) => void;
	clearFilters: () => void;
	hasActiveFilters: boolean;
}

function searchToParams(search: Record<string, unknown>): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(search)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				params.append(key, String(v));
			}
		} else if (value !== undefined && value !== null) {
			params.set(key, String(value));
		}
	}
	return params;
}

export function useLogsUrlState(): LogsUrlState {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const navigate = useNavigate();
	const { organization } = useOrganization();
	const { subscription } = useFetchSubscription();
	const searchParams = useMemo(() => searchToParams(search), [search]);
	const selectedLogId = searchParams.get("selectedLogId");
	const { setPageSize: setPersistedPageSize } = usePersistedPageSize({
		tableId: LOGS_TABLE_ID,
		defaultPageSize: 20,
	});

	const maxAvailableLogsDateRange = useMemo(
		() =>
			getMaxAvailableLogsDateRange({
				organization,
				subscription,
			}),
		[organization, subscription],
	);

	const handleLogSelect = useCallback(
		(logId: string) => {
			const newParams = new URLSearchParams(searchParams);

			if (logId === selectedLogId) {
				newParams.delete("selectedLogId");
			} else {
				newParams.set("selectedLogId", logId);
			}

			navigate({
				search: Object.fromEntries(newParams),
				replace: true,
			});
		},
		[selectedLogId, searchParams, navigate],
	);

	const defaultLimit = getPersistedPageSize(LOGS_TABLE_ID, 20);

	const currentPage = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(
		searchParams.get("limit") || defaultLimit.toString(),
		10,
	);

	const handleNext = useCallback(() => {
		navigate({
			search: {
				...search,
				page: (currentPage + 1).toString(),
			},
		});
	}, [currentPage, navigate, search]);

	const handlePrevious = useCallback(() => {
		navigate({
			search: {
				...search,
				page: (currentPage - 1).toString(),
			},
		});
	}, [currentPage, navigate, search]);

	const handleFirst = useCallback(() => {
		const { page: _page, ...restSearch } = search as Record<string, unknown>;
		navigate({
			search: restSearch,
		});
	}, [navigate, search]);

	const handlePageSizeChange = useCallback(
		(newLimit: number) => {
			setPersistedPageSize(newLimit);
			const { page: _page, ...restSearch } = search as Record<string, unknown>;
			navigate({
				search: {
					...restSearch,
					limit: newLimit.toString(),
				},
			});
		},
		[navigate, search, setPersistedPageSize],
	);

	// Filter state
	const filters = useMemo(
		(): LogsFilters => ({
			status: searchParams.getAll("status"),
			transactionId: searchParams.get("transactionId") || "",
			urlPattern: searchParams.get("urlPattern") || "",
			createdGte: searchParams.get("createdGte") || maxAvailableLogsDateRange, // Default to max available for user's tier
		}),
		[searchParams, maxAvailableLogsDateRange],
	);

	const handleFiltersChange = useCallback(
		(newFilters: LogsFilters) => {
			const { status: _s, transactionId: _t, urlPattern: _u, createdGte: _c, page: _p, ...restSearch } = search as Record<string, unknown>;
			const newSearch: Record<string, unknown> = { ...restSearch };

			if (newFilters.status.length > 0) {
				newSearch.status = newFilters.status;
			}

			if (newFilters.transactionId.trim()) {
				newSearch.transactionId = newFilters.transactionId;
			}

			if (newFilters.createdGte) {
				newSearch.createdGte = newFilters.createdGte;
			}

			if (newFilters.urlPattern.trim()) {
				newSearch.urlPattern = newFilters.urlPattern;
			}

			navigate({
				search: newSearch,
			});
		},
		[navigate, search],
	);

	const clearFilters = useCallback(() => {
		const { status: _s, transactionId: _t, urlPattern: _u, createdGte: _c, page: _p, ...restSearch } = search as Record<string, unknown>;
		navigate({
			search: restSearch,
		});
	}, [navigate, search]);

	const hasActiveFilters = useMemo(() => {
		return (
			filters.status.length > 0 ||
			filters.transactionId.trim() !== "" ||
			filters.createdGte !== maxAvailableLogsDateRange ||
			filters.urlPattern.trim() !== ""
		);
	}, [filters, maxAvailableLogsDateRange]);

	return useMemo(
		() => ({
			selectedLogId,
			handleLogSelect,
			currentPage,
			limit,
			handleNext,
			handlePrevious,
			handleFirst,
			handlePageSizeChange,
			filters,
			handleFiltersChange,
			clearFilters,
			hasActiveFilters,
		}),
		[
			selectedLogId,
			handleLogSelect,
			currentPage,
			limit,
			handleNext,
			handlePrevious,
			handleFirst,
			handlePageSizeChange,
			filters,
			handleFiltersChange,
			clearFilters,
			hasActiveFilters,
		],
	);
}
