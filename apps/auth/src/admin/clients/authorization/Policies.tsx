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
import { toUpperCase } from "../../util";
import useToggle from "../../utils/useToggle";
import { toCreatePolicy } from "../routes/NewPolicy";
import { toPermissionDetails } from "../routes/PermissionDetails";
import { toPolicyDetails } from "../routes/PolicyDetails";
import { DetailDescriptionLink } from "./DetailDescription";
import { MoreLabel } from "./MoreLabel";
import { NewPolicyDialog } from "./NewPolicyDialog";
import { SearchDropdown, SearchForm } from "./SearchDropdown";
import { useIsAdminPermissionsClient } from "../../utils/useIsAdminPermissionsClient";
import { toCreatePermissionPolicy } from "../../permissions-configuration/routes/NewPermissionPolicy";
import { toPermissionPolicyDetails } from "../../permissions-configuration/routes/PermissionPolicyDetails";

type PoliciesProps = {
    clientId: string;
    isDisabled?: boolean;
};

type ExpandablePolicyRepresentation = PolicyRepresentation & {
    dependentPolicies?: PolicyRepresentation[];
    isExpanded: boolean;
};

const DependentPoliciesRenderer = ({ row }: { row: ExpandablePolicyRepresentation }) => {
    return (
        <>
            {row.dependentPolicies?.[0]?.name} <MoreLabel array={row.dependentPolicies} />
        </>
    );
};

