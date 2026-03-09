import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import { Plus } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toKeysTab } from "@/admin/shared/lib/routes/realm-settings";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { useKeysMetadata } from "../hooks/use-keys-metadata";

type KeyData = KeyMetadataRepresentation & {
    provider?: string;
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

    const columns: ColumnDef<KeyData>[] = [
        {
            accessorKey: "algorithm",
            header: t("algorithm")
        },
        {
            accessorKey: "type",
            header: t("type")
        },
        {
            accessorKey: "kid",
            header: t("kid")
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => t(`keysFilter.${row.original.status ?? "ACTIVE"}`)
        },
        {
            accessorKey: "use",
            header: t("use")
        },
        {
            accessorKey: "provider",
            header: t("provider"),
            cell: ({ row }) => row.original.provider ?? "-"
        },
        {
            accessorKey: "validTo",
            header: t("validTo"),
            cell: ({ row }) => {
                const validTo = row.original.validTo;
                return validTo ? formatDate(new Date(validTo)) : "-";
            }
        },
        {
            id: "publicKeyActions",
            accessorKey: "publicKey",
            header: "",
            size: 60,
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => {
                const { publicKey: pk, certificate: cert } = row.original;
                if (!pk && !cert) return null;
                return (
                    <DataTableRowActions row={row}>
                        {pk && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setPublicKey(pk!);
                                    togglePublicKeyDialog();
                                }}
                            >
                                {t("publicKey")}
                            </DropdownMenuItem>
                        )}
                        {cert && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setCertificate(cert!);
                                    toggleCertificateDialog();
                                }}
                            >
                                {t("certificate")}
                            </DropdownMenuItem>
                        )}
                    </DataTableRowActions>
                );
            }
        }
    ];

    return (
        <>
            <PublicKeyDialog />
            <CertificateDialog />
            <DataTable
                columns={columns}
                data={keyData}
                searchColumnId="kid"
                searchPlaceholder={t("searchKey")}
                emptyMessage={t("noKeys")}
                facetFilterColumnId="status"
                facetFilterLabel={t("selectFilterType")}
                toolbar={
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
                }
            />
        </>
    );
};
