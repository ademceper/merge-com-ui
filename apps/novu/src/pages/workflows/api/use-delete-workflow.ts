import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { deleteWorkflow } from "@/entities/workflow/api/workflows";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DeleteWorkflowParameters = OmitEnvironmentFromParameters<
	typeof deleteWorkflow
>;

export const useDeleteWorkflow = (
	options?: UseMutationOptions<void, unknown, DeleteWorkflowParameters>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: DeleteWorkflowParameters) =>
			deleteWorkflow({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchWorkflows],
			});

			// Invalidate diff environment queries when workflows are deleted
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		deleteWorkflow: mutateAsync,
	};
};
