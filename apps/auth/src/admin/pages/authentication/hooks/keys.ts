export { type FlowType } from "@/admin/api/authentication";
import type { FlowType } from "@/admin/api/authentication";

export const authenticationKeys = {
    all: ["authentication"] as const,
    flows: () => [...authenticationKeys.all, "flows"] as const,
    flowDetail: (id: string) => [...authenticationKeys.all, "flow", id] as const,
    requiredActions: () => [...authenticationKeys.all, "required-actions"] as const,
    providers: () => [...authenticationKeys.all, "providers"] as const,
    stepProviders: (type: FlowType) =>
        [...authenticationKeys.all, "step-providers", type] as const,
    formProviders: () => [...authenticationKeys.all, "form-providers"] as const,
    flowProviderId: (flowId: string) =>
        [...authenticationKeys.all, "flow-provider-id", flowId] as const,
    executionConfig: (executionId: string) =>
        [...authenticationKeys.all, "execution-config", executionId] as const,
    requiredActionConfig: (alias: string) =>
        [...authenticationKeys.all, "required-action-config", alias] as const,
    usedBy: (id: string, type: string) =>
        [...authenticationKeys.all, "used-by", id, type] as const
};
