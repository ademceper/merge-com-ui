import { useQuery } from "@tanstack/react-query";

import { fetchVercelIntegrationProjects } from "@/entities/integration/api/partner-integrations";
import { useEnvironment } from "@/app/context/environment/hooks";

export function useFetchVercelIntegrationProjects({
	configurationId,
	enabled = true,
}: {
	configurationId?: string | null;
	enabled?: boolean;
}) {
	const { currentEnvironment } = useEnvironment();

	return useQuery({
		queryKey: ["vercelProjects", configurationId],
		queryFn: async () => {
			const response = await fetchVercelIntegrationProjects({
				configurationId: configurationId as string,
				environment: currentEnvironment,
			});

			return response.data;
		},
		enabled: !!configurationId && !!currentEnvironment && enabled,
	});
}
