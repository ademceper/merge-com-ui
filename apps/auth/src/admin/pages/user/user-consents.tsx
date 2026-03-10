import type UserConsentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userConsentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
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
    EmptyMedia,
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
import { Cube, DotsThree, Trash } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useParams } from "@/admin/shared/lib/use-params";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useRevokeConsent } from "./hooks/use-revoke-consent";
import { useUserConsents as useUserConsentsQuery } from "./hooks/use-user-consents";

export const UserConsents = () => {

    const [selectedClient, setSelectedClient] = useState<UserConsentRepresentation>();
    const { t } = useTranslation();
    const formatDate = useFormatDate();

    const { id } = useParams<{ id: string }>();

    const { data: consents = [], refetch: refreshConsents } = useUserConsentsQuery(id);
    const { mutateAsync: revokeConsentMut } = useRevokeConsent(id);
    const refresh = () => refreshConsents();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const clientScopesRenderer = ({ grantedClientScopes }: UserConsentRepresentation) => {
        return (
            <div className="flex gap-1 flex-wrap kc-consents-chip-group">
                {grantedClientScopes!.map(currentChip => (
                    <Badge
                        key={currentChip}
                        variant="secondary"
                        className="kc-consents-chip"
                    >
                        {currentChip}
                    </Badge>
                ))}
            </div>
        );
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "revokeClientScopesTitle",
        messageKey: t("revokeClientScopes", {
            clientId: selectedClient?.clientId
        }),
        continueButtonLabel: "revoke",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await revokeConsentMut(selectedClient!.clientId!);

                refresh();

                toast.success(t("deleteGrantsSuccess"));
            } catch (error) {
                toast.error(t("deleteGrantsError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const filteredConsents = useMemo(() => {
        if (!search) return consents;
        const lower = search.toLowerCase();
        return consents.filter((c: UserConsentRepresentation) =>
            c.clientId?.toLowerCase().includes(lower)
        );
    }, [consents, search]);

    const totalCount = filteredConsents.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedConsents = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredConsents.slice(start, start + pageSize);
    }, [filteredConsents, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const emptyContent = (
        <Empty className="py-12">
            <EmptyMedia>
                <Cube className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
                <EmptyTitle>{t("noConsents")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("noConsentsText")}</EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    const colCount = 5;

    return (
        <>
            <DeleteConfirm />

            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder=" "
                    />
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20%]">{t("Client")}</TableHead>
                            <TableHead className="w-[30%]">
                                {t("grantedClientScopes")}
                            </TableHead>
                            <TableHead className="w-[15%]">{t("created")}</TableHead>
                            <TableHead className="w-[15%]">
                                {t("lastUpdated")}
                            </TableHead>
                            <TableHead className="w-[20%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedConsents.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={colCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {filteredConsents.length === 0 &&
                                    consents.length === 0
                                        ? emptyContent
                                        : t("noConsents")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedConsents.map(
                                (consent: UserConsentRepresentation) => (
                                    <TableRow key={consent.clientId}>
                                        <TableCell className="truncate">
                                            {consent.clientId ?? "\u2014"}
                                        </TableCell>
                                        <TableCell>
                                            {clientScopesRenderer(consent)}
                                        </TableCell>
                                        <TableCell>
                                            {consent.createdDate
                                                ? formatDate(
                                                      new Date(consent.createdDate)
                                                  )
                                                : "\u2014"}
                                        </TableCell>
                                        <TableCell>
                                            {consent.lastUpdatedDate
                                                ? formatDate(
                                                      new Date(consent.lastUpdatedDate)
                                                  )
                                                : "\u2014"}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                    >
                                                        <DotsThree
                                                            weight="bold"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedClient(consent);
                                                            toggleDeleteDialog();
                                                        }}
                                                    >
                                                        <Trash className="size-4" />
                                                        {t("revoke")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={colCount} className="p-0">
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
        </>
    );
};
