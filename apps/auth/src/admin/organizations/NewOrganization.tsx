import { FormSubmitButton } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormAccess } from "../components/form/FormAccess";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { useRealm } from "../context/realm-context/RealmContext";
import { OrganizationForm, OrganizationFormType, convertToOrg } from "./OrganizationForm";
import { toEditOrganization } from "./routes/EditOrganization";
import { toOrganizations } from "./routes/Organizations";

export default function NewOrganization() {
    const { adminClient } = useAdminClient();
const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const form = useForm({ mode: "onChange" });
    const { handleSubmit, formState } = form;

    const save = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            const { id } = await adminClient.organizations.create(organization);
            toast.success(t("organizationSaveSuccess"));
            navigate(toEditOrganization({ realm, id, tab: "settings" }));
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <ViewHeader titleKey="createOrganization" />
            <div className="p-6">
                <FormAccess role="anyone" onSubmit={handleSubmit(save)} isHorizontal>
                    <FormProvider {...form}>
                        <OrganizationForm />
                        <div className="flex gap-2">
                            <FormSubmitButton formState={formState} data-testid="save">
                                {t("save")}
                            </FormSubmitButton>
                            <Button
                                data-testid="cancel"
                                variant="link"
                                asChild
                            >
                                <Link to={toOrganizations({ realm })}>
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
