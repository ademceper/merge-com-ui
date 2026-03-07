import { DirectionEnum } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";
import {
	getPersistedPageSize,
	usePersistedPageSize,
} from "@/shared/lib/hooks/use-persisted-page-size";
import { QueryKeys } from "@/shared/lib/query-keys";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

const SUBSCRIBERS_TABLE_ID = "subscribers-list";

export type SubscribersSortableColumn = "_id" | "updatedAt";
export interface SubscribersFilter {
	email?: string;
	phone?: string;
	name?: string;
	subscriberId?: string;
	limit?: number;
	after?: string;
	before?: string;
	orderBy?: SubscribersSortableColumn;
	orderDirection?: DirectionEnum;
}

export const defaultSubscribersFilter: Required<SubscribersFilter> = {
	email: "",
	phone: "",
	name: "",
	subscriberId: "",
	limit: getPersistedPageSize(SUBSCRIBERS_TABLE_ID, 10),
	after: "",
	before: "",
	orderBy: "_id",
	orderDirection: DirectionEnum.DESC,
};

export interface SubscribersUrlState {
	filterValues: SubscribersFilter;
	handleFiltersChange: (data: SubscribersFilter) => void;
	resetFilters: () => void;
	toggleSort: (column: SubscribersSortableColumn) => void;
	handleNext: () => void;
	handlePrevious: () => void;
	handleFirst: () => void;
	handleNavigationAfterDelete: (afterCursor: string) => void;
	handlePageSizeChange: (newSize: number) => void;
}

type UseSubscribersUrlStateProps = {
	after?: string | null;
	before?: string | null;
	debounceMs?: number;
};

