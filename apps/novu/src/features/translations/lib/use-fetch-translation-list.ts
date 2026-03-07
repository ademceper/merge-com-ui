import { useQuery } from "@tanstack/react-query";
import {
	getTranslationsList,
	type TranslationsFilter,
} from "@/entities/translation/api/translations";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

interface UseFetchTranslationListOptions {
	enabled?: boolean;
}

export const useFetchTranslationList = (
	filterValues: TranslationsFilter,
	options: UseFetchTranslationListOptions = {},
) => {
	const { enabled = true } = options;
	const { currentEnvironment } = useEnvironment();

	return useQuery({
		queryKey: [
			QueryKeys.fetchTranslationGroups,
			filterValues,
			currentEnvironment?._id,
		],
		queryFn: async () => {
			const environment = requireEnvironment(
				currentEnvironment,
				"Environment is required",
			);

			return getTranslationsList({
				environment,
				...filterValues,
			});
		},
		enabled: !!currentEnvironment && enabled,
	});
};
