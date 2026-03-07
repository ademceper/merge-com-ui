import type { LayoutResponseDto } from "@/shared";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { updateLayout } from "@/entities/layout/api/layouts";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

export type UpdateLayoutParameters = OmitEnvironmentFromParameters<
	typeof updateLayout
>;

export const useUpdateLayout = (
	options?: UseMutationOptions<
		LayoutResponseDto,
		unknown,
		UpdateLayoutParameters
	>,
) => {
	const { currentEnvironment } = useEnvironment();
	const queryClient = useQueryClient();

	const { mutateAsync, ...rest } = useMutation({
		mutationFn: (args: UpdateLayoutParameters) =>
			updateLayout({ environment: currentEnvironment!, ...args }),
		...options,
		onSuccess: async (data, variables, ctx) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchLayout, currentEnvironment?._id],
			});

			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchLayouts, currentEnvironment?._id],
			});

			// Invalidate environment diff cache since layout changes affect environment comparison
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.diffEnvironments],
			});

			options?.onSuccess?.(data, variables, ctx);
		},
	});

	return {
		...rest,
		updateLayout: mutateAsync,
	};
};
