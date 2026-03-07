import type { AiResourceTypeEnum } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { createAiChat } from "@/entities/ai/api/ai";
import { useEnvironment } from "@/app/context/environment/hooks";

export function useCreateAiChat() {
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, isPending, error, data } = useMutation({
		mutationFn: async ({
			resourceType,
			resourceId,
		}: {
			resourceType: AiResourceTypeEnum;
			resourceId?: string;
		}) => {
			return createAiChat({
				environment: currentEnvironment!,
				resourceType,
				resourceId,
			});
		},
	});

	return {
		createAiChat: mutateAsync,
		isPending,
		error,
		data,
	};
}
