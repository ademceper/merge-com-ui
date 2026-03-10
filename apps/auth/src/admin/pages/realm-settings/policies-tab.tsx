import type ClientPolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientPolicyRepresentation";
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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Label } from "@merge-rd/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge-rd/ui/components/radio-group";
import { Separator } from "@merge-rd/ui/components/separator";
import { Switch } from "@merge-rd/ui/components/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { DotsThree } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { omit } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    KeycloakSpinner
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useUpdateClientPolicy } from "./hooks/use-update-client-policy";
import {
    toAddClientPolicy,
    toClientPolicies,
    toEditClientPolicy
} from "@/admin/shared/lib/routes/realm-settings";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { prettyPrintJSON } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { CodeEditor } from "@/admin/shared/ui/form/code-editor";
import { useClientPolicies } from "./hooks/use-client-policies";

type ClientPolicy = ClientPolicyRepresentation & {
    global?: boolean;
};

export const PoliciesTab = () => {

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [policies, setPolicies] = useState<ClientPolicy[]>();
    const [selectedPolicy, setSelectedPolicy] = useState<ClientPolicy>();
    const [code, setCode] = useState<string>();
    const [tablePolicies, setTablePolicies] = useState<ClientPolicy[]>();

    const form = useForm<Record<string, boolean>>({ mode: "onChange" });

    const { mutateAsync: updateClientPolicyMut } = useUpdateClientPolicy();
    const { data: allPoliciesData } = useClientPolicies();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    useEffect(() => {
        if (allPoliciesData) {
            const globalPolicies = allPoliciesData.globalPolicies?.map(p => ({
                ...p,
                global: true
            }));

            const pols = allPoliciesData.policies?.map(p => ({
                ...p,
                global: false
            }));

            const allClientPolicies = globalPolicies?.concat(pols ?? []);

            setPolicies(allClientPolicies);
            setTablePolicies(allClientPolicies || []);
            setCode(prettyPrintJSON(allClientPolicies));
        }
    }, [allPoliciesData]);

    const filteredPolicies = useMemo(() => {
        if (!tablePolicies) return [];
        if (!search) return tablePolicies;
        const lower = search.toLowerCase();
        return tablePolicies.filter(p => p.name?.toLowerCase().includes(lower));
    }, [tablePolicies, search]);

    const totalCount = filteredPolicies.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedPolicies = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredPolicies.slice(start, start + pageSize);
    }, [filteredPolicies, currentPage, pageSize]);

    const saveStatus = async () => {
        const switchValues = form.getValues();

        const updatedPolicies = policies
            ?.filter(policy => {
                return !policy.global;
            })
            .map<ClientPolicyRepresentation>(policy => {
                const enabled = switchValues[policy.name!];
                const enabledPolicy = {
                    ...policy,
                    enabled
                };
                delete enabledPolicy.global;
                return enabledPolicy;
            });

        try {
            await updateClientPolicyMut({
                policies: updatedPolicies
            });
            navigate({ to: toClientPolicies({ realm, tab: "policies" }) as string });
            toast.success(t("updateClientPolicySuccess"));
        } catch (error) {
            toast.error(t("updateClientPolicyError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const normalizePolicy = (policy: ClientPolicy): ClientPolicyRepresentation =>
        omit(policy, "global");

    const save = async () => {
        if (!code) {
            return;
        }

        try {
            const obj: ClientPolicy[] = JSON.parse(code);

            const changedPolicies = obj
                .filter(policy => !policy.global)
                .map(policy => normalizePolicy(policy));

            const changedGlobalPolicies = obj
                .filter(policy => policy.global)
                .map(policy => normalizePolicy(policy));

            try {
                await updateClientPolicyMut({
                    policies: changedPolicies,
                    globalPolicies: changedGlobalPolicies
                });
                toast.success(t("updateClientPoliciesSuccess"));
                // cache invalidated by hook
            } catch (error) {
                toast.error(
                    t("updateClientPoliciesError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        } catch (error) {
            toast.error(
                t("invalidJsonClientPoliciesError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const onDeleteConfirm = async () => {
        if (!selectedPolicy) return;
        const updatedPolicies = policies
            ?.filter(policy => {
                return !policy.global && policy.name !== selectedPolicy.name;
            })
            .map<ClientPolicyRepresentation>(policy => {
                const newPolicy = { ...policy };
                delete newPolicy.global;
                return newPolicy;
            });

        try {
            await updateClientPolicyMut({
                policies: updatedPolicies ?? []
            });
            setSelectedPolicy(undefined);
            toast.success(t("deleteClientPolicySuccess"));
            // cache invalidated by hook
        } catch (error) {
            toast.error(t("deleteClientPolicyError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    if (!policies) {
        return <KeycloakSpinner />;
    }
    return (
        <>
            <AlertDialog
                open={!!selectedPolicy}
                onOpenChange={open => !open && setSelectedPolicy(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteClientPolicyConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteClientPolicyConfirm", {
                                policyName: selectedPolicy?.name
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="pt-0">
                <div className="flex gap-2 kc-policies-config-section items-center">
                    <div>
                        <h1 className="text-base font-medium">
                            {t("policiesConfigType")}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroup
                            value={show ? "json" : "form"}
                            onValueChange={v => setShow(v === "json")}
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="form"
                                    id="formView-policiesView"
                                    data-testid="formView-policiesView"
                                />
                                <Label htmlFor="formView-policiesView">
                                    {t("policiesConfigTypes.formView")}
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="json"
                                    id="jsonEditor-policiesView"
                                    data-testid="jsonEditor-policiesView"
                                />
                                <Label htmlFor="jsonEditor-policiesView">
                                    {t("policiesConfigTypes.jsonEditor")}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <Separator />
            {!show ? (
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("clientPolicySearch")}
                        />
                        <Button id="createPolicy" asChild data-testid="createPolicy">
                            <Link to={toAddClientPolicy({ realm }) as string}>
                                {t("createClientPolicy")}
                            </Link>
                        </Button>
                    </div>

                    {filteredPolicies.length === 0 && !search ? (
                        <Empty className="py-12">
                            <EmptyHeader>
                                <EmptyTitle>{t("noClientPolicies")}</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                                <EmptyDescription>
                                    {t("noClientPoliciesInstructions")}
                                </EmptyDescription>
                            </EmptyContent>
                            <Button asChild className="mt-2">
                                <Link to={toAddClientPolicy({ realm }) as string}>
                                    {t("createClientPolicy")}
                                </Link>
                            </Button>
                        </Empty>
                    ) : (
                        <Table className="table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">{t("name")}</TableHead>
                                    <TableHead className="w-[20%]">{t("status")}</TableHead>
                                    <TableHead className="w-[40%]">{t("description")}</TableHead>
                                    <TableHead className="w-[15%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPolicies.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground"
                                        >
                                            {t("noClientPolicies")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPolicies.map(policy => (
                                        <TableRow key={policy.name}>
                                            <TableCell className="truncate">
                                                {policy.global ? (
                                                    policy.name
                                                ) : (
                                                    <Link
                                                        to={
                                                            toEditClientPolicy({
                                                                realm,
                                                                policyName: policy.name!
                                                            }) as string
                                                        }
                                                        className="text-primary hover:underline"
                                                    >
                                                        {policy.name}
                                                    </Link>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <SwitchRenderer
                                                    clientPolicy={policy}
                                                    form={form}
                                                    saveStatus={saveStatus}
                                                    onConfirm={async () => {
                                                        form.setValue(policy.name!, false);
                                                        await saveStatus();
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell className="truncate">
                                                {translationFormatter(t)(policy.description)}
                                            </TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                {policy.global ? null : (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon-sm">
                                                                <DotsThree
                                                                    weight="bold"
                                                                    className="size-4"
                                                                />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    setSelectedPolicy(policy)
                                                                }
                                                            >
                                                                {t("delete")}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} className="p-0">
                                        <TablePaginationFooter
                                            pageSize={pageSize}
                                            onPageSizeChange={setPageSize}
                                            onPreviousPage={() =>
                                                setCurrentPage(p => Math.max(0, p - 1))
                                            }
                                            onNextPage={() =>
                                                setCurrentPage(p =>
                                                    Math.min(totalPages - 1, p + 1)
                                                )
                                            }
                                            hasPreviousPage={currentPage > 0}
                                            hasNextPage={currentPage < totalPages - 1}
                                            totalCount={totalCount}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}
                </div>
            ) : (
                <>
                    <div className="mt-4 ml-4">
                        <CodeEditor
                            value={code}
                            language="json"
                            onChange={value => setCode(value)}
                            height={480}
                        />
                    </div>
                    <div className="mt-4 flex gap-2 ml-4">
                        <Button data-testid="jsonEditor-policies-saveBtn" onClick={save}>
                            {t("save")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="jsonEditor-reloadBtn"
                            onClick={() => {
                                setCode(prettyPrintJSON(tablePolicies));
                            }}
                        >
                            {t("reload")}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

type SwitchRendererProps = {
    clientPolicy: ClientPolicy;
    form: UseFormReturn<Record<string, boolean>>;
    saveStatus: () => void;
    onConfirm: () => void;
};

const SwitchRenderer = ({
    clientPolicy,
    form,
    saveStatus,
    onConfirm
}: SwitchRendererProps) => {
    const { t } = useTranslation();
    const [toggleDisableDialog, DisableConfirm] = useConfirmDialog({
        titleKey: "disablePolicyConfirmTitle",
        messageKey: "disablePolicyConfirm",
        continueButtonLabel: "disable",
        onConfirm
    });

    return (
        <>
            <DisableConfirm />
            <Controller
                name={clientPolicy.name!}
                data-testid={`${clientPolicy.name!}-switch`}
                defaultValue={clientPolicy.enabled}
                control={form.control}
                render={({ field }) => (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={field.value}
                            disabled={clientPolicy.global}
                            onCheckedChange={value => {
                                if (!value) {
                                    toggleDisableDialog();
                                } else {
                                    field.onChange(value);
                                    saveStatus();
                                }
                            }}
                            aria-label={clientPolicy.name!}
                        />
                        <span className="text-sm">
                            {field.value ? t("enabled") : t("disabled")}
                        </span>
                    </div>
                )}
            />
        </>
    );
};
