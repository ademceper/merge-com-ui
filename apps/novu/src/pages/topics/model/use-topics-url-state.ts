import { DirectionEnum } from "@/shared";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	getPersistedPageSize,
	usePersistedPageSize,
} from "@/shared/lib/hooks/use-persisted-page-size";

const TOPICS_TABLE_ID = "topics-list";

export type TopicsSortableColumn = "_id" | "updatedAt" | "name";

export interface TopicsFilter {
	key?: string;
	name?: string;
	before?: string;
	after?: string;
	orderBy?: TopicsSortableColumn;
	orderDirection?: DirectionEnum;
	limit?: number;
	includeCursor?: boolean;
	nextCursor?: string;
	previousCursor?: string;
}

export interface TopicsUrlState {
	filterValues: TopicsFilter;
	toggleSort: (column: TopicsSortableColumn) => void;
	handleFiltersChange: (filter: Partial<TopicsFilter>) => void;
	resetFilters: () => void;
	handleNext: () => void;
	handlePrevious: () => void;
	handleFirst: () => void;
	handlePageSizeChange: (newSize: number) => void;
}

const DEFAULT_LIMIT = getPersistedPageSize(TOPICS_TABLE_ID, 10);

export const useTopicsUrlState = (): TopicsUrlState => {
	const search = useSearch({ strict: false }) as Record<string, string | undefined>;
	const navigate = useNavigate();
	const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
	const [previousCursor, setPreviousCursor] = useState<string | undefined>(
		undefined,
	);
	const { setPageSize: setPersistedPageSize } = usePersistedPageSize({
		tableId: TOPICS_TABLE_ID,
		defaultPageSize: 10,
	});

	const key = (search.key as string) || "";
	const name = (search.name as string) || "";
	const orderBy =
		((search.orderBy as string) as TopicsSortableColumn) || undefined;
	const orderDirection =
		((search.orderDirection as string) as DirectionEnum) || undefined;
	const limit = search.limit
		? Number(search.limit)
		: DEFAULT_LIMIT;
	const urlAfter = (search.after as string) || undefined;
	const urlBefore = (search.before as string) || undefined;

	const defaultFilterValues: TopicsFilter = useMemo(
		() => ({
			key: key || undefined,
			name: name || undefined,
			orderBy,
			orderDirection,
			limit,
		}),
		[key, name, orderBy, orderDirection, limit],
	);

	const toggleSort = useCallback(
		(column: TopicsSortableColumn) => {
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };
					if (newSearch.orderBy === column) {
						if (newSearch.orderDirection === DirectionEnum.ASC) {
							newSearch.orderDirection = DirectionEnum.DESC;
						} else if (newSearch.orderDirection === DirectionEnum.DESC) {
							delete newSearch.orderBy;
							delete newSearch.orderDirection;
						} else {
							newSearch.orderBy = column;
							newSearch.orderDirection = DirectionEnum.ASC;
						}
					} else {
						newSearch.orderBy = column;
						newSearch.orderDirection = DirectionEnum.ASC;
					}
					return newSearch;
				}) as never,
			});
		},
		[navigate],
	);

	const handleFiltersChange = useCallback(
		(filter: Partial<TopicsFilter>) => {
			// Handle cursor state updates
			if ("nextCursor" in filter) {
				setNextCursor(filter.nextCursor);
			}

			if ("previousCursor" in filter) {
				setPreviousCursor(filter.previousCursor);
			}

			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };

					if ("after" in filter) {
						if (filter.after) {
							newSearch.after = filter.after;
						} else {
							delete newSearch.after;
						}
					}

					if ("before" in filter) {
						if (filter.before) {
							newSearch.before = filter.before;
						} else {
							delete newSearch.before;
						}
					}

					if ("key" in filter) {
						if (filter.key) {
							newSearch.key = filter.key;
						} else {
							delete newSearch.key;
						}
					}

					if ("name" in filter) {
						if (filter.name) {
							newSearch.name = filter.name;
						} else {
							delete newSearch.name;
						}
					}

					return newSearch;
				}) as never,
			});
		},
		[navigate],
	);

	const resetFilters = useCallback(() => {
		setNextCursor(undefined);
		setPreviousCursor(undefined);
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.key;
				delete newSearch.name;
				delete newSearch.before;
				delete newSearch.after;
				return newSearch;
			}) as never,
		});
	}, [navigate]);

	const handleNext = useCallback(() => {
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.before;
				if (nextCursor) {
					newSearch.after = nextCursor;
				}
				return newSearch;
			}) as never,
		});
	}, [nextCursor, navigate]);

	const handlePrevious = useCallback(() => {
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.after;
				if (previousCursor) {
					newSearch.before = previousCursor;
				}
				return newSearch;
			}) as never,
		});
	}, [previousCursor, navigate]);

	const handleFirst = useCallback(() => {
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.before;
				delete newSearch.after;
				return newSearch;
			}) as never,
		});
	}, [navigate]);

	const handlePageSizeChange = useCallback(
		(newSize: number) => {
			setPersistedPageSize(newSize);
			setNextCursor(undefined);
			setPreviousCursor(undefined);
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };
					newSearch.limit = newSize.toString();
					delete newSearch.before;
					delete newSearch.after;
					return newSearch;
				}) as never,
			});
		},
		[navigate, setPersistedPageSize],
	);

	return {
		filterValues: {
			...defaultFilterValues,
			before: urlBefore,
			after: urlAfter,
			nextCursor,
			previousCursor,
		},
		toggleSort,
		handleFiltersChange,
		resetFilters,
		handleNext,
		handlePrevious,
		handleFirst,
		handlePageSizeChange,
	};
};
