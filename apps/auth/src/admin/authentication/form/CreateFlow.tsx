import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { SelectControl } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toAuthentication } from "../routes/Authentication";
import { toFlow } from "../routes/Flow";
import { NameDescription } from "./NameDescription";

const TYPES = ["basic-flow", "client-flow"] as const;

export default function CreateFlow() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const form = useForm<AuthenticationFlowRepresentation>();
    const { handleSubmit, formState } = form;

    const onSubmit = async (formValues: AuthenticationFlowRepresentation) => {
        const flow = { ...formValues, builtIn: false, topLevel: true };

        try {
            const { id } = await adminClient.authenticationManagement.createFlow(flow);
            toast.success(t("flowCreatedSuccess"));
            navigate(
                toFlow({
                    realm,
                    id: id!,
                    usedBy: "notInUse"
                })
            );
        } catch (error: any) {
            toast.error(t("flowCreateError", {
                    error: error.response?.data?.errorMessage || error
                }));
        }
    };

    return (
        <>
            <ViewHeader titleKey="createFlow" subKey="authenticationCreateFlowHelp" />
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        isHorizontal
                        role="manage-authorization"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <NameDescription />
                        <SelectControl
                            name="providerId"
                            label={t("flowType")}
                            labelIcon={t("topLevelFlowTypeHelp")}
                            aria-label={t("selectFlowType")}
                            controller={{ defaultValue: TYPES[0] }}
                            options={TYPES.map(type => ({
                                key: type,
                                value: t(`top-level-flow-type.${type}`)
                            }))}
                        />
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                data-testid="create"
                                disabled={formState.isLoading || formState.isValidating || formState.isSubmitting}
                            >
                                {t("create")}
                            </Button>
                            <Button asChild data-testid="cancel" variant="link">
                                <Link to={toAuthentication({ realm })}>{t("cancel")}</Link>
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
