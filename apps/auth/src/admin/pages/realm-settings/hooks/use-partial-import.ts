import { useMutation } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { partialImport } from "../../../api/realm-settings";

export function usePartialImport() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (rep: unknown) => partialImport(realm, rep)
    });
}
