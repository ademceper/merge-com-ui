import type { IIntegration } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type CreateIntegrationData,
	createIntegration,
} from "@/entities/integration/api/integrations";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";

export function useCreateIntegration() {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	return useMutation<{ data: IIntegration }, unknown, CreateIntegrationData>({
		mutationFn: (data: CreateIntegrationData) =>
			createIntegration(data, currentEnvironment!),
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
