import { getErrorDescription, getErrorMessage, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button } from "@merge-rd/ui/components/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@merge-rd/ui/components/tabs";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams as useRouterParams } from "react-router-dom";
import { useAdminClient } from "../../app/admin-client";
import { FormAccess } from "../../shared/ui/form/form-access";
import { AttributesForm } from "../../shared/ui/key-value-form/attribute-form";
import { arrayToKeyValue } from "../../shared/ui/key-value-form/key-value-convert";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import { DetailOrganizationHeader } from "./detail-organization-header";
import { IdentityProviders } from "./identity-providers";
import { MembersSection } from "./members-section";
import { OrganizationForm, OrganizationFormType, convertToOrgForUpdate } from "./organization-form";
import { EditOrganizationParams, toEditOrganization } from "./routes/edit-organization";
import { useAccess } from "../../app/providers/access/access";
import { AdminEvents } from "../events/admin-events";
import { useState } from "react";

export default function DetailOrganization() {
    const { adminClient } = useAdminClient();

    const { realm, realmRepresentation } = useRealm();
    const { id } = useParams<EditOrganizationParams>();
    const { tab = "settings" } = useRouterParams<{ tab?: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const form = useForm<OrganizationFormType>();

    const save = async (org: OrganizationFormType) => {
        try {
            const payload = { ...convertToOrgForUpdate(org), alias: org.alias };
            await adminClient.organizations.updateById({ id }, payload);
            toast.success(t("organizationSaveSuccess"));
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    useFetch(
        () => adminClient.organizations.findOne({ id }),
        org => {
            if (!org) {
                throw new Error(t("notFound"));
            }
            form.reset({
                ...org,
                domains: org.domains?.map(d => d.name),
                attributes: arrayToKeyValue(org.attributes)
            });
        },
        [id]
    );

    const { hasAccess } = useAccess();
    const [activeEventsTab, setActiveEventsTab] = useState("adminEvents");

    const showEvents = realmRepresentation?.adminEventsEnabled && hasAccess("view-events");

    return (
        <div className="p-0">
            <FormProvider {...form}>
                <DetailOrganizationHeader save={() => save(form.getValues())} />
                <Tabs
                    value={tab}
                    onValueChange={(value) =>
                        navigate(toEditOrganization({ realm, id, tab: value as EditOrganizationParams["tab"] }))
                    }
                >
                    <TabsList>
                        <TabsTrigger value="settings" data-testid="org-settings-tab">
                            {t("settings")}
                        </TabsTrigger>
                        <TabsTrigger value="attributes" data-testid="org-attributes-tab">
                            {t("attributes")}
                        </TabsTrigger>
                        <TabsTrigger value="members" data-testid="org-members-tab">
                            {t("members")}
                        </TabsTrigger>
                        <TabsTrigger value="identityProviders" data-testid="org-idp-tab">
                            {t("identityProviders")}
                        </TabsTrigger>
                        {showEvents && (
                            <TabsTrigger value="events" data-testid="org-events-tab">
                                {t("events")}
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="settings">
                        <div className="p-6">
                            <FormAccess
                                role="anyone"
                                onSubmit={form.handleSubmit(save)}
                                isHorizontal
                            >
                                <OrganizationForm readOnly />
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        data-testid="save"
                                        disabled={
                                            !form.formState.isValid ||
                                            !form.formState.isDirty ||
                                            form.formState.isLoading ||
                                            form.formState.isValidating ||
                                            form.formState.isSubmitting
                                        }
                                    >
                                        {t("save")}
                                    </Button>
                                    <Button
                                        onClick={() => form.reset()}
                                        data-testid="reset"
                                        variant="link"
                                    >
                                        {t("reset")}
                                    </Button>
                                </div>
                            </FormAccess>
                        </div>
                    </TabsContent>
                    <TabsContent value="attributes">
                        <div className="p-6">
                            <AttributesForm
                                form={form}
                                save={save}
                                reset={() => form.reset({ ...form.getValues() })}
                                name="attributes"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="members">
                        <MembersSection />
                    </TabsContent>
                    <TabsContent value="identityProviders">
                        <IdentityProviders />
                    </TabsContent>
                    {showEvents && (
                        <TabsContent value="events">
                            <div>
                                <div className="flex border-b">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium ${activeEventsTab === "adminEvents" ? "border-b-2 border-primary" : ""}`}
                                        onClick={() => setActiveEventsTab("adminEvents")}
                                    >
                                        {t("adminEvents")}
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium ${activeEventsTab === "membershipEvents" ? "border-b-2 border-primary" : ""}`}
                                        onClick={() => setActiveEventsTab("membershipEvents")}
                                    >
                                        {t("membershipEvents")}
                                    </button>
                                </div>
                                {activeEventsTab === "adminEvents" && (
                                    <AdminEvents resourcePath={`organizations/${id}`} />
                                )}
                                {activeEventsTab === "membershipEvents" && (
                                    <AdminEvents resourcePath={`organizations/${id}/members`} />
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </FormProvider>
        </div>
    );
}
