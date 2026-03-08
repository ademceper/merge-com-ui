import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { clearEvents } from "../../../api/realm-settings";

export function useClearEvents() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (type: "admin" | "user") =>
            clearEvents(adminClient, realm, type)
    });
}
