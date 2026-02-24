import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    DataTable,
    DataTableRowActions,
    type ColumnDef
} from "@merge/ui/components/table";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { useRealm } from "../../context/realm-context/RealmContext";
import useFormatDate from "../../utils/useFormatDate";
import { toKeysTab } from "../routes/KeysTab";

type KeyData = KeyMetadataRepresentation & {
    provider?: string;
};

type KeysListTabProps = {
    realmComponents: ComponentRepresentation[];
};

export const KeysListTab = ({ realmComponents }: KeysListTabProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const formatDate = useFormatDate();
    const { realm } = useRealm();

    const [publicKey, setPublicKey] = useState("");
    const [certificate, setCertificate] = useState("");
    const [keyData, setKeyData] = useState<KeyData[]>([]);

    useFetch(
        async () => {
            const keysMetaData = await adminClient.realms.getKeys({ realm });
            return keysMetaData.keys?.map(key => {
                const provider = realmComponents.find(
                    (c: ComponentRepresentation) => c.id === key.providerId
                );
                return { ...key, provider: provider?.name } as KeyData;
            }) ?? [];
        },
        setKeyData,
        []
    );

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
            enableColumnActions: false,
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
                        onClick={() => navigate(toKeysTab({ realm, tab: "providers" }))}
                    >
                        <Plus size={20} className="shrink-0 sm:hidden" />
                        <span className="hidden sm:inline">{t("addProvider")}</span>
                    </Button>
                }
            />
        </>
    );
};
