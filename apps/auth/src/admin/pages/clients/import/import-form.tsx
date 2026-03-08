import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { getAuthorizationHeaders } from "../../../shared/lib/getAuthorizationHeaders";
import {
    addTrailingSlash,
    convertFormValuesToObject,
    convertToFormValues
} from "../../../shared/lib/util";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { FileUploadForm } from "../../../shared/ui/json-file-upload/file-upload-form";
import { CapabilityConfig } from "../add/capability-config";
import { ClientDescription } from "../client-description";
import type { FormFields } from "../client-details";
import { toClient } from "../../../shared/lib/routes/clients";
import { toClients } from "../../../shared/lib/routes/clients";

const isXml = (text: string) => text.match(/(<.[^(><.)]+>)/g);

export default function ImportForm() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const form = useForm<FormFields>();
    const { handleSubmit, setValue, formState } = form;
    const [imported, setImported] = useState<ClientRepresentation>({});
    const handleFileChange = async (contents: string) => {
        try {
            const parsed = await parseFileContents(contents);

            convertToFormValues(parsed, setValue);
            setImported(parsed);
        } catch (error) {
            toast.error(t("importParseError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    async function parseFileContents(contents: string): Promise<ClientRepresentation> {
        if (!isXml(contents)) {
            return JSON.parse(contents);
        }

        const response = await fetchWithError(
            `${addTrailingSlash(
                adminClient.baseUrl
            )}admin/realms/${realm}/client-description-converter`,
            {
                method: "POST",
                body: contents,
                headers: getAuthorizationHeaders(await adminClient.getAccessToken())
            }
        );

        if (!response.ok) {
            throw new Error(
                `Server responded with invalid status: ${response.statusText}`
            );
        }

        return response.json();
    }

    const save = async (client: ClientRepresentation) => {
        try {
            const newClient = await adminClient.clients.create({
                ...imported,
                ...convertFormValuesToObject({
                    ...client,
                    attributes: client.attributes || {}
                })
            });
            toast.success(t("clientImportSuccess"));
            navigate({
                to: toClient({ realm, clientId: newClient.id, tab: "settings" }) as string
            });
        } catch (error) {
            toast.error(t("clientImportError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <div className="p-6">
            <FormAccess isHorizontal onSubmit={handleSubmit(save)} role="manage-clients">
                <FormProvider {...form}>
                    <FileUploadForm
                        id="realm-file"
                        language="json"
                        extension=".json,.xml"
                        helpText={t("helpFileUploadClient")}
                        onChange={handleFileChange}
                    />
                    <ClientDescription hasConfigureAccess />
                    <TextControl name="protocol" label={t("type")} readOnly />
                    <CapabilityConfig unWrap={true} />
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="submit"
                            disabled={
                                formState.isLoading ||
                                formState.isValidating ||
                                formState.isSubmitting
                            }
                        >
                            {t("save")}
                        </Button>
                        <Button variant="link" asChild>
                            <Link to={toClients({ realm }) as string}>{t("cancel")}</Link>
                        </Button>
                    </div>
                </FormProvider>
            </FormAccess>
        </div>
    );
}
