import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Badge } from "@merge-rd/ui/components/badge";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions,
    type Row as TableRow
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import {
    AddRoleButton,
    AddRoleMappingModal,
    type FilterType
} from "./add-role-mapping-modal";
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

const mapRoles = (assignedRoles: Row[], effectiveRoles: Row[], hide: boolean): Row[] => [
    ...(hide
        ? assignedRoles.map(row => ({
              id: row.role.id,
              ...row,
              role: {
                  ...row.role,
                  isInherited: false
              }
          }))
        : effectiveRoles.map(row => ({
              id: row.role.id,
              ...row,
              role: {
                  ...row.role,
                  isInherited:
                      assignedRoles.find(r => r.role.id === row.role.id) === undefined
              }
          })))
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
    save
}: RoleMappingProps) => {
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    const refresh = useCallback(() => setKey(k => k + 1), []);
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
            effectiveRoles = await getEffectiveRoles(type, id);
            effectiveClientRoles = (
                await getEffectiveClientRoles({ type, id })
            ).map(e => ({
                client: { clientId: e.client, id: e.clientId },
                role: {
                    id: e.id,
                    name: e.role,
                    description: e.description
                }
            }));
            effectiveRoles = effectiveRoles.filter(
                role =>
                    !effectiveClientRoles.some(
                        clientRole => clientRole.role.id === role.role.id
                    )
            );
        }

        const roles = await getMapping(type, id);
        const realmRolesMapping = roles.realmMappings?.map(role => ({ role })) || [];
        const clientMapping = Object.values(roles.clientMappings || {}).flatMap(client =>
            client.mappings.map((role: RoleRepresentation) => ({
                client: { clientId: client.client, ...client },
                role
            }))
        );

        const result = mapRoles(
            [...clientMapping, ...realmRolesMapping],
            [...effectiveClientRoles, ...effectiveRoles],
            hide
        );
        setRows(result);
        setLoading(false);
    }, [type, id, hide]);

    useEffect(() => {
        loadData();
    }, [loadData, key]);

    const onDeleteConfirm = async () => {
        try {
            await Promise.all(deleteMapping(type, id, selected));
            toast.success(t("roleMappingUpdatedSuccess"));
            setSelected([]);
            refresh();
        } catch (error) {
            toast.error(
                t("roleMappingUpdatedError", {
                    error: getErrorMessage(error)
                }),
                { description: getErrorDescription(error) }
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
                r => !(r.role as CompositeRole).isInherited
            );
            if (nonInherited.length === 0) return;
            try {
                await Promise.all(deleteMapping(type, id, nonInherited));
                toast.success(t("roleMappingUpdatedSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("roleMappingUpdatedError", {
                        error: getErrorMessage(error)
                    }),
                    { description: getErrorDescription(error) }
                );
            }
        },
        [type, id, t, refresh]
    );

    const columns: ColumnDef<Row>[] = useMemo(
        () => [
            {
                id: "name",
                accessorFn: row => row.role?.name ?? "",
                header: t("name"),
                cell: ({ row }) => <ServiceRoleCell row={row} />
            },
            {
                id: "inherent",
                accessorKey: "role",
                header: t("inherent"),
                cell: ({ row }) =>
                    (row.original.role as CompositeRole).isInherited ? t("true") : "-"
            },
            {
                id: "description",
                accessorKey: "role",
                header: t("description"),
                cell: ({ row }) =>
                    (translationFormatter(t)(row.original.role.description) as string) ||
                    "-"
            },
            ...(isManager
                ? [
                      {
                          id: "actions",
                          header: "",
                          size: 50,
                          enableHiding: false,
                          cell: ({ row }: { row: TableRow<Row> }) => (
                              <DataTableRowActions row={row}>
                                  <button
                                      type="button"
                                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => setSelected([row.original])}
                                      disabled={
                                          (row.original.role as CompositeRole).isInherited
                                      }
                                  >
                                      {t("unAssignRole")}
                                  </button>
                              </DataTableRowActions>
                          )
                      } as ColumnDef<Row>
                  ]
                : [])
        ],
        [t, isManager]
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
            <AlertDialog
                open={selected.length > 0}
                onOpenChange={onRemoveDialogOpenChange}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("removeMappingTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("removeMappingConfirm", { count: selected.length })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
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
                            onCheckedChange={check => {
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
                        <AddRoleButton
                            onFilerTypeChange={type => {
                                setFilterType(type);
                                setShowAssign(true);
                            }}
                        />
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
                            ? tableRows =>
                                  handleUnassignRows(
                                      tableRows
                                          .filter(
                                              r =>
                                                  !(r.original.role as CompositeRole)
                                                      .isInherited
                                          )
                                          .map(r => r.original)
                                  )
                            : undefined
                    }
                />
            </div>
        </>
    );
};
