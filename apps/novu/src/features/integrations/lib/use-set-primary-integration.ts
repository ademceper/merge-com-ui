import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAsPrimaryIntegration } from "@/entities/integration/api/integrations";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

type SetPrimaryIntegrationParams = {
	integrationId: string;
};

export function useSetPrimaryIntegration() {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ integrationId }: SetPrimaryIntegrationParams) => {
			return setAsPrimaryIntegration(integrationId, currentEnvironment!);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id],
			});
		},
	});
}
