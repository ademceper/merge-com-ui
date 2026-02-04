import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { getErrorDescription, getErrorMessage, KeycloakSpinner, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { saveAs } from "file-saver";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { prettyPrintJSON } from "../../util";
import { useParams } from "../../utils/useParams";
import type { ClientParams } from "../routes/Client";

export const AuthorizationExport = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { clientId } = useParams<ClientParams>();
const [code, setCode] = useState<string>();
    const [authorizationDetails, setAuthorizationDetails] =
        useState<ResourceServerRepresentation>();

    useFetch(
        () =>
            adminClient.clients.exportResource({
                id: clientId
            }),

        authDetails => {
            setCode(JSON.stringify(authDetails, null, 2));
            setAuthorizationDetails(authDetails);
        },
        []
    );

    const exportAuthDetails = () => {
        try {
            saveAs(
                new Blob([prettyPrintJSON(authorizationDetails)], {
                    type: "application/json"
                }),
                "test-authz-config.json"
            );
            toast.success(t("exportAuthDetailsSuccess"));
        } catch (error) {
            toast.error(t("exportAuthDetailsError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    if (!code) {
        return <KeycloakSpinner />;
    }

    return (
        <div className="p-6">
            <FormAccess
                isHorizontal
                role="manage-authorization"
                className="pf-v5-u-mt-lg"
            >
                <CodeEditor
                    data-testid="authorization-export-code-editor"
                    value={code!}
                    language="json"
                    readOnly
                    rows={10}
                    style={{ height: "30rem", overflow: "scroll" }}
                />
                <div className="flex gap-2">
                    <Button
                        data-testid="authorization-export-download"
                        onClick={() => exportAuthDetails()}
                    >
                        {t("download")}
                    </Button>
                    <Button
                        data-testid="authorization-export-copy"
                        variant="secondary"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(code!);
                                toast.success(t("copied"));
                            } catch (error) {
                                toast.error(t("copyError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
                            }
                        }}
                    >
                        {t("copy")}
                    </Button>
                </div>
            </FormAccess>
        </div>
    );
};