export function useSubscribersUrlState(
	props: UseSubscribersUrlStateProps = {},
): SubscribersUrlState {
	const { after, before, debounceMs = 300 } = props;
	const search = useSearch({ strict: false }) as Record<string, string | undefined>;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { setPageSize: setPersistedPageSize } = usePersistedPageSize({
		tableId: SUBSCRIBERS_TABLE_ID,
		defaultPageSize: 10,
	});
	const { currentEnvironment } = useEnvironment();
	const location = useLocation();
	const filterValues = useMemo(
		() => ({
			email: (search.email as string) || "",
			phone: (search.phone as string) || "",
			name: (search.name as string) || "",
			subscriberId: (search.subscriberId as string) || "",
			limit: parseInt(
				(search.limit as string) || defaultSubscribersFilter.limit.toString(),
				10,
			),
			after: (search.after as string) || "",
			before: (search.before as string) || "",
			orderBy:
				((search.orderBy as string) as SubscribersSortableColumn) ||
				defaultSubscribersFilter.orderBy,
			orderDirection:
				((search.orderDirection as string) as DirectionEnum) ||
				DirectionEnum.DESC,
			includeCursor: (search.includeCursor as string) || "",
		}),
		[search],
	);

	const isUnderSubscribersPage = useMemo(() => {
		const mainSubscribersRoute = buildRoute(ROUTES.SUBSCRIBERS, {
			environmentSlug: currentEnvironment?.slug ?? "",
		});
		return location.pathname.startsWith(mainSubscribersRoute);
	}, [location.pathname, currentEnvironment?.slug]);

	const updateSearchParams = useCallback(
		(data: SubscribersFilter) => {
			const resetPaginationFilterKeys: (keyof SubscribersFilter)[] = [
				"phone",
				"subscriberId",
				"email",
				"name",
				"orderBy",
				"orderDirection",
				"limit",
			];

			const isResetPaginationFilterChanged = resetPaginationFilterKeys.some(
				(key) => data[key] !== filterValues[key],
			);

			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };

					if (isResetPaginationFilterChanged) {
						delete newSearch.after;
						delete newSearch.before;
					}

					Object.entries(data).forEach(([key, value]) => {
						const typedKey = key as keyof SubscribersFilter;
						const defaultValue = defaultSubscribersFilter[typedKey];

						const shouldInclude =
							value &&
							value !== defaultValue &&
							!(
								isResetPaginationFilterChanged &&
								(typedKey === "after" || typedKey === "before")
							);

						if (shouldInclude) {
							newSearch[key] = value.toString();
						} else {
							delete newSearch[key];
						}
					});

					return newSearch;
				}) as never,
				replace: true,
			});
		},
		[navigate, filterValues],
	);

	const resetFilters = useCallback(() => {
		navigate({ search: {}, replace: true });
	}, [navigate]);

	const debouncedUpdateParams = useDebounce(updateSearchParams, debounceMs);

	const toggleSort = useCallback(
		(column: SubscribersSortableColumn) => {
			const newDirection =
				column === filterValues.orderBy
					? filterValues.orderDirection === DirectionEnum.DESC
						? DirectionEnum.ASC
						: DirectionEnum.DESC
					: DirectionEnum.DESC;

			updateSearchParams({
				...filterValues,
				orderDirection: newDirection,
				orderBy: column,
			});
		},
		[updateSearchParams, filterValues],
	);

	const handleNext = () => {
		if (!after) return;

		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.before;
				delete newSearch.includeCursor;
				newSearch.after = after;
				return newSearch;
			}) as never,
		});
	};

	const handlePrevious = () => {
		if (!before) return;

		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.after;
				delete newSearch.includeCursor;
				newSearch.before = before;
				return newSearch;
			}) as never,
		});
	};

	const handleFirst = () => {
		navigate({
			search: ((prev: Record<string, unknown>) => {
				const newSearch = { ...prev };
				delete newSearch.after;
				delete newSearch.before;
				delete newSearch.includeCursor;
				return newSearch;
			}) as never,
			replace: true,
		});
	};

	/**
	 * Handles navigation logic after a subscriber is deleted.
	 * Updates the URL search parameters and invalidates the query cache
	 * for fetching subscribers if necessary.
	 *
	 * @param afterCursor - The cursor pointing to the next set of subscribers
	 *                      after the deletion.
	 *
	 * The function performs the following:
	 * - Checks if the current page is the first page or if the navigation
	 *   would result in staying on the same page.
	 * - If staying on the same page or on the first page, it invalidates
	 *   the query cache for re-fetching subscribers.
	 * - Otherwise, it updates the URL search parameters to navigate to
	 *   the appropriate page after deletion which then re-fetches automatically.
	 */
	const handleNavigationAfterDelete = (afterCursor: string) => {
		const currentIncludeCursor = search.includeCursor as string | undefined;
		const currentAfterCursor = search.after as string | undefined;
		const currentBeforeCursor = search.before as string | undefined;
		const isFirstPage = !currentBeforeCursor && !currentAfterCursor;
		const isSamePage =
			currentIncludeCursor === "true" && currentAfterCursor === afterCursor;

		if (isSamePage || isFirstPage) {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchSubscribers],
			});

			return;
		}

		/**
		 * Why are `afterCursor` and `includeCursor` needed?
		 *
		 * On deletion, switch to `after` pagination to avoid fetching items from the previous page.
		 * Use `includeCursor=true` to ensure the first item (after cursor) is included in the result.
		 * This prevents skipping the first item on the current page after a deletion.
		 *
		 * Example:
		 * - From page 3, click the previous button to go to page 2.
		 * - Page 2 initially has items with IDs: 11 → 20 (before cursor = 21).
		 * - After deleting item 12:
		 *   - Remove the `before` cursor from the URL and add the `after` cursor
		 *     (set to the first element in the list).
		 *   - Without `includeCursor`: Page 2 → 13 → 20, 21 ❌ (skips item 11).
		 *   - With `includeCursor`: Page 2 → 11, 13 → 20, 21 ✅ (includes item 11).
		 */
		const updatedSearch = (prev: Record<string, unknown>) => {
			const newSearch = { ...prev };
			newSearch.after = afterCursor;
			newSearch.includeCursor = "true";
			/**
			 * Why delete the `before` cursor?
			 * - When using `before` pagination, the query fetches items *before* the cursor, which can
			 *   include items from the previous page.
			 * - After deleting an item, keeping the `before` cursor causes the page to incorrectly
			 *   include an item from the previous page.
			 * - Deleting the `before` cursor and switching to `after` pagination ensures that the
			 *   next item (from the current page or beyond) is fetched instead.
			 */
			delete newSearch.before;
			return newSearch;
		};

		if (isUnderSubscribersPage) {
			navigate({
				to: buildRoute(ROUTES.SUBSCRIBERS, { environmentSlug: currentEnvironment?.slug ?? "" }),
				search: updatedSearch as never,
				replace: true,
			});
		} else {
			navigate({
				search: updatedSearch as never,
				replace: true,
			});
		}
	};

	const handlePageSizeChange = useCallback(
		(newSize: number) => {
			setPersistedPageSize(newSize);
			updateSearchParams({
				...filterValues,
				limit: newSize,
			});
		},
		[updateSearchParams, filterValues, setPersistedPageSize],
	);

	return {
		filterValues,
		handleFiltersChange: debouncedUpdateParams,
		resetFilters,
		toggleSort,
		handleNext,
		handlePrevious,
		handleFirst,
		handleNavigationAfterDelete,
		handlePageSizeChange,
	};
}
