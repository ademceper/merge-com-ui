import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../app/providers/access/access";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { useParams } from "../../shared/lib/useParams";
import { FormAccess } from "../../shared/ui/form/form-access";
import { AttributesForm } from "../../shared/ui/key-value-form/attribute-form";
import { arrayToKeyValue } from "../../shared/ui/key-value-form/key-value-convert";
import { AdminEvents } from "../events/admin-events";
import { useOrganization } from "./api/use-organization";
import { useUpdateOrganization } from "./api/use-update-organization";
import { DetailOrganizationHeader } from "./detail-organization-header";
import { IdentityProviders } from "./identity-providers";
import { MembersSection } from "./members-section";
import {
    convertToOrgForUpdate,
    OrganizationForm,
    type OrganizationFormType
} from "./organization-form";
import {
    type EditOrganizationParams,
    toEditOrganization
} from "../../shared/lib/routes/organizations";

export default function DetailOrganization() {
    const { realm, realmRepresentation } = useRealm();
    const { id, tab = "settings" } = useParams<
        EditOrganizationParams & { tab?: string }
    >();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const form = useForm<OrganizationFormType>();
    const { data: org } = useOrganization(id);
    const updateMutation = useUpdateOrganization(id);

    useEffect(() => {
        if (org) {
            form.reset({
                ...org,
                domains: org.domains?.map(d => d.name),
                attributes: arrayToKeyValue(org.attributes)
            });
        }
    }, [org]);

    const save = async (orgData: OrganizationFormType) => {
        try {
            const payload = { ...convertToOrgForUpdate(orgData), alias: orgData.alias };
            await updateMutation.mutateAsync(payload);
            toast.success(t("organizationSaveSuccess"));
        } catch (error) {
            toast.error(t("organizationSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const { hasAccess } = useAccess();
    const [activeEventsTab, setActiveEventsTab] = useState("adminEvents");

    const showEvents =
        realmRepresentation?.adminEventsEnabled && hasAccess("view-events");

    return (
        <div className="p-0">
            <FormProvider {...form}>
                <DetailOrganizationHeader save={() => save(form.getValues())} />
                <Tabs
                    value={tab}
                    onValueChange={value =>
                        navigate({
                            to: toEditOrganization({
                                realm,
                                id,
                                tab: value as EditOrganizationParams["tab"]
                            }) as string
                        })
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
                                        onClick={() =>
                                            setActiveEventsTab("membershipEvents")
                                        }
                                    >
                                        {t("membershipEvents")}
                                    </button>
                                </div>
                                {activeEventsTab === "adminEvents" && (
                                    <AdminEvents resourcePath={`organizations/${id}`} />
                                )}
                                {activeEventsTab === "membershipEvents" && (
                                    <AdminEvents
                                        resourcePath={`organizations/${id}/members`}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </FormProvider>
        </div>
    );
}
