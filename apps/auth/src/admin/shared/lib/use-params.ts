import { useParams as useParamsTR } from "@tanstack/react-router";

export const useParams = <T extends Record<string, string>>() =>
    useParamsTR({ strict: false } as unknown as Parameters<
        typeof useParamsTR
    >[0]) as unknown as T;
