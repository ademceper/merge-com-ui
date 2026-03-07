import type { LayoutResponseDto } from "@/shared";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { duplicateLayout } from "@/entities/layout/api/layouts";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type DuplicateLayoutParameters = OmitEnvironmentFromParameters<
	typeof duplicateLayout
>;

export const useDuplicateLayout = (
	options?: UseMutationOptions<
		LayoutResponseDto,
		unknown,
		DuplicateLayoutParameters
	>,
) => {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: DuplicateLayoutParameters) =>
			duplicateLayout({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchLayouts, currentEnvironment?._id],
			});

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		duplicateLayout: mutateAsync,
	};
};
