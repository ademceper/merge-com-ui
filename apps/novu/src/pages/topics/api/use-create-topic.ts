import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createTopic } from "@/entities/topic/api/topics";
import { useEnvironment } from "@/app/context/environment/hooks";
import type { Topic } from "@/entities/topic/model/types";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type CreateTopicParameters = OmitEnvironmentFromParameters<
	typeof createTopic
>;

export const useCreateTopic = (
	options?: UseMutationOptions<Topic, unknown, CreateTopicParameters>,
) => {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: CreateTopicParameters) =>
			createTopic({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchTopics],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		createTopic: mutateAsync,
	};
};
