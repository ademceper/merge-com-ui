import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { TranslationsFilter } from "@/entities/translation/api/translations";
import {
	DEFAULT_TRANSLATIONS_LIMIT,
	DEFAULT_TRANSLATIONS_OFFSET,
} from "../ui/constants";

export const defaultTranslationsFilter: TranslationsFilter = {
	query: "",
	limit: DEFAULT_TRANSLATIONS_LIMIT,
	offset: DEFAULT_TRANSLATIONS_OFFSET,
};

export type TranslationsUrlState = {
	filterValues: TranslationsFilter;
	handleFiltersChange: (newFilters: Partial<TranslationsFilter>) => void;
	resetFilters: () => void;
	handleNext: () => void;
	handlePrevious: () => void;
	handleFirst: () => void;
};

type UseTranslationsUrlStateProps = {
	total?: number;
	limit?: number;
};

export function useTranslationsUrlState({
	total = 0,
	limit = DEFAULT_TRANSLATIONS_LIMIT,
}: UseTranslationsUrlStateProps): TranslationsUrlState {
	const search = useSearch({ strict: false });
	const navigate = useNavigate();

	const filterValues = useMemo(() => {
		const query = (search as Record<string, unknown>).query as string || "";
		const offset = parseInt(String((search as Record<string, unknown>).offset || "0"), 10);

		return {
			query,
			limit,
			offset,
		};
	}, [search, limit]);

	const handleFiltersChange = useCallback(
		(newFilters: Partial<TranslationsFilter>) => {
			navigate({
				search: ((prev: Record<string, unknown>) => {
					const next = { ...prev };

					Object.entries(newFilters).forEach(([key, value]) => {
						if (value === "" || value === undefined) {
							delete next[key];
						} else {
							next[key] = String(value);
						}
					});

					// Reset offset when filters change (except when offset is being set)
					if (!("offset" in newFilters)) {
						delete next.offset;
					}

					return next;
				}) as never,
			});
		},
		[navigate],
	);

	const resetFilters = useCallback(() => {
		navigate({
			search: {},
		});
	}, [navigate]);

	const handleNext = useCallback(() => {
		const nextOffset = filterValues.offset + limit;

		if (nextOffset < total) {
			handleFiltersChange({ offset: nextOffset });
		}
	}, [filterValues.offset, limit, total, handleFiltersChange]);

	const handlePrevious = useCallback(() => {
		const prevOffset = Math.max(0, filterValues.offset - limit);
		handleFiltersChange({ offset: prevOffset });
	}, [filterValues.offset, limit, handleFiltersChange]);

	const handleFirst = useCallback(() => {
		handleFiltersChange({ offset: 0 });
	}, [handleFiltersChange]);

	return {
		filterValues,
		handleFiltersChange,
		resetFilters,
		handleNext,
		handlePrevious,
		handleFirst,
	};
}
