import { DirectionEnum } from "@/shared";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	getPersistedPageSize,
	usePersistedPageSize,
} from "@/shared/lib/hooks/use-persisted-page-size";

const CONTEXTS_TABLE_ID = "contexts-list";

export type ContextsSortableColumn = "createdAt" | "updatedAt";

export type ContextsFilter = {
	search?: string;
	orderBy?: ContextsSortableColumn;
	orderDirection?: DirectionEnum;
	limit?: number;
	after?: string;
	before?: string;
	nextCursor?: string;
	previousCursor?: string;
};

export interface ContextsUrlState {
	filterValues: ContextsFilter;
	handleFiltersChange: (filter: Partial<ContextsFilter>) => void;
	resetFilters: () => void;
	toggleSort: (column: ContextsSortableColumn) => void;
	handleNext: () => void;
	handlePrevious: () => void;
	handleFirst: () => void;
	handlePageSizeChange: (newSize: number) => void;
}

const DEFAULT_LIMIT = getPersistedPageSize(CONTEXTS_TABLE_ID, 10);

export const useContextsUrlState = (): ContextsUrlState => {
	const searchState = useSearch({ strict: false }) as Record<string, string | undefined>;
	const navigate = useNavigate();
	const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
	const [previousCursor, setPreviousCursor] = useState<string | undefined>(
		undefined,
	);
	const { setPageSize: setPersistedPageSize } = usePersistedPageSize({
		tableId: CONTEXTS_TABLE_ID,
		defaultPageSize: 10,
	});

	const filterValues: ContextsFilter = useMemo(() => {
		const searchVal = (searchState.search as string) || "";
		const orderBy =
			((searchState.orderBy as string) as ContextsSortableColumn) || undefined;
		const orderDirection =
			((searchState.orderDirection as string) as DirectionEnum) || undefined;
		const limit = searchState.limit
			? Number(searchState.limit)
			: DEFAULT_LIMIT;
		const urlAfter = (searchState.after as string) || undefined;
		const urlBefore = (searchState.before as string) || undefined;

		return {
			search: searchVal || undefined,
			orderBy,
			orderDirection,
			limit,
			after: urlAfter,
			before: urlBefore,
			nextCursor,
			previousCursor,
		};
	}, [searchState, nextCursor, previousCursor]);

	const toggleSort = useCallback(
		(column: ContextsSortableColumn) => {
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
		(filter: Partial<ContextsFilter>) => {
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

					if ("search" in filter) {
						if (filter.search) {
							newSearch.search = filter.search;
						} else {
							delete newSearch.search;
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
				delete newSearch.search;
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
				delete newSearch.after;
				delete newSearch.before;
				return newSearch;
			}) as never,
		});
	}, [navigate]);

	const handlePageSizeChange = useCallback(
		(newSize: number) => {
			setPersistedPageSize(newSize);
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };
					newSearch.limit = newSize.toString();
					delete newSearch.after;
					delete newSearch.before;
					return newSearch;
				}) as never,
			});
		},
		[navigate, setPersistedPageSize],
	);

	return {
		filterValues,
		handleFiltersChange,
		resetFilters,
		toggleSort,
		handleNext,
		handlePrevious,
		handleFirst,
		handlePageSizeChange,
	};
};
