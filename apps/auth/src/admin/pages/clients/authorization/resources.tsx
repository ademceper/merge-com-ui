import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
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
import { CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import { TablePagination } from "@/admin/shared/ui/table-pagination";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "../../../../shared/keycloak-ui-shared";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useFetchPermissionsByResource, useDeleteResource } from "./hooks/use-authorization-mutations";
import {
    toCreateResource,
    toNewPermission,
    toResourceDetails
} from "../../../shared/lib/routes/clients";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { useResources as useResourcesQuery } from "./hooks/use-resources";
import { DetailCell } from "./detail-cell";
import { MoreLabel } from "./more-label";
import { SearchDropdown, type SearchForm } from "./search-dropdown";

type ResourcesProps = {
    clientId: string;
    isDisabled?: boolean;
};

type ExpandableResourceRepresentation = ResourceRepresentation & {
    isExpanded: boolean;
};

const UriRenderer = ({ row }: { row: ResourceRepresentation }) => (
    <span className="truncate block max-w-[200px]">
        {row.uris?.[0]} <MoreLabel array={row.uris} />
    </span>
);

export const AuthorizationResources = ({
    clientId,
    isDisabled = false
}: ResourcesProps) => {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const { mutateAsync: fetchPermissionsByResource } = useFetchPermissionsByResource();
    const { mutateAsync: deleteResourceMutation } = useDeleteResource();

    const [resources, setResources] = useState<ExpandableResourceRepresentation[]>();
    const [selectedResource, setSelectedResource] = useState<ResourceRepresentation>();
    const [permissions, setPermission] = useState<ResourceServerRepresentation[]>();

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState<SearchForm>({});

    const { data: resourcesData, refetch } = useResourcesQuery(
        clientId,
        first,
        max,
        search
    );
    const refresh = () => {
        refetch();
    };

    useEffect(() => {
        if (resourcesData) {
            setResources(
                resourcesData.map(resource => ({ ...resource, isExpanded: false }))
            );
        }
    }, [resourcesData]);

    const fetchPermissions = async (id: string) => {
        return fetchPermissionsByResource({ clientId, resourceId: id });
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteResource",
        children: (
            <>
                {t("deleteResourceConfirm")}
                {permissions?.length && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>{t("deleteResourceWarning")}</AlertTitle>
                        <p className="pt-1">
                            {permissions.map(permission => (
                                <strong key={permission.id} className="pr-2">
                                    {permission.name}
                                </strong>
                            ))}
                        </p>
                    </Alert>
                )}
            </>
        ),
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await deleteResourceMutation({
                    clientId,
                    resourceId: selectedResource?._id!
                });
                toast.success(t("resourceDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(
                    t("resourceDeletedError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    if (!resources) {
        return <KeycloakSpinner />;
    }

    const noData = resources.length === 0;
    const searching = Object.keys(search).length !== 0;
    return (
        <div className="p-0 bg-muted/30">
            <DeleteConfirm />
            {(!noData || searching) && (
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <SearchDropdown
                            search={search}
                            onSearch={setSearch}
                            type="resource"
                        />
                        <TablePagination
                            count={resources.length}
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
                        <Button
                            data-testid="createResource"
                            disabled={isDisabled}
                            asChild
                        >
                            <Link
                                to={toCreateResource({ realm, id: clientId }) as string}
                            >
                                {t("createResource")}
                            </Link>
                        </Button>
                    </div>
                    {!noData && (
                        <Table aria-label={t("resources")} className="text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead aria-hidden="true" className="w-10" />
                                    <TableHead>{t("name")}</TableHead>
                                    <TableHead>{t("displayName")}</TableHead>
                                    <TableHead>{t("type")}</TableHead>
                                    <TableHead>{t("owner")}</TableHead>
                                    <TableHead>{t("uris")}</TableHead>
                                    {!isDisabled && (
                                        <>
                                            <TableHead className="w-10" />
                                            <TableHead
                                                aria-hidden="true"
                                                className="w-10"
                                            />
                                        </>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resources.map((resource, rowIndex) => (
                                    <Fragment key={resource._id}>
                                        <TableRow>
                                            <TableCell className="w-10">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    aria-expanded={resource.isExpanded}
                                                    onClick={() => {
                                                        const rows = resources.map(
                                                            (r, index) =>
                                                                index === rowIndex
                                                                    ? {
                                                                          ...r,
                                                                          isExpanded:
                                                                              !r.isExpanded
                                                                      }
                                                                    : r
                                                        );
                                                        setResources(rows);
                                                    }}
                                                >
                                                    {resource.isExpanded ? (
                                                        <CaretDown className="size-4" />
                                                    ) : (
                                                        <CaretRight className="size-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell
                                                data-testid={`name-column-${resource.name}`}
                                                className="max-w-[150px] truncate"
                                            >
                                                <Link
                                                    to={
                                                        toResourceDetails({
                                                            realm,
                                                            id: clientId,
                                                            resourceId: resource._id!
                                                        }) as string
                                                    }
                                                >
                                                    {resource.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="max-w-[120px] truncate">
                                                {resource.displayName}
                                            </TableCell>
                                            <TableCell className="max-w-[100px] truncate">
                                                {resource.type}
                                            </TableCell>
                                            <TableCell className="max-w-[120px] truncate">
                                                {resource.owner?.name}
                                            </TableCell>
                                            <TableCell>
                                                <UriRenderer row={resource} />
                                            </TableCell>
                                            {!isDisabled && (
                                                <>
                                                    <TableCell className="w-10">
                                                        <Button variant="link" asChild>
                                                            <Link
                                                                to={
                                                                    toNewPermission({
                                                                        realm,
                                                                        id: clientId,
                                                                        permissionType:
                                                                            "resource",
                                                                        selectedId:
                                                                            resource._id
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
                                                                    aria-label={t(
                                                                        "delete"
                                                                    )}
                                                                >
                                                                    <DotsThreeVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={async () => {
                                                                        setSelectedResource(
                                                                            resource
                                                                        );
                                                                        setPermission(
                                                                            await fetchPermissions(
                                                                                resource._id!
                                                                            )
                                                                        );
                                                                        toggleDeleteDialog();
                                                                    }}
                                                                >
                                                                    {t("delete")}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                        {resource.isExpanded && (
                                            <TableRow>
                                                <TableCell />
                                                <TableCell
                                                    colSpan={isDisabled ? 5 : 7}
                                                    className="bg-muted/30 p-4"
                                                >
                                                    <DetailCell
                                                        clientId={clientId}
                                                        id={resource._id!}
                                                        uris={resource.uris}
                                                    />
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
            {noData && !searching && (
                <Empty className="py-12">
                    <EmptyHeader>
                        <EmptyTitle>{t("emptyResources")}</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("emptyResourcesInstructions")}
                        </EmptyDescription>
                    </EmptyContent>
                    {!isDisabled && (
                        <Button className="mt-2" asChild>
                            <Link
                                to={toCreateResource({ realm, id: clientId }) as string}
                            >
                                {t("createResource")}
                            </Link>
                        </Button>
                    )}
                </Empty>
            )}
        </div>
    );
};
