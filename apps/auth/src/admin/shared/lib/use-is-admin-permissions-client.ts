import { useEffect, useState } from "react";
import { useRealm } from "../../app/providers/realm-context/realm-context";

export function useIsAdminPermissionsClient(selectedClientId: string) {
    const { realmRepresentation } = useRealm();
    const [isAdminPermissionsClient, setIsAdminPermissionsClient] =
        useState<boolean>(false);

    useEffect(() => {
        if (realmRepresentation?.adminPermissionsClient) {
            setIsAdminPermissionsClient(
                selectedClientId === realmRepresentation.adminPermissionsClient.id
            );
        } else {
            setIsAdminPermissionsClient(false);
        }
    }, [selectedClientId, realmRepresentation]);

    return isAdminPermissionsClient;
}
