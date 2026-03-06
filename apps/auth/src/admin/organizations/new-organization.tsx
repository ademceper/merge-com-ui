import { Button } from "@merge-rd/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { FormAccess } from "../components/form/form-access";
import { useRealm } from "../context/realm-context/realm-context";
import { OrganizationForm, OrganizationFormType, convertToOrg } from "./organization-form";
import { toEditOrganization } from "./routes/edit-organization";
import { toOrganizations } from "./routes/organizations";

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
                        <div className="p-6">
                <FormAccess role="anyone" onSubmit={handleSubmit(save)} isHorizontal>
                    <FormProvider {...form}>
                        <OrganizationForm />
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                data-testid="save"
                                disabled={
                                    !formState.isValid ||
                                    !formState.isDirty ||
                                    formState.isLoading ||
                                    formState.isValidating ||
                                    formState.isSubmitting
                                }
                            >
                                {t("save")}
                            </Button>
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
