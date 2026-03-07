import type { GeneratePreviewResponseDto } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { previewStep } from "@/entities/step/api/steps";
import { useEnvironment } from "@/app/context/environment/hooks";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type PreviewStepParameters = OmitEnvironmentFromParameters<typeof previewStep>;

export const usePreviewStep = ({
	onSuccess,
	onError,
}: {
	onSuccess?: (data: GeneratePreviewResponseDto) => void;
	onError?: (error: Error) => void;
} = {}) => {
	const { currentEnvironment } = useEnvironment();
	const { mutateAsync, isPending, error, data } = useMutation<
		GeneratePreviewResponseDto,
		Error,
		PreviewStepParameters
	>({
		mutationFn: (args: PreviewStepParameters) =>
			previewStep({ environment: currentEnvironment!, ...args }),
		onSuccess,
		onError,
	});

	return {
		previewStep: mutateAsync,
		isPending,
		error,
		data,
	};
};
