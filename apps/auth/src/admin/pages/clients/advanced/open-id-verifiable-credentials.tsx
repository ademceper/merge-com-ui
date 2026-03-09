import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { convertAttributeNameToForm } from "@/admin/shared/lib/util";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import type { FormFields, SaveOptions } from "../client-details";

type OpenIdVerifiableCredentialsProps = {
    client: ClientRepresentation;
    save: (options?: SaveOptions) => void;
    reset: () => void;
};

export const OpenIdVerifiableCredentials = ({
    save,
    reset
}: OpenIdVerifiableCredentialsProps) => {
    const { t } = useTranslation();

    return (
        <FormAccess role="manage-clients" isHorizontal>
            <DefaultSwitchControl
                name={convertAttributeNameToForm<FormFields>(
                    "attributes.oid4vci.enabled"
                )}
                label={t("oid4vciEnabled")}
                labelIcon={t("oid4vciEnabledHelp")}
                stringify
            />
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    id="oid4vciSave"
                    data-testid="oid4vciSave"
                    onClick={() => save()}
                >
                    {t("save")}
                </Button>
                <Button
                    id="oid4vciRevert"
                    data-testid="oid4vciRevert"
                    variant="link"
                    onClick={reset}
                >
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
