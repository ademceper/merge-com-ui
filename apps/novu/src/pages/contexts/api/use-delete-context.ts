// Removed unused imports
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { deleteContext } from "@/entities/context/api/contexts";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DeleteContextParameters = OmitEnvironmentFromParameters<
	typeof deleteContext
>;

export const useDeleteContext = (
	options?: UseMutationOptions<void, unknown, DeleteContextParameters>,
) => {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: DeleteContextParameters) => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);
			return deleteContext({ environment, ...args });
		},
		...options,
		onSuccess: async (_, variables, ctx) => {
			// Remove the specific context from cache
			queryClient.removeQueries({
				queryKey: [
					QueryKeys.fetchContext,
					currentEnvironment?._id,
					variables.type,
					variables.id,
				],
				exact: true,
			});

			// Invalidate all contexts queries to refresh the list
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchContexts],
				exact: false,
				refetchType: "all",
			});

			options?.onSuccess?.(_, variables, ctx);
		},
	});

	return {
		...rest,
		deleteContext: mutateAsync,
	};
};
