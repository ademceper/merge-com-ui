import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
} from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef,
} from "@merge/ui/components/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { translationFormatter } from "../../utils/translationFormatter";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge/ui/components/alert-dialog";
import { AddRoleButton, AddRoleMappingModal, FilterType } from "./AddRoleMappingModal";
import { deleteMapping, getEffectiveRoles, getMapping } from "./queries";
import { getEffectiveClientRoles } from "./resource";

export type CompositeRole = RoleRepresentation & {
    parent: RoleRepresentation;
    isInherited?: boolean;
};

export type Row = {
    client?: ClientRepresentation;
    role: RoleRepresentation | CompositeRole;
    id?: string;
};

export const mapRoles = (
    assignedRoles: Row[],
    effectiveRoles: Row[],
    hide: boolean,
): Row[] => [
    ...(hide
        ? assignedRoles.map((row) => ({
              id: row.role.id,
              ...row,
              role: {
                  ...row.role,
                  isInherited: false,
              },
          }))
        : effectiveRoles.map((row) => ({
              id: row.role.id,
              ...row,
              role: {
                  ...row.role,
                  isInherited:
                      assignedRoles.find((r) => r.role.id === row.role.id) ===
                      undefined,
              },
          }))),
];

export const ServiceRole = ({ role, client }: Row) => (
    <>
        {client?.clientId && (
            <Badge
                variant="secondary"
                className="keycloak-admin--role-mapping__client-name"
            >
                {client.clientId}
            </Badge>
        )}
        {role.name}
    </>
);

const ServiceRoleCell = ({ row }: { row: { original: Row } }) => (
    <ServiceRole role={row.original.role} client={row.original.client} />
);

export type ResourcesKey = keyof KeycloakAdminClient;

type RoleMappingProps = {
    name: string;
    id: string;
    type: ResourcesKey;
    isManager?: boolean;
    save: (rows: Row[]) => Promise<void>;
};

