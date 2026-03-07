import { DirectionEnum } from "@/shared";
import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { getPersistedPageSize } from "@/shared/lib/hooks/use-persisted-page-size";

const LAYOUTS_TABLE_ID = "layouts-list";

export type LayoutsSortableColumn = "name" | "createdAt" | "updatedAt";

export type LayoutsFilter = {
	query: string;
	orderBy: LayoutsSortableColumn;
	orderDirection: DirectionEnum;
	offset: number;
	limit: number;
};

export const defaultLayoutsFilter: LayoutsFilter = {
	query: "",
	orderBy: "createdAt",
	orderDirection: DirectionEnum.DESC,
	offset: 0,
	limit: getPersistedPageSize(LAYOUTS_TABLE_ID, 10),
};

export type LayoutsUrlState = {
	filterValues: LayoutsFilter;
	hrefFromOffset: (offset: number) => string;
	handleFiltersChange: (newFilters: Partial<LayoutsFilter>) => void;
	toggleSort: (column: LayoutsSortableColumn) => void;
	resetFilters: () => void;
};

export const useLayoutsUrlState = (): LayoutsUrlState => {
	const search = useSearch({ strict: false }) as Record<string, string | undefined>;
	const navigate = useNavigate();

	const filterValues = useMemo(() => {
		const offset = parseInt(
			(search.offset as string) || defaultLayoutsFilter.offset.toString(),
			10,
		);
		const limit = parseInt(
			(search.limit as string) || defaultLayoutsFilter.limit.toString(),
			10,
		);
		const query = (search.query as string) || "";
		const orderBy = (search.orderBy as string) as LayoutsSortableColumn;
		const orderDirection = (search.orderDirection as string) as DirectionEnum;

		return {
			query,
			orderBy: orderBy || defaultLayoutsFilter.orderBy,
			orderDirection: orderDirection || defaultLayoutsFilter.orderDirection,
			offset,
			limit,
		};
	}, [search]);

	const handleFiltersChange = useCallback(
		(newFilters: Partial<LayoutsFilter>) => {
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const newSearch = { ...prev };

					Object.entries(newFilters).forEach(([key, value]) => {
						if (value === "" || value === undefined) {
							delete newSearch[key];
						} else {
							newSearch[key] = String(value);
						}
					});

					// Remove pagination when filters change
					delete newSearch.before;
					delete newSearch.after;

					return newSearch;
				}) as never,
			});
		},
		[navigate],
	);

	const toggleSort = useCallback(
		(column: LayoutsSortableColumn) => {
			const currentDirection = filterValues.orderDirection;
			const isCurrentColumn = filterValues.orderBy === column;

			const newDirection = isCurrentColumn
				? currentDirection === DirectionEnum.ASC
					? DirectionEnum.DESC
					: DirectionEnum.ASC
				: DirectionEnum.DESC;

			handleFiltersChange({
				orderBy: column,
				orderDirection: newDirection,
			});
		},
		[filterValues.orderBy, filterValues.orderDirection, handleFiltersChange],
	);

	const resetFilters = useCallback(() => {
		navigate({ search: {} });
	}, [navigate]);

	const hrefFromOffset = (offset: number) => {
		const params = new URLSearchParams();
		Object.entries(search).forEach(([key, value]) => {
			if (value !== undefined) {
				params.set(key, value);
			}
		});
		params.set("offset", offset.toString());
		return `${location.pathname}?${params}`;
	};

	return {
		filterValues,
		hrefFromOffset,
		handleFiltersChange,
		toggleSort,
		resetFilters,
	};
};
