import { useMutation } from "@tanstack/react-query";
import { deleteRealm } from "../../../api/realm-settings";

export function useDeleteRealm() {
    return useMutation({
        mutationFn: (realm: string) => deleteRealm(realm)
    });
}
