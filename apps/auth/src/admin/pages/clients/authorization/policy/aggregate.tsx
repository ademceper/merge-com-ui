import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { HelpItem } from "../../../../../shared/keycloak-ui-shared";
import { useParams } from "../../../../shared/lib/useParams";
import type { NewPermissionPolicyDetailsParams } from "../../../../shared/lib/routes/permissions";
import type { PolicyDetailsParams } from "../../../../shared/lib/routes/clients";
import { DecisionStrategySelect } from "../decision-strategy-select";
import { ResourcesPolicySelect } from "../resources-policy-select";

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
