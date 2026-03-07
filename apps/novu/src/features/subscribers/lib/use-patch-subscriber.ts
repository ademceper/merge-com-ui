import type { SubscriberResponseDto } from "@novu/api/models/components";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { patchSubscriber } from "@/entities/subscriber/api/subscribers";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type PatchSubscriberParameters = OmitEnvironmentFromParameters<
	typeof patchSubscriber
>;

export const usePatchSubscriber = (
	options?: UseMutationOptions<
		SubscriberResponseDto,
		unknown,
		PatchSubscriberParameters
	>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: PatchSubscriberParameters) =>
			patchSubscriber({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			await queryClient.setQueryData(
				[QueryKeys.fetchSubscriber, variables.subscriberId],
				data,
			);

			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchSubscribers],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		patchSubscriber: mutateAsync,
	};
};
