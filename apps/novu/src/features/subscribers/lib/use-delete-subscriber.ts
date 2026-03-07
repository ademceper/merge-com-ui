import type { RemoveSubscriberResponseDto } from "@novu/api/models/components";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { deleteSubscriber } from "@/entities/subscriber/api/subscribers";
import { useEnvironment } from "@/app/context/environment/hooks";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DeleteSubscriberParameters = OmitEnvironmentFromParameters<
	typeof deleteSubscriber
>;

export const useDeleteSubscriber = (
	options?: UseMutationOptions<
		RemoveSubscriberResponseDto,
		unknown,
		DeleteSubscriberParameters
	>,
) => {
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: DeleteSubscriberParameters) =>
			deleteSubscriber({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: (data, variables, ctx) => {
			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		deleteSubscriber: mutateAsync,
	};
};
