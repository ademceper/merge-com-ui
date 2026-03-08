import { useQuery } from "@tanstack/react-query";
import type { FilterType } from "../ui/role-mapping/add-role-mapping-modal";
import { getAvailableRoles } from "../ui/role-mapping/queries";
import { getAvailableClientRoles } from "../ui/role-mapping/resource";
import type { ResourcesKey, Row } from "../ui/role-mapping/role-mapping";
import { sharedKeys } from "./keys";

export function useAvailableRoleMappings(
    id: string,
    type: ResourcesKey,
    filterType: FilterType,
    localeSort: <T>(items: T[], mapFn: (item: T) => string) => T[]
) {
    return useQuery({
        queryKey: sharedKeys.roles.available(id, type, filterType),
        queryFn: async (): Promise<Row[]> => {
            const compareRow = ({ role: { name: n } }: Row) => n?.toUpperCase() ?? "";
            if (filterType === "roles") {
                const roles = await getAvailableRoles(type, {
                    id,
                    first: 0,
                    max: 500
                });
                return localeSort(roles, compareRow).map(row => ({
                    role: row.role,
                    id: row.role.id
                }));
            }
            const roles = await getAvailableClientRoles({
                id,
                type,
                first: 0,
                max: 500
            });
            return localeSort(
                roles.map(e => ({
                    client: { clientId: e.client, id: e.clientId },
                    role: {
                        id: e.id,
                        name: e.role,
                        description: e.description
                    },
                    id: e.id
                })),
                ({ client: { clientId }, role: { name: n } }: any) => `${clientId}${n}`
            );
        }
    });
}
