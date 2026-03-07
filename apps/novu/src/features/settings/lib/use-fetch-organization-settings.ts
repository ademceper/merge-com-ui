import { useQuery } from "@tanstack/react-query";
import {
	type GetOrganizationSettingsDto,
	getOrganizationSettings,
} from "@/entities/organization/api/organization";
import { IS_SELF_HOSTED } from "@/shared/config";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

export const useFetchOrganizationSettings = () => {
	const { currentEnvironment } = useEnvironment();

	const query = useQuery<{ data: GetOrganizationSettingsDto }>({
		queryKey: [QueryKeys.organizationSettings, currentEnvironment?._id],
		queryFn: async () =>
			await getOrganizationSettings({ environment: currentEnvironment! }),
		enabled: !!currentEnvironment?._id && !IS_SELF_HOSTED,
		refetchOnMount: false,
	});

	return query;
};
