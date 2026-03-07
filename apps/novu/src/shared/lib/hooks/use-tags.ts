import type { ITagsResponse } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/entities/environment/api/environments";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

export const useTags = () => {
	const { currentEnvironment } = useEnvironment();
	const { data: tags, ...query } = useQuery<ITagsResponse>({
		queryKey: [QueryKeys.fetchTags, currentEnvironment?._id],
		queryFn: () => getTags({ environment: currentEnvironment! }),
		enabled: !!currentEnvironment?._id,
		initialData: [],
	});

	return {
		tags,
		...query,
	};
};
