import type PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Input } from "@merge-rd/ui/components/input";
import {
    CaretDown,
    CaretRight,
    DotsThreeVertical,
    MagnifyingGlass
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import { TablePagination } from "@/admin/shared/ui/table-pagination";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    toNewPermission,
    toNewScope,
    toPermissionDetails,
    toResourceDetails,
    toScopeDetails
} from "@/admin/shared/lib/routes/clients";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useScopePermissions } from "./hooks/use-scope-permissions";
import { useScopes as useScopesQuery } from "./hooks/use-scopes";
import { DeleteScopeDialog } from "./delete-scope-dialog";
import { DetailDescriptionLink } from "./detail-description";

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

    const { t } = useTranslation();
    const { realm } = useRealm();

    const [deleteDialog, toggleDeleteDialog] = useToggle();
    const [scopes, setScopes] = useState<PermissionScopeRepresentation[]>();
    const [selectedScope, setSelectedScope] = useState<PermissionScopeRepresentation>();
    const [collapsed, setCollapsed] = useState<ExpandableRow[]>([]);

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState("");

    const { data: scopesData, refetch } = useScopesQuery(clientId, first, max, search);
    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        if (scopesData) {
            setScopes(scopesData.map(s => ({ ...s, isLoaded: false })));
            setCollapsed(scopesData.map(s => ({ id: s.id!, isExpanded: false })));
        }
    }, [scopesData]);

    const getScope = (id: string) => scopes?.find(scope => scope.id === id)!;
    const isExpanded = (id: string | undefined) =>
        collapsed.find(c => c.id === id)?.isExpanded || false;

    // Find the first newly-opened scope that needs loading
    const newlyOpenedScope = collapsed
        .filter(row => row.isExpanded)
        .map(({ id }) => scopes?.find(scope => scope.id === id))
        .find(s => s && !s.isLoaded);

    const { data: scopePermData } = useScopePermissions(
        clientId,
        newlyOpenedScope?.id ?? "",
        !!newlyOpenedScope
    );

    useEffect(() => {
        if (scopePermData && newlyOpenedScope) {
            const updatedScope = {
                ...newlyOpenedScope,
                resources: scopePermData.resources,
                permissions: scopePermData.permissions,
                isLoaded: true
            };
            setScopes(prev => {
                if (!prev) return prev;
                const index = prev.findIndex(s => s.id === newlyOpenedScope.id);
                if (index === -1) return prev;
                return [...prev.slice(0, index), updatedScope, ...prev.slice(index + 1)];
            });
        }
    }, [scopePermData, newlyOpenedScope?.id]);

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
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                            <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                            <Input
                                placeholder={t("searchByName")}
                                defaultValue={search}
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0"
                                onKeyDown={e => {
                                    if (e.key === "Enter")
                                        setSearch((e.target as HTMLInputElement).value);
                                }}
                            />
                        </div>
                        <TablePagination
                            count={scopes.length}
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
                        <Button data-testid="createAuthorizationScope" asChild>
                            <Link to={toNewScope({ realm, id: clientId }) as string}>
                                {t("createAuthorizationScope")}
                            </Link>
                        </Button>
                    </div>
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
                                                        const newVal = !isExpanded(
                                                            scope.id
                                                        );
                                                        setCollapsed([
                                                            ...collapsed.slice(
                                                                0,
                                                                rowIndex
                                                            ),
                                                            {
                                                                id: scope.id!,
                                                                isExpanded: newVal
                                                            },
                                                            ...collapsed.slice(
                                                                rowIndex + 1
                                                            )
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
                                            <TableCell
                                                data-testid={`name-column-${scope.name}`}
                                            >
                                                <Link
                                                    to={
                                                        toScopeDetails({
                                                            realm,
                                                            id: clientId,
                                                            scopeId: scope.id!
                                                        }) as string
                                                    }
                                                >
                                                    {scope.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{scope.displayName}</TableCell>
                                            <TableCell className="w-10">
                                                <Button variant="link" asChild>
                                                    <Link
                                                        to={
                                                            toNewPermission({
                                                                realm,
                                                                id: clientId,
                                                                permissionType: "scope",
                                                                selectedId: scope.id
                                                            }) as string
                                                        }
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
                                                <TableCell
                                                    colSpan={4}
                                                    className="bg-muted/30 p-4"
                                                >
                                                    {scope.isLoaded ? (
                                                        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_resource_details">
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
                                                                        permissionId:
                                                                            p.id!,
                                                                        permissionType:
                                                                            p.type!
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
                </div>
            )}
            {noData && !searching && (
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyTitle>{t("emptyAuthorizationScopes")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("emptyAuthorizationInstructions")}
                        </EmptyDescription>
                    </EmptyContent>
                    {!isDisabled && (
                        <Button className="mt-2" asChild>
                            <Link to={toNewScope({ id: clientId, realm }) as string}>
                                {t("createAuthorizationScope")}
                            </Link>
                        </Button>
                    )}
                </Empty>
            )}
            {noData && searching && (
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyTitle>{t("noSearchResults")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("noSearchResultsInstructions")}
                        </EmptyDescription>
                    </EmptyContent>
                </Empty>
            )}
        </div>
    );
};
