import { useMutation } from "@tanstack/react-query";
import { reloadKeys } from "../../../api/identity-providers";

export function useReloadKeys() {
    return useMutation({
        mutationFn: (alias: string) => reloadKeys(alias)
    });
}
