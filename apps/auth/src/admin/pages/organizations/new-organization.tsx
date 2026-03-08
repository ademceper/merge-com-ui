import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { FormAccess } from "../../shared/ui/form/form-access";
import { useCreateOrganization } from "./api/use-create-organization";
import {
    convertToOrg,
    OrganizationForm,
    type OrganizationFormType
} from "./organization-form";
import { toEditOrganization, toOrganizations } from "../../shared/lib/routes/organizations";

export default function NewOrganization() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const form = useForm({ mode: "onChange" });
    const { handleSubmit, formState } = form;
    const createMutation = useCreateOrganization();

    const save = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            const { id } = await createMutation.mutateAsync(organization);
            toast.success(t("organizationSaveSuccess"));
            navigate({
                to: toEditOrganization({ realm, id, tab: "settings" }) as string
            });
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
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
                        <Button data-testid="cancel" variant="link" asChild>
                            <Link to={toOrganizations({ realm }) as string}>
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormProvider>
            </FormAccess>
        </div>
    );
}
