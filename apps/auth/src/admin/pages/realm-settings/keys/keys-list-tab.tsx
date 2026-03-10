import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
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
import { DotsThree, Plus } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toKeysTab } from "@/admin/shared/lib/routes/realm-settings";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useKeysMetadata } from "../hooks/use-keys-metadata";

type KeyData = KeyMetadataRepresentation & {
    provider?: string;
    use?: string;
};

type KeysListTabProps = {
    realmComponents: ComponentRepresentation[];
};

export const KeysListTab = ({ realmComponents }: KeysListTabProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const formatDate = useFormatDate();
    const { realm } = useRealm();

    const [publicKey, setPublicKey] = useState("");
    const [certificate, setCertificate] = useState("");
    const { data: keyData = [] } = useKeysMetadata(realmComponents);

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const filteredData = useMemo(() => {
        if (!search) return keyData;
        const lower = search.toLowerCase();
        return keyData.filter(k => k.kid?.toLowerCase().includes(lower));
    }, [keyData, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const [togglePublicKeyDialog, PublicKeyDialog] = useConfirmDialog({
        titleKey: t("publicKey"),
        messageKey: publicKey,
        continueButtonLabel: "close",
        continueButtonVariant: "default",
        onConfirm: () => Promise.resolve()
    });

    const [toggleCertificateDialog, CertificateDialog] = useConfirmDialog({
        titleKey: t("certificate"),
        messageKey: certificate,
        continueButtonLabel: "close",
        continueButtonVariant: "default",
        onConfirm: () => Promise.resolve()
    });

    return (
        <>
            <PublicKeyDialog />
            <CertificateDialog />
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchKey")}
                    />
                    <Button
                        type="button"
                        data-testid="addProvider"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addProvider")}
                        onClick={() =>
                            navigate({
                                to: toKeysTab({ realm, tab: "providers" }) as string
                            })
                        }
                    >
                        <Plus size={20} className="shrink-0 sm:hidden" />
                        <span className="hidden sm:inline">{t("addProvider")}</span>
                    </Button>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("algorithm")}</TableHead>
                            <TableHead>{t("type")}</TableHead>
                            <TableHead>{t("kid")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead>{t("use")}</TableHead>
                            <TableHead>{t("provider")}</TableHead>
                            <TableHead>{t("validTo")}</TableHead>
                            <TableHead className="w-[60px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noKeys")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map(key => (
                                <TableRow key={key.kid}>
                                    <TableCell className="truncate">
                                        {key.algorithm ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {key.type ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {key.kid ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {t(`keysFilter.${key.status ?? "ACTIVE"}`)}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {key.use ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {key.provider ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {key.validTo
                                            ? formatDate(new Date(key.validTo))
                                            : "-"}
                                    </TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        {(key.publicKey || key.certificate) ? (
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
                                                    {key.publicKey && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setPublicKey(key.publicKey!);
                                                                togglePublicKeyDialog();
                                                            }}
                                                        >
                                                            {t("publicKey")}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {key.certificate && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setCertificate(key.certificate!);
                                                                toggleCertificateDialog();
                                                            }}
                                                        >
                                                            {t("certificate")}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : null}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={8} className="p-0">
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
