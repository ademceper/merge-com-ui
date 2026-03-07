import { useMutation } from "@tanstack/react-query";
import { updateBridgeUrl } from "@/entities/environment/api/environments";
import { useEnvironment } from "@/app/context/environment/hooks";

export const useUpdateBridgeUrl = () => {
	const { currentEnvironment } = useEnvironment();

	const { mutateAsync, isPending, error, data } = useMutation({
		mutationFn: async ({ url }: { url: string; environmentId: string }) =>
			updateBridgeUrl({ environment: currentEnvironment!, url }),
	});

	return {
		updateBridgeUrl: mutateAsync,
		isPending,
		error,
		data,
	};
};
