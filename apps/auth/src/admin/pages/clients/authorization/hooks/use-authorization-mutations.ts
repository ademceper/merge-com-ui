import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    importResource,
    updateResourceServer,
    evaluateResource,
    createResource,
    updateResource,
    deleteResource,
    createAuthorizationScope,
    updateAuthorizationScope,
    delAuthorizationScope,
    createPermission,
    updatePermission,
    deletePermission,
    createPolicy,
    updatePolicy,
    deletePolicy,
    findPermissionsByResource
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useImportResource() {
    return useMutation({
        mutationFn: ({ clientId, value }: { clientId: string; value: Record<string, unknown> }) =>
            importResource(clientId, value)
    });
}

export function useUpdateResourceServer() {
    return useMutation({
        mutationFn: ({
            clientId,
            resource
        }: {
            clientId: string;
            resource: Record<string, unknown>;
        }) => updateResourceServer(clientId, resource)
    });
}

export function useEvaluateResource() {
    return useMutation({
        mutationFn: ({
            clientId,
            realm,
            evaluation
        }: {
            clientId: string;
            realm: string;
            evaluation: Record<string, unknown>;
        }) => evaluateResource(clientId, realm, evaluation)
    });
}

export function useCreateResource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            resource
        }: {
            clientId: string;
            resource: Record<string, unknown>;
        }) => createResource(clientId, resource),
        onSuccess: (_data, { clientId }) => {
            queryClient.invalidateQueries({
                queryKey: authzKeys.all
            });
        }
    });
}

export function useUpdateResource() {
    return useMutation({
        mutationFn: ({
            clientId,
            resourceId,
            resource
        }: {
            clientId: string;
            resourceId: string;
            resource: Record<string, unknown>;
        }) => updateResource(clientId, resourceId, resource)
    });
}

export function useDeleteResource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, resourceId }: { clientId: string; resourceId: string }) =>
            deleteResource(clientId, resourceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}

export function useFetchPermissionsByResource() {
    return useMutation({
        mutationFn: ({ clientId, resourceId }: { clientId: string; resourceId: string }) =>
            findPermissionsByResource(clientId, resourceId)
    });
}

export function useCreateAuthorizationScope() {
    return useMutation({
        mutationFn: ({
            clientId,
            scope
        }: {
            clientId: string;
            scope: Record<string, unknown>;
        }) => createAuthorizationScope(clientId, scope)
    });
}

export function useUpdateAuthorizationScope() {
    return useMutation({
        mutationFn: ({
            clientId,
            scopeId,
            scope
        }: {
            clientId: string;
            scopeId: string;
            scope: Record<string, unknown>;
        }) => updateAuthorizationScope(clientId, scopeId, scope)
    });
}

export function useDelAuthorizationScope() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, scopeId }: { clientId: string; scopeId: string }) =>
            delAuthorizationScope(clientId, scopeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}

export function useCreatePermission() {
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            permission
        }: {
            clientId: string;
            type: string;
            permission: Record<string, unknown>;
        }) => createPermission(clientId, type, permission)
    });
}

export function useUpdatePermission() {
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            permissionId,
            permission
        }: {
            clientId: string;
            type: string;
            permissionId: string;
            permission: Record<string, unknown>;
        }) => updatePermission(clientId, type, permissionId, permission)
    });
}

export function useDeletePermissionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            permissionId
        }: {
            clientId: string;
            type: string;
            permissionId: string;
        }) => deletePermission(clientId, type, permissionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}

export function useCreatePolicy() {
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            policy
        }: {
            clientId: string;
            type: string;
            policy: Record<string, unknown>;
        }) => createPolicy(clientId, type, policy)
    });
}

export function useUpdatePolicy() {
    return useMutation({
        mutationFn: ({
            clientId,
            type,
            policyId,
            policy
        }: {
            clientId: string;
            type: string;
            policyId: string;
            policy: Record<string, unknown>;
        }) => updatePolicy(clientId, type, policyId, policy)
    });
}

export function useDeletePolicyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, policyId }: { clientId: string; policyId: string }) =>
            deletePolicy(clientId, policyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authzKeys.all });
        }
    });
}