export const RoleMapping = ({
    name,
    id,
    type,
    isManager = true,
    save,
}: RoleMappingProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey((k) => k + 1), []);
    const [hide, setHide] = useState(true);
    const [showAssign, setShowAssign] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("clients");
    const [selected, setSelected] = useState<Row[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    const assignRoles = async (newRows: Row[]) => {
        await save(newRows);
        refresh();
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        let effectiveRoles: Row[] = [];
        let effectiveClientRoles: Row[] = [];

        if (!hide) {
            effectiveRoles = await getEffectiveRoles(adminClient, type, id);
            effectiveClientRoles = (
                await getEffectiveClientRoles(adminClient, { type, id })
            ).map((e) => ({
                client: { clientId: e.client, id: e.clientId },
                role: {
                    id: e.id,
                    name: e.role,
                    description: e.description,
                },
            }));
            effectiveRoles = effectiveRoles.filter(
                (role) =>
                    !effectiveClientRoles.some(
                        (clientRole) => clientRole.role.id === role.role.id,
                    ),
            );
        }

        const roles = await getMapping(adminClient, type, id);
        const realmRolesMapping =
            roles.realmMappings?.map((role) => ({ role })) || [];
        const clientMapping = Object.values(roles.clientMappings || {})
            .map((client) =>
                client.mappings.map((role: RoleRepresentation) => ({
                    client: { clientId: client.client, ...client },
                    role,
                })),
            )
            .flat();

        const result = mapRoles(
            [...clientMapping, ...realmRolesMapping],
            [...effectiveClientRoles, ...effectiveRoles],
            hide,
        );
        setRows(result);
        setLoading(false);
    }, [adminClient, type, id, hide]);

    useEffect(() => {
        loadData();
    }, [loadData, key]);

    const onDeleteConfirm = async () => {
        try {
            await Promise.all(deleteMapping(adminClient, type, id, selected));
            toast.success(t("roleMappingUpdatedSuccess"));
            setSelected([]);
            refresh();
        } catch (error) {
            toast.error(
                t("roleMappingUpdatedError", {
                    error: getErrorMessage(error),
                }),
                { description: getErrorDescription(error) },
            );
        }
    };

    const onRemoveDialogOpenChange = (open: boolean) => {
        if (!open) {
            setSelected([]);
            refresh();
        }
    };

    const handleUnassignRows = useCallback(
        async (rowsToRemove: Row[]) => {
            const nonInherited = rowsToRemove.filter(
                (r) => !(r.role as CompositeRole).isInherited,
            );
            if (nonInherited.length === 0) return;
            try {
                await Promise.all(
                    deleteMapping(adminClient, type, id, nonInherited),
                );
                toast.success(t("roleMappingUpdatedSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("roleMappingUpdatedError", {
                        error: getErrorMessage(error),
                    }),
                    { description: getErrorDescription(error) },
                );
            }
        },
        [adminClient, type, id, t, refresh],
    );

    const columns: ColumnDef<Row>[] = useMemo(
        () => [
            {
                id: "name",
                accessorFn: (row) => row.role?.name ?? "",
                header: t("name"),
                cell: ({ row }) => <ServiceRoleCell row={row} />,
            },
            {
                id: "inherent",
                accessorKey: "role",
                header: t("inherent"),
                cell: ({ row }) =>
                    (row.original.role as CompositeRole).isInherited ? t("true") : "-",
            },
            {
                id: "description",
                accessorKey: "role",
                header: t("description"),
                cell: ({ row }) =>
                    (translationFormatter(t)(
                        row.original.role.description,
                    ) as string) || "-",
            },
            ...(isManager
                ? [
                      {
                          id: "actions",
                          header: "",
                          size: 50,
                          enableHiding: false,
                          cell: ({ row }: { row: { original: Row } }) => (
                              <DataTableRowActions row={row}>
                                  <button
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => setSelected([row.original])}
                                      disabled={
                                          (row.original.role as CompositeRole)
                                              .isInherited
                                      }
                                  >
                                      {t("unAssignRole")}
                                  </button>
                              </DataTableRowActions>
                          ),
                      } as ColumnDef<Row>,
                  ]
                : []),
        ],
        [t, isManager],
    );

    if (loading) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            {showAssign && (
                <AddRoleMappingModal
                    id={id}
                    type={type}
                    filterType={filterType}
                    name={name}
                    onAssign={assignRoles}
                    onClose={() => setShowAssign(false)}
                />
            )}
            <AlertDialog open={selected.length > 0} onOpenChange={onRemoveDialogOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("removeMappingTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("removeMappingConfirm", { count: selected.length })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" data-testid="confirm" onClick={onDeleteConfirm}>
                            {t("remove")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="hideInheritedRoles"
                            data-testid="hideInheritedRoles"
                            checked={hide}
                            onCheckedChange={(check) => {
                                setHide(!!check);
                                refresh();
                            }}
                        />
                        <label
                            htmlFor="hideInheritedRoles"
                            className="text-sm font-medium"
                        >
                            {t("hideInheritedRoles")}
                        </label>
                    </div>
                    {isManager && (
                        <>
                            <AddRoleButton
                                onFilerTypeChange={(type) => {
                                    setFilterType(type);
                                    setShowAssign(true);
                                }}
                            />
                        </>
                    )}
                </div>
                <DataTable<Row>
                    data-testid="assigned-roles"
                    key={`${id}-${key}`}
                    columns={columns}
                    data={rows}
                    searchColumnId="name"
                    searchPlaceholder={t("searchByName")}
                    emptyMessage={t(`noRoles-${type}`)}
                    onDeleteRows={
                        isManager
                            ? (tableRows) =>
                                  handleUnassignRows(
                                      tableRows
                                          .filter(
                                              (r) =>
                                                  !(r.original
                                                      .role as CompositeRole)
                                                      .isInherited,
                                          )
                                          .map((r) => r.original),
                                  )
                            : undefined
                    }
                />
            </div>
        </>
    );
};
