import type { GetContextResponseDto } from "@novu/api/models/components";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createContext } from "@/entities/context/api/contexts";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type CreateContextParameters = OmitEnvironmentFromParameters<
	typeof createContext
>;

export const useCreateContext = (
	options?: UseMutationOptions<
		GetContextResponseDto,
		unknown,
		CreateContextParameters
	>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: CreateContextParameters) => {
			const environment = requireEnvironment(
				currentEnvironment,
				"No environment available",
			);
			return createContext({ environment, ...args });
		},
		...options,
		onSuccess: async (data, variables, ctx) => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchContexts],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		createContext: mutateAsync,
	};
};
