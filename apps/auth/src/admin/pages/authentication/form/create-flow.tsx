import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { toAuthentication, toFlow } from "../../../shared/lib/routes/authentication";
import { NameDescription } from "./name-description";

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
            navigate({
                to: toFlow({
                    realm,
                    id: id!,
                    usedBy: "notInUse"
                }) as string
            });
        } catch (error: any) {
            toast.error(
                t("flowCreateError", {
                    error: error.response?.data?.errorMessage || error
                })
            );
        }
    };

    return (
        <div className="p-6">
            <FormProvider {...form}>
                <FormAccess
                    isHorizontal
                    role="manage-authorization"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <NameDescription />
                    <SelectField
                        name="providerId"
                        label={t("flowType")}
                        labelIcon={t("topLevelFlowTypeHelp")}
                        aria-label={t("selectFlowType")}
                        defaultValue={TYPES[0]}
                        options={TYPES.map(type => ({
                            key: type,
                            value: t(`top-level-flow-type.${type}`)
                        }))}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            data-testid="create"
                            disabled={
                                formState.isLoading ||
                                formState.isValidating ||
                                formState.isSubmitting
                            }
                        >
                            {t("create")}
                        </Button>
                        <Button asChild data-testid="cancel" variant="link">
                            <Link to={toAuthentication({ realm }) as string}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </FormProvider>
        </div>
    );
}
