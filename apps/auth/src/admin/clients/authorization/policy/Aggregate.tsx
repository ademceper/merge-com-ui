import { Label } from "@merge/ui/components/label";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../../../shared/keycloak-ui-shared";
import { useParams } from "../../../utils/useParams";
import type { PolicyDetailsParams } from "../../routes/PolicyDetails";
import { DecisionStrategySelect } from "../DecisionStrategySelect";
import { ResourcesPolicySelect } from "../ResourcesPolicySelect";
import { NewPermissionPolicyDetailsParams } from "../../../permissions-configuration/routes/NewPermissionPolicy";

export const Aggregate = () => {
    const { t } = useTranslation();
    const { id } = useParams<PolicyDetailsParams>();
    const { permissionClientId } = useParams<NewPermissionPolicyDetailsParams>();

    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("applyPolicy")}</Label>
                    <HelpItem helpText={t("applyPolicyHelp")} fieldLabelId="policies" />
                </div>
                <ResourcesPolicySelect
                    name="policies"
                    clientId={permissionClientId || id}
                />
            </div>
            <DecisionStrategySelect helpLabel="policyDecisionStagey" />
        </>
    );
};
