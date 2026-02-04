import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import {
    ListEmptyState,
    PaginatingTableToolbar,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { toNewPermission } from "../routes/NewPermission";
import { toNewScope } from "../routes/NewScope";
import { toPermissionDetails } from "../routes/PermissionDetails";
import { toResourceDetails } from "../routes/Resource";
import { toScopeDetails } from "../routes/Scope";
import { DeleteScopeDialog } from "./DeleteScopeDialog";
import { DetailDescriptionLink } from "./DetailDescription";

type ScopesProps = {
    clientId: string;
    isDisabled?: boolean;
};

export type PermissionScopeRepresentation = ScopeRepresentation & {
    permissions?: PolicyRepresentation[];
    isLoaded: boolean;
};

type ExpandableRow = {
    id: string;
    isExpanded: boolean;
};

export const AuthorizationScopes = ({ clientId, isDisabled = false }: ScopesProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();

    const [deleteDialog, toggleDeleteDialog] = useToggle();
    const [scopes, setScopes] = useState<PermissionScopeRepresentation[]>();
    const [selectedScope, setSelectedScope] = useState<PermissionScopeRepresentation>();
    const [collapsed, setCollapsed] = useState<ExpandableRow[]>([]);

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState("");

    useFetch(
        () => {
            const params = {
                first,
                max: max + 1,
                deep: false,
                name: search
            };
            return adminClient.clients.listAllScopes({
                ...params,
                id: clientId
            });
        },
        scopes => {
            setScopes(scopes.map(s => ({ ...s, isLoaded: false })));
            setCollapsed(scopes.map(s => ({ id: s.id!, isExpanded: false })));
        },
        [key, search, first, max]
    );

    const getScope = (id: string) => scopes?.find(scope => scope.id === id)!;
    const isExpanded = (id: string | undefined) =>
        collapsed.find(c => c.id === id)?.isExpanded || false;

    useFetch(
        () => {
            const newlyOpened = collapsed
                .filter(row => row.isExpanded)
                .map(({ id }) => getScope(id))
                .filter(s => !s.isLoaded);

            return Promise.all(
                newlyOpened.map(async scope => {
                    const [resources, permissions] = await Promise.all([
                        adminClient.clients.listAllResourcesByScope({
                            id: clientId,
                            scopeId: scope.id!
                        }),
                        adminClient.clients.listAllPermissionsByScope({
                            id: clientId,
                            scopeId: scope.id!
                        })
                    ]);

                    return {
                        ...scope,
                        resources,
                        permissions,
                        isLoaded: true
                    };
                })
            );
        },
        resourcesScopes => {
            let result = [...(scopes || [])];
            resourcesScopes.forEach(resourceScope => {
                const index = scopes?.findIndex(scope => resourceScope.id === scope.id)!;
                result = [
                    ...result.slice(0, index),
                    resourceScope,
                    ...result.slice(index + 1)
                ];
            });

            setScopes(result);
        },
        [collapsed]
    );

    if (!scopes) {
        return <KeycloakSpinner />;
    }

    const noData = scopes.length === 0;
    const searching = search !== "";
    return (
        <div className="p-0 bg-muted/30">
            <DeleteScopeDialog
                clientId={clientId}
                open={deleteDialog}
                toggleDialog={toggleDeleteDialog}
                selectedScope={selectedScope}
                refresh={refresh}
            />
            {(!noData || searching) && (
                <PaginatingTableToolbar
                    count={scopes.length}
                    first={first}
                    max={max}
                    onNextClick={setFirst}
                    onPreviousClick={setFirst}
                    onPerPageSelect={(first, max) => {
                        setFirst(first);
                        setMax(max);
                    }}
                    inputGroupName="search"
                    inputGroupPlaceholder={t("searchByName")}
                    inputGroupOnEnter={setSearch}
                    toolbarItem={
                        <Button
                            data-testid="createAuthorizationScope"
                            asChild
                        >
                            <Link to={toNewScope({ realm, id: clientId })}>
                                {t("createAuthorizationScope")}
                            </Link>
                        </Button>
                    }
                >
                    {!noData && (
                        <Table aria-label={t("scopes")} className="text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead aria-hidden="true" className="w-10" />
                                    <TableHead>{t("name")}</TableHead>
                                    <TableHead>{t("displayName")}</TableHead>
                                    <TableHead className="w-10" />
                                    <TableHead aria-hidden="true" className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scopes.map((scope, rowIndex) => (
                                    <Fragment key={scope.id}>
                                        <TableRow>
                                            <TableCell className="w-10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-expanded={isExpanded(scope.id)}
                                                    onClick={() => {
                                                        const newVal = !isExpanded(scope.id);
                                                        setCollapsed([
                                                            ...collapsed.slice(0, rowIndex),
                                                            { id: scope.id!, isExpanded: newVal },
                                                            ...collapsed.slice(rowIndex + 1)
                                                        ]);
                                                    }}
                                                >
                                                    {isExpanded(scope.id) ? (
                                                        <CaretDown className="size-4" />
                                                    ) : (
                                                        <CaretRight className="size-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell data-testid={`name-column-${scope.name}`}>
                                                <Link
                                                    to={toScopeDetails({
                                                        realm,
                                                        id: clientId,
                                                        scopeId: scope.id!
                                                    })}
                                                >
                                                    {scope.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{scope.displayName}</TableCell>
                                            <TableCell className="w-10">
                                                <Button variant="link" asChild>
                                                    <Link
                                                        to={toNewPermission({
                                                            realm,
                                                            id: clientId,
                                                            permissionType: "scope",
                                                            selectedId: scope.id
                                                        })}
                                                    >
                                                        {t("createPermission")}
                                                    </Link>
                                                </Button>
                                            </TableCell>
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
                                                                setSelectedScope(scope);
                                                                toggleDeleteDialog();
                                                            }}
                                                        >
                                                            {t("delete")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        {isExpanded(scope.id) && (
                                            <TableRow>
                                                <TableCell />
                                                <TableCell colSpan={4} className="bg-muted/30 p-4">
                                                    {scope.isLoaded ? (
                                                        <dl
                                                            className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_resource_details"
                                                        >
                                                            <DetailDescriptionLink
                                                                name="resources"
                                                                array={scope.resources}
                                                                convert={r => r.name!}
                                                                link={r =>
                                                                    toResourceDetails({
                                                                        id: clientId,
                                                                        realm,
                                                                        resourceId: r._id!
                                                                    })
                                                                }
                                                            />
                                                            <DetailDescriptionLink
                                                                name="associatedPermissions"
                                                                array={scope.permissions}
                                                                convert={p => p.name!}
                                                                link={p =>
                                                                    toPermissionDetails({
                                                                        id: clientId,
                                                                        realm,
                                                                        permissionId: p.id!,
                                                                        permissionType: p.type!
                                                                    })
                                                                }
                                                            />
                                                        </dl>
                                                    ) : (
                                                        <KeycloakSpinner />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </PaginatingTableToolbar>
            )}
            {noData && !searching && (
                <ListEmptyState
                    message={t("emptyAuthorizationScopes")}
                    instructions={t("emptyAuthorizationInstructions")}
                    isDisabled={isDisabled}
                    onPrimaryAction={() => navigate(toNewScope({ id: clientId, realm }))}
                    primaryActionText={t("createAuthorizationScope")}
                />
            )}
            {noData && searching && (
                <ListEmptyState
                    isSearchVariant
                    isDisabled={isDisabled}
                    message={t("noSearchResults")}
                    instructions={t("noSearchResultsInstructions")}
                />
            )}
        </div>
    );
};
