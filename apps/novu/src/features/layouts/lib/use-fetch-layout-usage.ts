import { useQuery } from "@tanstack/react-query";
import { getLayoutUsage } from "@/entities/layout/api/layouts";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

export const useFetchLayoutUsage = ({
	layoutSlug,
	enabled = true,
}: {
	layoutSlug: string;
	enabled?: boolean;
}) => {
	const { currentEnvironment } = useEnvironment();

	const {
		data: usage,
		isPending,
		error,
	} = useQuery({
		queryKey: [QueryKeys.fetchLayoutUsage, currentEnvironment?._id, layoutSlug],
		queryFn: () =>
			getLayoutUsage({ environment: currentEnvironment!, layoutSlug }),
		enabled: !!currentEnvironment?._id && !!layoutSlug && enabled,
	});

	return {
		usage,
		isPending,
		error,
	};
};
