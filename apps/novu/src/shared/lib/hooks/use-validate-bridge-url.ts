import type { IValidateBridgeUrlResponse } from "@/shared";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { validateBridgeUrl } from "@/entities/bridge/api/bridge";
import { useEnvironment } from "@/app/context/environment/hooks";
import type { OmitEnvironmentFromParameters } from "@/shared/lib/types";

type ValidateBridgeUrlParameters = OmitEnvironmentFromParameters<
	typeof validateBridgeUrl
>;

export const useValidateBridgeUrl = (
	options?: UseMutationOptions<
		IValidateBridgeUrlResponse,
		unknown,
		ValidateBridgeUrlParameters
	>,
) => {
	const { currentEnvironment } = useEnvironment();
	const { mutateAsync, isPending, error, data } = useMutation({
		mutationFn: ({ bridgeUrl }: { bridgeUrl: string }) =>
			validateBridgeUrl({ bridgeUrl, environment: currentEnvironment! }),
		...options,
	});

	return {
		validateBridgeUrl: mutateAsync,
		isPending,
		error,
		data,
	};
};
