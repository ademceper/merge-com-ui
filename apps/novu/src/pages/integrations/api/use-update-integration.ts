import type { IIntegration } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type UpdateIntegrationData,
	updateIntegration,
} from "@/entities/integration/api/integrations";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

type UpdateIntegrationVariables = {
	integrationId: string;
	data: UpdateIntegrationData;
};

export function useUpdateIntegration() {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	return useMutation<IIntegration, Error, UpdateIntegrationVariables>({
		mutationFn: async ({ integrationId, data }) => {
			return updateIntegration(integrationId, data, currentEnvironment!);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id],
			});
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id],
			});
		},
	});
}
