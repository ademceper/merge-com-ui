import { useQuery } from "@tanstack/react-query";
import { findClients } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClients() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.lists(),
        queryFn: () => findClients(adminClient)
    });
}
