import { useMutation } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clearEvents } from "@/admin/api/realm-settings";

export function useClearEvents() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (type: "admin" | "user") =>
            clearEvents(realm, type)
    });
}
