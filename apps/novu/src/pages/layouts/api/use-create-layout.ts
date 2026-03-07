import type { CreateLayoutDto, LayoutResponseDto } from "@/shared";
import {
	type UseMutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

import { createLayout } from "@/entities/layout/api/layouts";
import { useEnvironment } from "@/app/context/environment/hooks";
import { showErrorToast } from "@/pages/workflows/ui/workflow-editor/toasts";
import { QueryKeys } from "@/shared/lib/query-keys";

export function useCreateLayout(
	options?: UseMutationOptions<LayoutResponseDto, unknown, CreateLayoutDto>,
) {
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();
	const [toastId] = useState<string | number>("");

	const mutation = useMutation({
		mutationFn: async (layout: CreateLayoutDto) =>
			createLayout({ environment: currentEnvironment!, layout }),
		onSuccess: async (data, variables, ctx) => {
			await queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchLayouts, currentEnvironment?._id],
			});

			queryClient.invalidateQueries({ queryKey: [QueryKeys.diffEnvironments] });

			options?.onSuccess?.(data, variables, ctx);
		},

		onError: (error, variables, ctx) => {
			showErrorToast(toastId, error);
			options?.onError?.(error, variables, ctx);
		},
	});

	return {
		createLayout: mutation.mutateAsync,
		isPending: mutation.isPending,
	};
}
