import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
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
import { Switch } from "@merge-rd/ui/components/switch";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import type { EditOrganizationParams } from "@/admin/shared/lib/routes/organizations";
import { useParams } from "@/admin/shared/lib/use-params";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { ManageOrderDialog } from "../identity-providers/manage-order-dialog";
import { useHasIdentityProviders } from "./hooks/use-has-identity-providers";
import { useOrganizationIdentityProviders } from "./hooks/use-organization-identity-providers";
import { useUnlinkIdentityProvider } from "./hooks/use-unlink-identity-provider";
import { useUpdateIdentityProvider } from "./hooks/use-update-identity-provider";
import { LinkIdentityProviderModal } from "./link-identity-provider-modal";

type ShownOnLoginPageCheckProps = {
    row: IdentityProviderRepresentation;
};

type IdentityProvidersTableProps = {
    orgId: string;
    setSelectedRow: (row: IdentityProviderRepresentation | undefined) => void;
    toggleOpen: () => void;
    setManageDisplayDialog: (v: boolean) => void;
    setIdpToUnlink: (row: IdentityProviderRepresentation | undefined) => void;
};

const COLUMN_COUNT = 5;

const IdentityProvidersTable = ({
    orgId,
    setSelectedRow,
    toggleOpen,
    setManageDisplayDialog,
    setIdpToUnlink
}: IdentityProvidersTableProps) => {
    const { t } = useTranslation();
    const { data: providers = [] } = useOrganizationIdentityProviders(orgId);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredProviders = useMemo(() => {
        if (!search) return providers;
        const lower = search.toLowerCase();
        return providers.filter(p => p.alias?.toLowerCase().includes(lower));
    }, [providers, search]);

    const totalCount = filteredProviders.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedProviders = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredProviders.slice(start, start + pageSize);
    }, [filteredProviders, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between gap-2 py-2.5">
                <FacetedFormFilter
                    type="text"
                    size="small"
                    title={t("search")}
                    value={search}
                    onChange={value => setSearch(value)}
                    placeholder={t("searchProvider")}
                />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => {
                            setSelectedRow(undefined);
                            toggleOpen();
                        }}
                    >
                        {t("linkIdentityProvider")}
                    </Button>
                    <Button
                        data-testid="manageDisplayOrder"
                        variant="link"
                        onClick={() => setManageDisplayDialog(true)}
                    >
                        {t("manageDisplayOrder")}
                    </Button>
                </div>
            </div>

            <Table className="table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[25%]">{t("alias")}</TableHead>
                        <TableHead className="w-[20%]">{t("domain")}</TableHead>
                        <TableHead className="w-[20%]">{t("providerDetails")}</TableHead>
                        <TableHead className="w-[20%]">{t("hideOnLoginPage")}</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedProviders.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={COLUMN_COUNT}
                                className="text-center text-muted-foreground"
                            >
                                {providers.length === 0 ? (
                                    <Empty className="py-12">
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                {t("emptyIdentityProviderLink")}
                                            </EmptyTitle>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <EmptyDescription>
                                                {t(
                                                    "emptyIdentityProviderLinkInstructions"
                                                )}
                                            </EmptyDescription>
                                        </EmptyContent>
                                        <Button
                                            className="mt-2"
                                            onClick={() => {
                                                setSelectedRow(undefined);
                                                toggleOpen();
                                            }}
                                        >
                                            {t("linkIdentityProvider")}
                                        </Button>
                                    </Empty>
                                ) : (
                                    t("emptyIdentityProviderLink")
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedProviders.map(provider => (
                            <TableRow key={provider.alias}>
                                <TableCell className="truncate">
                                    {provider.alias}
                                </TableCell>
                                <TableCell className="truncate">
                                    {provider.config?.["kc.org.domain"] ?? "\u2014"}
                                </TableCell>
                                <TableCell className="truncate">
                                    {provider.providerId}
                                </TableCell>
                                <TableCell>
                                    <ShownOnLoginPageCheck row={provider} />
                                </TableCell>
                                <TableCell onClick={e => e.stopPropagation()}>
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
                                                onClick={() => {
                                                    setSelectedRow(provider);
                                                    toggleOpen();
                                                }}
                                            >
                                                {t("edit")}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setIdpToUnlink(provider)
                                                }
                                                className="text-destructive focus:text-destructive"
                                            >
                                                {t("unLinkIdentityProvider")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={COLUMN_COUNT} className="p-0">
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
        </div>
    );
};

const ShownOnLoginPageCheck = ({ row }: ShownOnLoginPageCheckProps) => {
    const { t } = useTranslation();
    const updateMutation = useUpdateIdentityProvider();

    const toggle = async (value: boolean) => {
        try {
            await updateMutation.mutateAsync({
                ...row,
                hideOnLogin: value
            });
            toast.success(t("linkUpdatedSuccessful"));
        } catch (error) {
            toast.error(t("linkUpdatedError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return <Switch checked={row.hideOnLogin} onCheckedChange={value => toggle(value)} />;
};

export const IdentityProviders = () => {
    const { t } = useTranslation();
    const { id: orgId } = useParams<EditOrganizationParams>();

    const { data: hasProviders = false } = useHasIdentityProviders();
    const unlinkMutation = useUnlinkIdentityProvider(orgId!);

    const [manageDisplayDialog, setManageDisplayDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IdentityProviderRepresentation>();
    const [idpToUnlink, setIdpToUnlink] = useState<IdentityProviderRepresentation>();
    const [open, toggleOpen] = useToggle();

    const onUnlinkConfirm = async () => {
        if (!idpToUnlink?.alias || !orgId) return;
        try {
            await unlinkMutation.mutateAsync(idpToUnlink.alias);
            setIdpToUnlink(undefined);
            toast.success(t("unLinkSuccessful"));
        } catch (error) {
            toast.error(t("unLinkError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            {manageDisplayDialog && (
                <ManageOrderDialog
                    orgId={orgId!}
                    onClose={() => {
                        setManageDisplayDialog(false);
                    }}
                />
            )}
            <div className="p-6">
                <AlertDialog
                    open={!!idpToUnlink}
                    onOpenChange={open => !open && setIdpToUnlink(undefined)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("identityProviderUnlink")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("identityProviderUnlinkConfirm")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                data-testid="confirm"
                                onClick={onUnlinkConfirm}
                            >
                                {t("unLinkIdentityProvider")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {open && (
                    <LinkIdentityProviderModal
                        orgId={orgId!}
                        identityProvider={selectedRow}
                        onClose={() => {
                            toggleOpen();
                        }}
                    />
                )}
                {!hasProviders ? (
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyTitle>{t("noIdentityProvider")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>
                                {t("noIdentityProviderInstructions")}
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <IdentityProvidersTable
                        orgId={orgId!}
                        setSelectedRow={setSelectedRow}
                        toggleOpen={toggleOpen}
                        setManageDisplayDialog={setManageDisplayDialog}
                        setIdpToUnlink={setIdpToUnlink}
                    />
                )}
            </div>
        </>
    );
};
