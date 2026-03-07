import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useAdminClient } from "../../app/admin-client";
import { useWhoAmI } from "../../app/providers/whoami/who-am-i";

export function useCurrentUser() {
    const { adminClient } = useAdminClient();
    const { whoAmI } = useWhoAmI();
    const [currentUser, setCurrentUser] = useState<UserRepresentation>();

    useFetch(() => adminClient.users.findOne({ id: whoAmI.userId }), setCurrentUser, [
        whoAmI.userId
    ]);

    return { ...currentUser, realm: whoAmI.realm };
}
