import { useOrganization } from "@merge-rd/auth";
import type {
	GetSubscriberPreferencesDto,
	ScheduleDto,
} from "@novu/api/models/components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchSubscriberPreferences } from "@/entities/subscriber/api/subscribers";
import {
	requireEnvironment,
	useEnvironment,
} from "@/app/context/environment/hooks";
import { convertContextKeysToPayload } from "@/shared/lib/context-variable-utils";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type PatchSubscriberPreferencesParameters = OmitEnvironmentFromParameters<
	typeof patchSubscriberPreferences
>;

type UseOptimisticScheduleUpdateProps = {
	subscriberId: string;
	contextKeys?: string[];
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
};

export const useOptimisticScheduleUpdate = ({
	subscriberId,
	contextKeys,
	onSuccess,
	onError,
}: UseOptimisticScheduleUpdateProps) => {
	const queryClient = useQueryClient();
	const { organization: currentOrganization } = useOrganization();
	const { currentEnvironment } = useEnvironment();

	const queryKey = [
		QueryKeys.fetchSubscriberPreferences,
		currentOrganization?.id,
		currentEnvironment?._id,
		subscriberId,
		contextKeys,
	];

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (args: PatchSubscriberPreferencesParameters) => {
			const environment = requireEnvironment(
				currentEnvironment,
				"Environment is not available",
			);

			return patchSubscriberPreferences({ environment, ...args });
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData =
				queryClient.getQueryData<GetSubscriberPreferencesDto>(queryKey);
			if (previousData) {
				const optimisticData: GetSubscriberPreferencesDto = {
					...previousData,
					global: {
						...previousData.global,
						schedule: {
							...previousData.global.schedule,
							...variables.preferences.schedule,
							isEnabled:
								variables.preferences.schedule?.isEnabled ??
								previousData.global.schedule?.isEnabled ??
								false,
						},
					},
				};

				queryClient.setQueryData(queryKey, optimisticData);
			}

			return { previousData };
		},
		onError: (error, _variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
			onError?.(error);
		},
		onSuccess: () => {
			onSuccess?.();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const updateSchedule = async (schedule: ScheduleDto) => {
		const context = convertContextKeysToPayload(contextKeys);

		return mutateAsync({
			subscriberId,
			preferences: { schedule, context },
		});
	};

	return {
		updateSchedule,
		isPending,
	};
};
