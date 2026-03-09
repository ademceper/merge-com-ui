import { useMutation } from "@tanstack/react-query";
import { addClusterNode, deleteClusterNode, testNodesAvailable } from "@/admin/api/clients";

export function useAddClusterNode() {
    return useMutation({
        mutationFn: ({ clientId, node }: { clientId: string; node: string }) =>
            addClusterNode(clientId, node)
    });
}

export function useDeleteClusterNode() {
    return useMutation({
        mutationFn: ({ clientId, node }: { clientId: string; node: string }) =>
            deleteClusterNode(clientId, node)
    });
}

export function useTestNodesAvailable() {
    return useMutation({
        mutationFn: (clientId: string) => testNodesAvailable(clientId)
    });
}
