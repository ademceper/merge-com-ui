import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTranslation } from "@/entities/translation/api/translations";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DeleteTranslationParameters = OmitEnvironmentFromParameters<
	typeof deleteTranslation
>;

export const useDeleteTranslation = () => {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (args: DeleteTranslationParameters) =>
			deleteTranslation({ environment: currentEnvironment!, ...args }),
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchTranslationGroups],
				exact: false,
			});

			await queryClient.invalidateQueries({
				queryKey: [
					QueryKeys.fetchTranslation,
					variables.resourceId,
					variables.resourceType,
					variables.locale,
					currentEnvironment?._id,
				],
			});

			await queryClient.invalidateQueries({
				queryKey: [
					QueryKeys.fetchTranslationGroup,
					variables.resourceId,
					variables.resourceType,
					currentEnvironment?._id,
				],
			});

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});
		},
	});
};
