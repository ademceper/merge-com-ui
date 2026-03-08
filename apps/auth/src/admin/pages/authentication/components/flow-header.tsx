import { useTranslation } from "@merge-rd/i18n";
import { DotsSixVertical } from "@phosphor-icons/react";
import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "@/admin/shared/ui/data-table";

export const FlowHeader = memo(() => {
    const { t } = useTranslation();
    return (
        <TableHeader>
            <TableRow aria-labelledby="headerName" id="header">
                <TableHead className="w-10">
                    <span
                        className="keycloak__authentication__header-drag-button inline-flex items-center text-muted-foreground"
                        aria-label={t("disabled")}
                    >
                        <DotsSixVertical className="size-4" />
                    </span>
                    <span className="sr-only">{t("expandRow")}</span>
                </TableHead>
                <TableHead>{t("steps")}</TableHead>
                <TableHead>{t("requirement")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
                <TableHead className="sr-only">{t("config")}</TableHead>
            </TableRow>
        </TableHeader>
    );
});
