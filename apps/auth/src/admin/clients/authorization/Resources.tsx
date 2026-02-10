import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../shared/keycloak-ui-shared";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@merge/ui/components/empty";
import { toast } from "@merge/ui/components/sonner";
import { Alert, AlertTitle } from "@merge/ui/components/alert";
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
import { TablePagination } from "@merge/ui/components/pagination";
import { CaretDown, CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toNewPermission } from "../routes/NewPermission";
import { toCreateResource } from "../routes/NewResource";
import { toResourceDetails } from "../routes/Resource";
import { DetailCell } from "./DetailCell";
import { MoreLabel } from "./MoreLabel";
import { SearchDropdown, SearchForm } from "./SearchDropdown";

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
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const { realm } = useRealm();

    const [resources, setResources] = useState<ExpandableResourceRepresentation[]>();
    const [selectedResource, setSelectedResource] = useState<ResourceRepresentation>();
    const [permissions, setPermission] = useState<ResourceServerRepresentation[]>();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState<SearchForm>({});

    useFetch(
        () => {
            const params = {
                first,
                max: max + 1,
                deep: false,
                ...search
            };
            return adminClient.clients.listResources({
                ...params,
                id: clientId
            });
        },
        resources =>
            setResources(resources.map(resource => ({ ...resource, isExpanded: false }))),
        [key, search, first, max]
    );

    const fetchPermissions = async (id: string) => {
        return adminClient.clients.listPermissionsByResource({
            id: clientId,
            resourceId: id
        });
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
                await adminClient.clients.delResource({
                    id: clientId,
                    resourceId: selectedResource?._id!
                });
                toast.success(t("resourceDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("resourceDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
                        <SearchDropdown search={search} onSearch={setSearch} type="resource" />
                        <TablePagination
                            count={resources.length}
                            first={first}
                            max={max}
                            onNextClick={setFirst}
                            onPreviousClick={setFirst}
                            onPerPageSelect={(_first, newMax) => { setMax(newMax); setFirst(0); }}
                            t={t}
                        />
                        <Button data-testid="createResource" disabled={isDisabled} asChild>
                            <Link to={toCreateResource({ realm, id: clientId })}>{t("createResource")}</Link>
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
                                            <TableHead aria-hidden="true" className="w-10" />
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
                                                    to={toResourceDetails({
                                                        realm,
                                                        id: clientId,
                                                        resourceId: resource._id!
                                                    })}
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
                                                                to={toNewPermission({
                                                                    realm,
                                                                    id: clientId,
                                                                    permissionType:
                                                                        "resource",
                                                                    selectedId:
                                                                        resource._id
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
                                                    colSpan={
                                                        isDisabled ? 5 : 7
                                                    }
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
                    <EmptyHeader><EmptyTitle>{t("noSearchResults")}</EmptyTitle></EmptyHeader>
                    <EmptyContent><EmptyDescription>{t("noSearchResultsInstructions")}</EmptyDescription></EmptyContent>
                </Empty>
            )}
            {noData && !searching && (
                <Empty className="py-12">
                    <EmptyHeader><EmptyTitle>{t("emptyResources")}</EmptyTitle></EmptyHeader>
                    <EmptyContent><EmptyDescription>{t("emptyResourcesInstructions")}</EmptyDescription></EmptyContent>
                    {!isDisabled && <Button className="mt-2" asChild><Link to={toCreateResource({ realm, id: clientId })}>{t("createResource")}</Link></Button>}
                </Empty>
            )}
        </div>
    );
};
