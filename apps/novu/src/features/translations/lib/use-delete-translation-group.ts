import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTranslationGroup } from "@/entities/translation/api/translations";
import {
	showErrorToast,
	showSuccessToast,
} from "@/shared/ui/primitives/sonner-helpers";
import { useEnvironment } from "@/app/context/environment/hooks";
import { LocalizationResourceEnum } from "@/shared/model/translations";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DeleteTranslationGroupParameters = OmitEnvironmentFromParameters<
	typeof deleteTranslationGroup
>;

export const useDeleteTranslationGroup = () => {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (args: DeleteTranslationGroupParameters) =>
			deleteTranslationGroup({ environment: currentEnvironment!, ...args }),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchTranslationGroups],
				exact: false,
			});

			if (variables.resourceType === LocalizationResourceEnum.WORKFLOW) {
				await queryClient.invalidateQueries({
					queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id],
					exact: false,
				});

				await queryClient.refetchQueries({
					queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id],
					exact: false,
				});
			}

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});

			showSuccessToast("Translation group deleted successfully");
		},
		onError: (error) => {
			showErrorToast(
				error instanceof Error
					? error.message
					: "Failed to delete translation group",
				"Delete failed",
			);
		},
	});
};
