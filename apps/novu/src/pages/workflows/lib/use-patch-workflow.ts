import type { WorkflowResponseDto } from "@/shared";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { patchWorkflow } from "@/entities/workflow/api/workflows";
import { useEnvironment } from "@/app/context/environment/hooks";
import { getIdFromSlug, WORKFLOW_DIVIDER } from "@/shared/lib/id-utils";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type PatchWorkflowParameters = OmitEnvironmentFromParameters<
	typeof patchWorkflow
>;

export const usePatchWorkflow = (
	options?: UseMutationOptions<
		WorkflowResponseDto,
		unknown,
		PatchWorkflowParameters
	>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: PatchWorkflowParameters) =>
			patchWorkflow({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			await queryClient.setQueryData(
				[
					QueryKeys.fetchWorkflow,
					currentEnvironment?._id,
					getIdFromSlug({
						slug: variables.workflowSlug ?? "",
						divider: WORKFLOW_DIVIDER,
					}),
				],
				data,
			);

			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchWorkflows],
			});

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		patchWorkflow: mutateAsync,
	};
};
