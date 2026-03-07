import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getLayout } from "@/entities/layout/api/layouts";
import { useEnvironment } from "@/app/context/environment/hooks";
import { getIdFromSlug, LAYOUT_DIVIDER } from "@/shared/lib/id-utils";
import { QueryKeys } from "@/shared/lib/query-keys";

export const useFetchLayout = ({ layoutSlug }: { layoutSlug?: string }) => {
	const { currentEnvironment } = useEnvironment();
	const layoutId = useMemo(
		() => getIdFromSlug({ slug: layoutSlug ?? "", divider: LAYOUT_DIVIDER }),
		[layoutSlug],
	);

	const {
		data: layout,
		isPending,
		error,
	} = useQuery({
		queryKey: [QueryKeys.fetchLayout, currentEnvironment?._id, layoutId],
		queryFn: () =>
			getLayout({ environment: currentEnvironment!, layoutSlug: layoutSlug! }),
		enabled: !!currentEnvironment?._id && !!layoutSlug,
	});

	return {
		layout,
		isPending,
		error,
	};
};
