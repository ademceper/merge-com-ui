import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { SelectField } from "@/shared/keycloak-ui-shared";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { useAuthFlows } from "../hooks/use-auth-flows";

type AuthenticationOverridesProps = {
    save: () => void;
    reset: () => void;
    protocol?: string;
    hasConfigureAccess?: boolean;
};

export const AuthenticationOverrides = ({
    protocol,
    save,
    reset,
    hasConfigureAccess
}: AuthenticationOverridesProps) => {
    const { t } = useTranslation();
    const { data: flows = [] } = useAuthFlows();

    return (
        <FormAccess
            role="manage-clients"
            fineGrainedAccess={hasConfigureAccess}
            isHorizontal
        >
            <SelectField
                name="authenticationFlowBindingOverrides.browser"
                label={t("browserFlow")}
                labelIcon={t("browserFlowHelp")}
                defaultValue=""
                options={[
                    { key: "", value: t("choose") },
                    ...flows.map(({ id, alias }) => ({ key: id!, value: alias! }))
                ]}
            />
            {protocol === "openid-connect" && (
                <SelectField
                    name="authenticationFlowBindingOverrides.direct_grant"
                    label={t("directGrant")}
                    labelIcon={t("directGrantHelp")}
                    defaultValue=""
                    options={[
                        { key: "", value: t("choose") },
                        ...flows.map(({ id, alias }) => ({ key: id!, value: alias! }))
                    ]}
                />
            )}
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={save}
                    data-testid="OIDCAuthFlowOverrideSave"
                >
                    {t("save")}
                </Button>
                <Button
                    variant="link"
                    onClick={reset}
                    data-testid="OIDCAuthFlowOverrideRevert"
                >
                    {t("revert")}
                </Button>
            </div>
        </FormAccess>
    );
};
