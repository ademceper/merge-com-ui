import { useMutation } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { testSMTPConnection } from "@/admin/api/realm-settings";

export function useTestSMTP() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (settings: Record<string, string>) =>
            testSMTPConnection(realm, settings)
    });
}
