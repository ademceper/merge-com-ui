import { useMutation } from "@tanstack/react-query";
import { revertMessage } from "@/entities/ai/api/ai";
import { useEnvironment } from "@/app/context/environment/hooks";

export function useRevertMessage() {
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: async ({
			chatId,
			messageId,
		}: {
			chatId: string;
			messageId: string;
		}) => {
			return revertMessage({
				environment: currentEnvironment!,
				chatId,
				messageId,
			});
		},
	});

	return {
		revertMessage: mutateAsync,
		isPending,
		error,
	};
}
