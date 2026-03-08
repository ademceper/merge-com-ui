import type { HealthCheck } from "@novu/framework/internal";
import type { IEnvironment, IValidateBridgeUrlResponse } from "@/shared";
import { get, post } from "@/shared/api/api.client";

export const getBridgeHealthCheck = async ({
    environment
}: {
    environment: IEnvironment;
}) => {
    const { data } = await get<{ data: HealthCheck }>("/bridge/status", {
        environment
    });

    return data;
};

export const validateBridgeUrl = async ({
    bridgeUrl,
    environment
}: {
    bridgeUrl: string;
    environment: IEnvironment;
}) => {
    const { data } = await post<{ data: IValidateBridgeUrlResponse }>(
        "/bridge/validate",
        {
            environment,
            body: { bridgeUrl }
        }
    );

    return data;
};
