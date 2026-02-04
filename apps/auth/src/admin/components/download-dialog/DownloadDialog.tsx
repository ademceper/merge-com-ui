import { fetchWithError } from "@keycloak/keycloak-admin-client";
import { HelpItem, useFetch, useHelp } from "../../../shared/keycloak-ui-shared";
import { Textarea } from "@merge/ui/components/textarea";
import { Label } from "@merge/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { saveAs } from "file-saver";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { addTrailingSlash, prettyPrintJSON } from "../../util";
import { getAuthorizationHeaders } from "../../utils/getAuthorizationHeaders";
import { ConfirmDialogModal } from "../confirm-dialog/ConfirmDialog";

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
    const { adminClient } = useAdminClient();

    const { realm } = useRealm();
    const { t } = useTranslation();
    const { enabled } = useHelp();
    const serverInfo = useServerInfo();

    const configFormats = serverInfo.clientInstallations![protocol];
    const [selected, setSelected] = useState(configFormats[configFormats.length - 1].id);
    const [snippet, setSnippet] = useState<string | ArrayBuffer>();

    const selectedConfig = useMemo(
        () => configFormats.find(config => config.id === selected) ?? null,
        [selected]
    );

    const sanitizeSnippet = (snippet: string) =>
        snippet.replace(
            /<PrivateKeyPem>.*<\/PrivateKeyPem>/gs,
            `<PrivateKeyPem>${t("privateKeyMask")}</PrivateKeyPem>`
        );

    useFetch(
        async () => {
            if (selectedConfig?.mediaType === "application/zip") {
                const response = await fetchWithError(
                    `${addTrailingSlash(
                        adminClient.baseUrl
                    )}admin/realms/${realm}/clients/${id}/installation/providers/${selected}`,
                    {
                        method: "GET",
                        headers: getAuthorizationHeaders(
                            await adminClient.getAccessToken()
                        )
                    }
                );

                return response.arrayBuffer();
            } else {
                const snippet = await adminClient.clients.getInstallationProviders({
                    id,
                    providerId: selected
                });
                if (typeof snippet === "string") {
                    return sanitizeSnippet(snippet);
                } else {
                    return prettyPrintJSON(snippet);
                }
            }
        },
        snippet => setSnippet(snippet),
        [id, selected]
    );

    // Clear snippet when selected config changes, this prevents old snippets from being displayed during fetch.
    useEffect(() => setSnippet(""), [id, selected]);

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
                            <HelpItem helpText={t("downloadType")} fieldLabelId="formatOption" />
                        </Label>
                        <Select
                            value={selected}
                            onValueChange={(value) => setSelected(value || "")}
                        >
                            <SelectTrigger id="type" aria-label={t("selectOne")} className="w-full">
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
                                <HelpItem helpText={t("detailsHelp")} fieldLabelId="details" />
                            </Label>
                            <Textarea
                                id="details"
                                readOnly
                                rows={12}
                                className="resize-y"
                                value={
                                    snippet && typeof snippet === "string"
                                        ? snippet
                                        : ""
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
