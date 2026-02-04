import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FormSubmitButton, TextControl } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormAccess } from "../../components/form/FormAccess";
import { FileUploadForm } from "../../components/json-file-upload/FileUploadForm";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import {
    addTrailingSlash,
    convertFormValuesToObject,
    convertToFormValues
} from "../../util";
import { getAuthorizationHeaders } from "../../utils/getAuthorizationHeaders";
import { ClientDescription } from "../ClientDescription";
import { FormFields } from "../ClientDetails";
import { CapabilityConfig } from "../add/CapabilityConfig";
import { toClient } from "../routes/Client";
import { toClients } from "../routes/Clients";

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
            toast.error(t("importParseError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
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
            navigate(toClient({ realm, clientId: newClient.id, tab: "settings" }));
        } catch (error) {
            toast.error(t("clientImportError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <ViewHeader titleKey="importClient" subKey="clientsExplain" />
            <div className="p-6">
                <FormAccess
                    isHorizontal
                    onSubmit={handleSubmit(save)}
                    role="manage-clients"
                >
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
                            <FormSubmitButton
                                formState={formState}
                                allowInvalid
                                allowNonDirty
                            >
                                {t("save")}
                            </FormSubmitButton>
                            <Button
                                variant="link"
                                asChild
                            >
                                <Link to={toClients({ realm })}>
                                    {t("cancel")}
                                </Link>
                            </Button>
                        </div>
                    </FormProvider>
                </FormAccess>
            </div>
        </>
    );
}
