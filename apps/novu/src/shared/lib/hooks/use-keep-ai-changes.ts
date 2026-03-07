import { useMutation } from "@tanstack/react-query";
import { keepAiChanges } from "@/entities/ai/api/ai";
import { useEnvironment } from "@/app/context/environment/hooks";

export function useKeepAiChanges() {
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async ({
			chatId,
			messageId,
		}: {
			chatId: string;
			messageId: string;
		}) => {
			return keepAiChanges({
				environment: currentEnvironment!,
				chatId,
				messageId,
			});
		},
	});

	return {
		keepChanges: mutateAsync,
		isPending,
		error,
	};
}
