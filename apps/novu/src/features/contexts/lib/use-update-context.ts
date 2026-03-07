import type { GetContextResponseDto } from "@novu/api/models/components";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { updateContext } from "@/entities/context/api/contexts";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

export type UpdateContextParameters = OmitEnvironmentFromParameters<
	typeof updateContext
>;

export const useUpdateContext = (
	options?: UseMutationOptions<
		GetContextResponseDto,
		unknown,
		UpdateContextParameters
	>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: UpdateContextParameters) => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);
			return updateContext({ environment, ...args });
		},
		...options,
		onSuccess: async (data, variables, ctx) => {
			// Invalidate contexts list queries
			queryClient.invalidateQueries({ queryKey: [QueryKeys.fetchContexts] });

			// Invalidate specific context query
			queryClient.invalidateQueries({
				queryKey: [
					QueryKeys.fetchContext,
					currentEnvironment?._id,
					data.type,
					data.id,
				],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		updateContext: mutateAsync,
	};
};
