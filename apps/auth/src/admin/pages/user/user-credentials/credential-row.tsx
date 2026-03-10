import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { type ReactNode, useMemo } from "react";
import { TableCell } from "@merge-rd/ui/components/table";
import { useFormatDate } from "@/admin/shared/lib/use-format-date";
import { useLocaleSort } from "@/admin/shared/lib/use-locale-sort";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { CredentialDataDialog } from "./credential-data-dialog";

type CredentialRowProps = {
    credential: CredentialRepresentation;
    resetPassword: () => void;
    toggleDelete: () => void;
    children: ReactNode;
};

export const CredentialRow = ({
    credential,
    resetPassword,
    toggleDelete,
    children
}: CredentialRowProps) => {
    const formatDate = useFormatDate();
    const { t } = useTranslation();
    const [showData, toggleShow] = useToggle();
    const [kebabOpen, toggleKebab] = useToggle();
    const localeSort = useLocaleSort();

    const rows = useMemo(() => {
        if (!credential.credentialData) {
            return [];
        }

        const credentialData: Record<string, unknown> = JSON.parse(
            credential.credentialData
        );
        return localeSort(Object.entries(credentialData), ([key]) => key).map<
            [string, string]
        >(([key, value]) => {
            if (typeof value === "string") {
                return [key, value];
            }

            return [key, JSON.stringify(value)];
        });
    }, [credential.credentialData]);

    return (
        <>
            {showData && Object.keys(credential).length !== 0 && (
                <CredentialDataDialog
                    title={credential.userLabel || t("passwordDataTitle")}
                    credentialData={rows}
                    onClose={() => {
                        toggleShow();
                    }}
                />
            )}

            <TableCell>{children}</TableCell>
            <TableCell>{formatDate(new Date(credential.createdDate!))}</TableCell>
            <TableCell>
                <Button
                    className="kc-showData-btn"
                    variant="link"
                    data-testid="showDataBtn"
                    onClick={toggleShow}
                >
                    {t("showDataBtn")}
                </Button>
            </TableCell>
            {credential.type === "password" ? (
                <TableCell>
                    <Button
                        variant="outline"
                        data-testid="resetPasswordBtn"
                        onClick={resetPassword}
                    >
                        {t("resetPasswordBtn")}
                    </Button>
                </TableCell>
            ) : (
                <TableCell />
            )}
            <TableCell>
                <DropdownMenu open={kebabOpen} onOpenChange={toggleKebab}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Kebab toggle">
                            <DotsThreeVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            data-testid="deleteDropdownItem"
                            onClick={() => {
                                toggleDelete();
                                toggleKebab();
                            }}
                        >
                            {t("deleteBtn")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </>
    );
};