export const AuthorizationPolicies = ({
    clientId,
    isDisabled = false
}: PoliciesProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const { realm } = useRealm();
    const navigate = useNavigate();

    const [policies, setPolicies] = useState<ExpandablePolicyRepresentation[]>();
    const [selectedPolicy, setSelectedPolicy] =
        useState<ExpandablePolicyRepresentation>();
    const [policyProviders, setPolicyProviders] =
        useState<PolicyProviderRepresentation[]>();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState<SearchForm>({});
    const [newDialog, toggleDialog] = useToggle();
    const isAdminPermissionsClient = useIsAdminPermissionsClient(clientId);

    useFetch(
        async () => {
            const policies = await adminClient.clients.listPolicies({
                first,
                max: max + 1,
                id: clientId,
                permission: "false",
                ...search
            });

            return await Promise.all([
                adminClient.clients.listPolicyProviders({ id: clientId }),
                ...(policies || []).map(async policy => {
                    const dependentPolicies =
                        await adminClient.clients.listDependentPolicies({
                            id: clientId,
                            policyId: policy.id!
                        });

                    return {
                        ...policy,
                        dependentPolicies,
                        isExpanded: false
                    };
                })
            ]);
        },
        ([providers, ...policies]) => {
            setPolicyProviders(
                providers.filter(p => p.type !== "resource" && p.type !== "scope")
            );
            setPolicies(policies);
        },
        [key, search, first, max]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deletePolicy",
        children: (
            <>
                {t("deletePolicyConfirm")}
                {selectedPolicy?.dependentPolicies &&
                    selectedPolicy.dependentPolicies.length > 0 && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>{t("deletePolicyWarning")}</AlertTitle>
                            <p className="pt-1">
                                {selectedPolicy.dependentPolicies.map(policy => (
                                    <strong key={policy.id} className="pr-2">
                                        {policy.name}
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
                await adminClient.clients.delPolicy({
                    id: clientId,
                    policyId: selectedPolicy?.id!
                });
                toast.success(t("policyDeletedSuccess"));
                refresh();
            } catch (error) {
                toast.error(t("policyDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    if (!policies) {
        return <KeycloakSpinner />;
    }

    const noData = policies.length === 0;
    const searching = Object.keys(search).length !== 0;
    return (
        <div className="p-0 bg-muted/30">
            <DeleteConfirm />
            {(!noData || searching) && (
                <>
                    {newDialog && (
                        <NewPolicyDialog
                            policyProviders={policyProviders}
                            onSelect={p =>
                                navigate(
                                    isAdminPermissionsClient
                                        ? toCreatePermissionPolicy({
                                              realm,
                                              permissionClientId: clientId,
                                              policyType: p.type!
                                          })
                                        : toCreatePolicy({
                                              id: clientId,
                                              realm,
                                              policyType: p.type!
                                          })
                                )
                            }
                            toggleDialog={toggleDialog}
                        />
                    )}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchDropdown types={policyProviders} search={search} onSearch={setSearch} type="policy" />
                            <TablePagination
                                count={policies.length}
                                first={first}
                                max={max}
                                onNextClick={setFirst}
                                onPreviousClick={setFirst}
                                onPerPageSelect={(_first, newMax) => { setMax(newMax); setFirst(0); }}
                                t={t}
                            />
                            <Button data-testid="createPolicy" onClick={() => toggleDialog()} disabled={isDisabled}>
                                {isAdminPermissionsClient ? t("createPermissionPolicy") : t("createPolicy")}
                            </Button>
                        </div>
                        {!noData && (
                            <Table aria-label={t("resources")} className="text-sm">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead aria-hidden="true" className="w-10" />
                                        <TableHead>{t("name")}</TableHead>
                                        <TableHead>{t("type")}</TableHead>
                                        <TableHead>{t("dependentPermission")}</TableHead>
                                        <TableHead>{t("description")}</TableHead>
                                        {!isDisabled && (
                                            <TableHead aria-hidden="true" className="w-10" />
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {policies.map((policy, rowIndex) => (
                                        <Fragment key={policy.id}>
                                            <TableRow>
                                                <TableCell className="w-10">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        aria-expanded={policy.isExpanded}
                                                        onClick={() => {
                                                            const rows = policies.map(
                                                                (p, index) =>
                                                                    index === rowIndex
                                                                        ? {
                                                                              ...p,
                                                                              isExpanded:
                                                                                  !p.isExpanded
                                                                          }
                                                                        : p
                                                            );
                                                            setPolicies(rows);
                                                        }}
                                                    >
                                                        {policy.isExpanded ? (
                                                            <CaretDown className="size-4" />
                                                        ) : (
                                                            <CaretRight className="size-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell
                                                    data-testid={`name-column-${policy.name}`}
                                                >
                                                    {isAdminPermissionsClient ? (
                                                        <Link
                                                            to={toPermissionPolicyDetails({
                                                                realm,
                                                                permissionClientId: clientId,
                                                                policyId: policy.id!,
                                                                policyType: policy.type!
                                                            })}
                                                        >
                                                            {policy.name}
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            to={toPolicyDetails({
                                                                realm,
                                                                id: clientId,
                                                                policyType: policy.type!,
                                                                policyId: policy.id!
                                                            })}
                                                        >
                                                            {policy.name}
                                                        </Link>
                                                    )}
                                                </TableCell>
                                                <TableCell>{toUpperCase(policy.type!)}</TableCell>
                                                <TableCell>
                                                    <DependentPoliciesRenderer row={policy} />
                                                </TableCell>
                                                <TableCell>{policy.description}</TableCell>
                                                {!isDisabled && (
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
                                                                        setSelectedPolicy(
                                                                            policy
                                                                        );
                                                                        toggleDeleteDialog();
                                                                    }}
                                                                >
                                                                    {t("delete")}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                            {policy.isExpanded && (
                                                <TableRow>
                                                    <TableCell />
                                                    <TableCell
                                                        colSpan={isDisabled ? 4 : 5}
                                                        className="bg-muted/30 p-4"
                                                    >
                                                        {!isAdminPermissionsClient && (
                                                            <dl
                                                                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 keycloak_resource_details"
                                                            >
                                                                <DetailDescriptionLink
                                                                    name="dependentPermission"
                                                                    array={
                                                                        policy.dependentPolicies
                                                                    }
                                                                    convert={p => p.name!}
                                                                    link={permission =>
                                                                        toPermissionDetails({
                                                                            realm,
                                                                            id: clientId,
                                                                            permissionId:
                                                                                permission.id!,
                                                                            permissionType:
                                                                                permission.type!
                                                                        })
                                                                    }
                                                                />
                                                            </dl>
                                                        )}
                                                        {isAdminPermissionsClient && (
                                                            <div className="space-y-2">
                                                                <div className="font-medium">
                                                                    {t("dependentPermission")}
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {policy.dependentPolicies?.map(
                                                                        (
                                                                            dependentPolicy,
                                                                            index
                                                                        ) => (
                                                                            <span
                                                                                key={index}
                                                                                className="ml-2"
                                                                            >
                                                                                {
                                                                                    dependentPolicy.name
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
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
                </>
            )}
            {noData && searching && (
                <Empty className="py-12">
                    <EmptyHeader><EmptyTitle>{t("noSearchResults")}</EmptyTitle></EmptyHeader>
                    <EmptyContent><EmptyDescription>{t("noSearchResultsInstructions")}</EmptyDescription></EmptyContent>
                </Empty>
            )}
            {noData && !searching && (
                <>
                    {newDialog && (
                        <NewPolicyDialog
                            policyProviders={policyProviders?.filter(p => p.type !== "aggregate")}
                            onSelect={p =>
                                navigate(
                                    isAdminPermissionsClient
                                        ? toCreatePermissionPolicy({ realm, permissionClientId: clientId, policyType: p.type! })
                                        : toCreatePolicy({ id: clientId, realm, policyType: p.type! })
                                )
                            }
                            toggleDialog={toggleDialog}
                        />
                    )}
                    <Empty className="py-12">
                        <EmptyHeader><EmptyTitle>{t("emptyPolicies")}</EmptyTitle></EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                {isAdminPermissionsClient
                                    ? t("emptyPermissionPoliciesInstructions")
                                    : t("emptyPoliciesInstructions")}
                            </EmptyDescription>
                            {!isDisabled && (
                                <Button className="mt-2" onClick={() => toggleDialog()}>
                                    {isAdminPermissionsClient ? t("createPermissionPolicy") : t("createPolicy")}
                                </Button>
                            )}
                        </EmptyContent>
                    </Empty>
                </>
            )}
        </div>
    );
};
