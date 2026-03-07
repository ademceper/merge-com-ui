import type { HealthCheck } from "@novu/framework/internal";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getBridgeHealthCheck } from "@/entities/bridge/api/bridge";
import { useEnvironment } from "@/app/context/environment/hooks";
import { QueryKeys } from "@/shared/lib/query-keys";
import { ConnectionStatus } from "@/shared/lib/types";

const BRIDGE_STATUS_REFRESH_INTERVAL_IN_MS = 10 * 1000;

export const useFetchBridgeHealthCheck = () => {
	const { currentEnvironment } = useEnvironment();
	const bridgeURL = currentEnvironment?.bridge?.url || "";

	const { data, isLoading, error } = useQuery<HealthCheck>({
		queryKey: [QueryKeys.bridgeHealthCheck, currentEnvironment?._id, bridgeURL],
		queryFn: () => getBridgeHealthCheck({ environment: currentEnvironment! }),
		enabled: !!bridgeURL,
		networkMode: "always",
		refetchOnWindowFocus: true,
		refetchInterval: BRIDGE_STATUS_REFRESH_INTERVAL_IN_MS,
		meta: {
			showError: false,
		},
	});

	const status = useMemo<ConnectionStatus>(() => {
		if (isLoading) {
			return ConnectionStatus.LOADING;
		}

		if (bridgeURL && !error && data?.status === "ok") {
			return ConnectionStatus.CONNECTED;
		}

		return ConnectionStatus.DISCONNECTED;
	}, [bridgeURL, isLoading, data, error]);

	return {
		status,
		bridgeURL,
	};
};
