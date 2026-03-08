import { useParams as useParamsTR } from "@tanstack/react-router";

export const useParams = <T extends Record<string, string>>() =>
    useParamsTR({ strict: false } as any) as T;
