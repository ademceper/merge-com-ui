import type PolicyProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyProviderRepresentation";
import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../shared/keycloak-ui-shared";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@merge/ui/components/empty";
import { toast } from "@merge/ui/components/sonner";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { TablePagination } from "@merge/ui/components/pagination";
import { CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toNewPermission } from "../routes/NewPermission";
import { toPermissionDetails } from "../routes/PermissionDetails";
import { toPolicyDetails } from "../routes/PolicyDetails";
import { DetailDescriptionLink } from "./DetailDescription";
import { EmptyPermissionsState } from "./EmptyPermissionsState";
import { MoreLabel } from "./MoreLabel";
import { SearchDropdown, SearchForm } from "./SearchDropdown";

type PermissionsProps = {
    clientId: string;
    isDisabled?: boolean;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
    associatedPolicies?: PolicyRepresentation[];
    isExpanded: boolean;
};

const AssociatedPoliciesRenderer = ({ row }: { row: ExpandablePolicyRepresentation }) => {
    return (
        <>
            {row.associatedPolicies?.[0]?.name || "—"}{" "}
            <MoreLabel array={row.associatedPolicies} />
        </>
    );
};

export const AuthorizationPermissions = ({
    clientId,
    isDisabled = false
}: PermissionsProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();

    const [permissions, setPermissions] = useState<ExpandablePolicyRepresentation[]>();
    const [selectedPermission, setSelectedPermission] = useState<PolicyRepresentation>();
    const [policyProviders, setPolicyProviders] =
        useState<PolicyProviderRepresentation[]>();
    const [disabledCreate, setDisabledCreate] = useState<{
        resources: boolean;
        scopes: boolean;
    }>();
    const [createOpen, toggleCreate] = useToggle();
    const [search, setSearch] = useState<SearchForm>({});

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);

    useFetch(
        async () => {
            const permissions = await adminClient.clients.findPermissions({
                first,
                max: max + 1,
                id: clientId,
                ...search
            });

            return await Promise.all(
                permissions.map(async permission => {
                    const associatedPolicies =
                        await adminClient.clients.getAssociatedPolicies({
                            id: clientId,
                            permissionId: permission.id!
                        });

                    return {
                        ...permission,
                        associatedPolicies,
                        isExpanded: false
                    };
                })
            );
        },
        setPermissions,
        [key, search, first, max]
    );

    useFetch(
        async () => {
            const params = {
                first: 0,
                max: 1
            };
            const [policies, resources, scopes] = await Promise.all([
                adminClient.clients.listPolicyProviders({
                    id: clientId
                }),
                adminClient.clients.listResources({ ...params, id: clientId }),
                adminClient.clients.listAllScopes({ ...params, id: clientId })
            ]);
            return {
                policies: policies.filter(
                    p => p.type === "resource" || p.type === "scope"
                ),
                resources: resources.length !== 1,
                scopes: scopes.length !== 1
            };
        },
        ({ policies, resources, scopes }) => {
            setPolicyProviders(policies);
            setDisabledCreate({ resources, scopes });
        },
        []
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePermission",
        messageKey: t("deletePermissionConfirm", {
            permission: selectedPermission?.name
        }),
        continueButtonVariant: "destructive",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delPermission({
                    id: clientId,
                    type: selectedPermission?.type!,
                    permissionId: selectedPermission?.id!
                });
                toast.success(t("permissionDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("permissionDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    if (!permissions) {
        return <KeycloakSpinner />;
    }

    const noData = permissions.length === 0;
    const searching = Object.keys(search).length !== 0;
    return (
        <div className="p-0 bg-muted/30">
            <DeleteConfirm />
            {(!noData || searching) && (
                <>
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchDropdown
                                types={policyProviders}
                                search={search}
                                onSearch={setSearch}
                                type="permission"
                            />
                            <DropdownMenu open={createOpen} onOpenChange={toggleCreate}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="permissionCreateDropdown"
                                        disabled={isDisabled}
                                    >
                                        {t("createPermission")}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        data-testid="create-resource"
                                        disabled={
                                            isDisabled || disabledCreate?.resources
                                        }
                                        onClick={() =>
                                            navigate(
                                                toNewPermission({
                                                    realm,
                                                    id: clientId,
                                                    permissionType: "resource"
                                                })
                                            )
                                        }
                                    >
                                        {t("createResourceBasedPermission")}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        data-testid="create-scope"
                                        disabled={
                                            isDisabled || disabledCreate?.scopes
                                        }
                                        onClick={() =>
                                            navigate(
                                                toNewPermission({
                                                    realm,
                                                    id: clientId,
                                                    permissionType: "scope"
                                                })
                                            )
                                        }
                                    >
                                        {t("createScopeBasedPermission")}
                                    </DropdownMenuItem>
                                    {disabledCreate?.scopes && (
                                        <div className="p-2">
                                            <Alert variant="destructive" className="mt-2">
                                                <AlertTitle>{t("noScopeCreateHint")}</AlertTitle>
                                            </Alert>
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <TablePagination
                            count={permissions.length}
                            first={first}
                            max={max}
                            onNextClick={setFirst}
                            onPreviousClick={setFirst}
                            onPerPageSelect={(_first, newMax) => {
                                setMax(newMax);
                                setFirst(0);
                            }}
                            t={t}
                        />
                    </div>
                    {!noData && (
                        <Table aria-label={t("resources")} className="text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead aria-hidden="true" className="w-10" />
                                    <TableHead>{t("name")}</TableHead>
                                    <TableHead>{t("type")}</TableHead>
                                    <TableHead>{t("associatedPolicy")}</TableHead>
                                    <TableHead>{t("description")}</TableHead>
                                    <TableHead aria-hidden="true" className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((permission, rowIndex) => (
                                    <Fragment key={permission.id}>
                                        <TableRow>
                                            <TableCell className="w-10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-expanded={permission.isExpanded}
                                                    onClick={() => {
                                                        const rows = permissions.map(
                                                            (p, index) =>
                                                                index === rowIndex
                                                                    ? {
                                                                        ...p,
                                                                        isExpanded:
                                                                            !p.isExpanded
                                                                    }
                                                                    : p
                                                        );
                                                        setPermissions(rows);
                                                    }}
                                                >
                                                    {permission.isExpanded ? (
                                                        <CaretDown className="size-4" />
                                                    ) : (
                                                        <CaretRight className="size-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell
                                                data-testid={`name-column-${permission.name}`}
                                            >
                                                <Link
                                                    to={toPermissionDetails({
                                                        realm,
                                                        id: clientId,
                                                        permissionType: permission.type!,
                                                        permissionId: permission.id!
                                                    })}
                                                >
                                                    {permission.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    policyProviders?.find(
                                                        p => p.type === permission.type
                                                    )?.name
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <AssociatedPoliciesRenderer
                                                    row={permission}
                                                />
                                            </TableCell>
                                            <TableCell>{permission.description || "—"}</TableCell>
                                            <TableCell className="w-10">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            aria-label={t("delete")}
                                                        >
                                                            <DotsThreeVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedPermission(
                                                                    permission
                                                                );
                                                                toggleDeleteDialog();
                                                            }}
                                                        >
                                                            {t("delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        {permission.isExpanded && (
                                            <TableRow>
                                                <TableCell />
                                                <TableCell
                                                    colSpan={5}
                                                    className="bg-muted/30 p-4"
                                                >
                                                    <dl
                                                        className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_resource_details"
                                                    >
                                                        <DetailDescriptionLink
                                                            name="associatedPolicy"
                                                            array={
                                                                permission.associatedPolicies
                                                            }
                                                            convert={p => p.name!}
                                                            link={p =>
                                                                toPolicyDetails({
                                                                    id: clientId,
                                                                    realm,
                                                                    policyId: p.id!,
                                                                    policyType: p.type!
                                                                })
                                                            }
                                                        />
                                                    </dl>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </>
            )}
            {noData && !searching && (
                <EmptyPermissionsState
                    clientId={clientId}
                    isResourceEnabled={!isDisabled && disabledCreate?.resources}
                    isScopeEnabled={!isDisabled && disabledCreate?.scopes}
                />
            )}
            {noData && searching && (
                <Empty className="py-12">
                    <EmptyHeader><EmptyTitle>{t("noSearchResults")}</EmptyTitle></EmptyHeader>
                    <EmptyContent><EmptyDescription>{t("noSearchResultsInstructions")}</EmptyDescription></EmptyContent>
                </Empty>
            )}
        </div>
    );
};
