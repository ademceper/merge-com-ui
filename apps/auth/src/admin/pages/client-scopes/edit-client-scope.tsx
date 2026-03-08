import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import { Badge } from "@merge-rd/ui/components/badge";
import { buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { useNavigate, useParams as useRouterParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner,
    useHelp
} from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { ClientScopeParams } from "../../shared/lib/routes/client-scopes";
import { toClientScopes, toMapper } from "../../shared/lib/routes/client-scopes";
import { useParams } from "../../shared/lib/use-params";
import { convertFormValuesToObject } from "../../shared/lib/util";
import type { ClientScopeDefaultOptionalType } from "../../shared/ui/client-scope/client-scope-types";
import { useConfirmDialog } from "../../shared/ui/confirm-dialog/confirm-dialog";
import { RoleMapping, type Row } from "../../shared/ui/role-mapping/role-mapping";
import { AdminEvents } from "../events/admin-events";
import { useAddProtocolMappers } from "./hooks/use-add-protocol-mappers";
import { useAssignScopeRoles } from "./hooks/use-assign-scope-roles";
import { useClientScope } from "./hooks/use-client-scope";
import { useDeleteClientScope } from "./hooks/use-delete-client-scope";
import { useDeleteProtocolMapper } from "./hooks/use-delete-protocol-mapper";
import { useUpdateClientScope } from "./hooks/use-update-client-scope";
import { MapperList } from "./details/mapper-list";
import { ScopeForm } from "./details/scope-form";

export function EditClientScope() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm, realmRepresentation } = useRealm();
    const { id } = useParams<ClientScopeParams>();
    const { tab } = useRouterParams({ strict: false }) as { tab: string };
    const { enabled } = useHelp();
    const { data: clientScope, refetch: refetchScope } = useClientScope(id);
    const refresh = () => {
        refetchScope();
    };
    const { hasAccess } = useAccess();
    const { mutateAsync: updateScope } = useUpdateClientScope(id);
    const { mutateAsync: deleteScope } = useDeleteClientScope();
    const { mutateAsync: assignScopeRoles } = useAssignScopeRoles(id);
    const { mutateAsync: addProtocolMappers } = useAddProtocolMappers(id);
    const { mutateAsync: deleteProtocolMapper } = useDeleteProtocolMapper(id);

    const onSubmit = async (formData: ClientScopeDefaultOptionalType) => {
        const clientScope = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });

        try {
            await updateScope(clientScope);
            toast.success(t("updateSuccessClientScope"));
        } catch (error) {
            toast.error(t("updateErrorClientScope", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteClientScope", {
            count: 1,
            name: clientScope?.name
        }),
        messageKey: "deleteConfirmClientScopes",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await deleteScope({ id } as ClientScopeDefaultOptionalType);
                toast.success(t("deletedSuccessClientScope"));
                navigate({ to: toClientScopes({ realm }) as string });
            } catch (error) {
                toast.error(
                    t("deleteErrorClientScope", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    const assignRoles = async (rows: Row[]) => {
        try {
            await assignScopeRoles(rows);
            toast.success(t("roleMappingUpdatedSuccess"));
        } catch (error) {
            toast.error(t("roleMappingUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const addMappers = async (
        mappers: ProtocolMapperTypeRepresentation | ProtocolMapperRepresentation[]
    ): Promise<void> => {
        if (!Array.isArray(mappers)) {
            const mapper = mappers as ProtocolMapperTypeRepresentation;
            navigate({
                to: toMapper({
                    realm,
                    id: clientScope!.id!,
                    mapperId: mapper.id!,
                    viewMode: "new"
                }) as string
            });
        } else {
            try {
                await addProtocolMappers(mappers as ProtocolMapperRepresentation[]);
                refresh();
                toast.success(t("mappingCreatedSuccess"));
            } catch (error) {
                toast.error(t("mappingCreatedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    };

    const onDelete = async (mapper: ProtocolMapperRepresentation) => {
        try {
            await deleteProtocolMapper(mapper.id!);
            toast.success(t("mappingDeletedSuccess"));
            refresh();
        } catch (error) {
            toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
        return true;
    };

    if (!clientScope) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "mappers":
                return (
                    <MapperList
                        model={clientScope}
                        onAdd={addMappers}
                        onDelete={onDelete}
                        detailLink={mapperId =>
                            toMapper({
                                realm,
                                id: clientScope.id!,
                                mapperId: mapperId!,
                                viewMode: "edit"
                            })
                        }
                    />
                );
            case "scope":
                return (
                    <>
                        {enabled && (
                            <div className="p-6">
                                <Alert>
                                    <AlertTitle>{t("clientScopesRolesScope")}</AlertTitle>
                                </Alert>
                            </div>
                        )}
                        <RoleMapping
                            id={clientScope.id!}
                            name={clientScope.name!}
                            type="clientScopes"
                            save={assignRoles}
                        />
                    </>
                );
            case "events":
                return realmRepresentation?.adminEventsEnabled &&
                    hasAccess("view-events") ? (
                    <AdminEvents resourcePath={`*client-scopes/${id}`} />
                ) : null;
            default:
                return (
                    <div className="p-6">
                        <ScopeForm save={onSubmit} clientScope={clientScope} />
                    </div>
                );
        }
    };

    return (
        <>
            <DeleteConfirm />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge>{clientScope.protocol}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            data-testid="action-dropdown"
                            className={buttonVariants()}
                        >
                            {t("action")}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem key="delete" onClick={toggleDeleteDialog}>
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="p-0">
                <div className="bg-muted/30">{renderContent()}</div>
            </div>
        </>
    );
}
