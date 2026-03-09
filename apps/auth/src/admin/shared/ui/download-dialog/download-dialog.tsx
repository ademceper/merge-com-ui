import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { Textarea } from "@merge-rd/ui/components/textarea";
import { saveAs } from "file-saver";
import { useMemo, useState } from "react";
import { HelpItem, useHelp } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { useInstallationSnippet } from "@/admin/shared/api/use-installation-snippet";
import { ConfirmDialogModal } from "../confirm-dialog/confirm-dialog";

type DownloadDialogProps = {
    id: string;
    protocol?: string;
    open: boolean;
    toggleDialog: () => void;
};

export const DownloadDialog = ({
    id,
    open,
    toggleDialog,
    protocol = "openid-connect"
}: DownloadDialogProps) => {
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { enabled } = useHelp();
    const serverInfo = useServerInfo();

    const configFormats = serverInfo.clientInstallations![protocol];
    const [selected, setSelected] = useState(configFormats[configFormats.length - 1].id);

    const selectedConfig = useMemo(
        () => configFormats.find(config => config.id === selected) ?? null,
        [selected]
    );

    const { data: snippetData } = useInstallationSnippet(
        id,
        selected,
        selectedConfig?.mediaType
    );

    const sanitizeSnippet = (snippet: string) =>
        snippet.replace(
            /<PrivateKeyPem>.*<\/PrivateKeyPem>/gs,
            `<PrivateKeyPem>${t("privateKeyMask")}</PrivateKeyPem>`
        );

    const snippet = useMemo(() => {
        if (!snippetData) return undefined;
        if (typeof snippetData === "string") return sanitizeSnippet(snippetData);
        return snippetData;
    }, [snippetData]);

    return (
        <ConfirmDialogModal
            titleKey={t("downloadAdaptorTitle")}
            continueButtonLabel={t("download")}
            onConfirm={() => {
                saveAs(
                    new Blob([snippet!], { type: selectedConfig?.mediaType }),
                    selectedConfig?.filename
                );
            }}
            open={open}
            toggleDialog={toggleDialog}
        >
            <form>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type" className="flex items-center gap-1">
                            {t("formatOption")}
                            <HelpItem
                                helpText={t("downloadType")}
                                fieldLabelId="formatOption"
                            />
                        </Label>
                        <Select
                            value={selected}
                            onValueChange={value => setSelected(value || "")}
                        >
                            <SelectTrigger
                                id="type"
                                aria-label={t("selectOne")}
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {configFormats.map(configFormat => (
                                    <SelectItem
                                        key={configFormat.id}
                                        value={configFormat.id}
                                    >
                                        <span>{configFormat.displayType}</span>
                                        {enabled && configFormat.helpText && (
                                            <span className="block text-xs text-muted-foreground mt-0.5">
                                                {configFormat.helpText}
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!selectedConfig?.downloadOnly && (
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="details" className="flex items-center gap-1">
                                {t("details")}
                                <HelpItem
                                    helpText={t("detailsHelp")}
                                    fieldLabelId="details"
                                />
                            </Label>
                            <Textarea
                                id="details"
                                readOnly
                                rows={12}
                                className="resize-y"
                                value={
                                    snippet && typeof snippet === "string" ? snippet : ""
                                }
                                aria-label="text area example"
                            />
                        </div>
                    )}
                </div>
            </form>
        </ConfirmDialogModal>
    );
};
