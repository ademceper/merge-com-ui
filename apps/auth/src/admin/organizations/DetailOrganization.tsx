/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/organizations/DetailOrganization.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FormSubmitButton, useAlerts, useFetch } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { FormAccess } from "../components/form/FormAccess";
import { AttributesForm } from "../components/key-value-form/AttributeForm";
import { arrayToKeyValue } from "../components/key-value-form/key-value-convert";
import { RoutableTabs, useRoutableTab } from "../components/routable-tabs/RoutableTabs";
import { useRealm } from "../context/realm-context/RealmContext";
import { useParams } from "../utils/useParams";
import { DetailOrganizationHeader } from "./DetailOraganzationHeader";
import { IdentityProviders } from "./IdentityProviders";
import { MembersSection } from "./MembersSection";
import { OrganizationForm, OrganizationFormType, convertToOrg } from "./OrganizationForm";
import {
    EditOrganizationParams,
    OrganizationTab,
    toEditOrganization
} from "./routes/EditOrganization";
import { useAccess } from "../context/access/Access";
import { AdminEvents } from "../events/AdminEvents";
import { useState } from "react";

export default function DetailOrganization() {
    const { adminClient } = useAdminClient();
    const { addAlert, addError } = useAlerts();

    const { realm, realmRepresentation } = useRealm();
    const { id } = useParams<EditOrganizationParams>();
    const { t } = useTranslation();

    const form = useForm<OrganizationFormType>();

    const save = async (org: OrganizationFormType) => {
        try {
            const organization = convertToOrg(org);
            await adminClient.organizations.updateById({ id }, organization);
            addAlert(t("organizationSaveSuccess"));
        } catch (error) {
            addError("organizationSaveError", error);
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

    const useTab = (tab: OrganizationTab) =>
        useRoutableTab(
            toEditOrganization({
                realm,
                id,
                tab
            })
        );

    const settingsTab = useTab("settings");
    const attributesTab = useTab("attributes");
    const membersTab = useTab("members");
    const identityProvidersTab = useTab("identityProviders");
    const eventsTab = useTab("events");

    const { hasAccess } = useAccess();
    const [activeEventsTab, setActiveEventsTab] = useState("adminEvents");

    return (
        <div className="p-0">
            <FormProvider {...form}>
                <DetailOrganizationHeader save={() => save(form.getValues())} />
                <RoutableTabs
                    data-testid="organization-tabs"
                    aria-label={t("organization")}
                    isBox
                    mountOnEnter
                >
                    <Tab
                        id="settings"
                        data-testid="settingsTab"
                        title={t("settings")}
                        {...settingsTab}
                    >
                        <div className="p-6">
                            <FormAccess
                                role="anyone"
                                onSubmit={form.handleSubmit(save)}
                                isHorizontal
                            >
                                <OrganizationForm readOnly />
                                <div className="flex gap-2">
                                    <FormSubmitButton
                                        formState={form.formState}
                                        data-testid="save"
                                    >
                                        {t("save")}
                                    </FormSubmitButton>
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
                    </Tab>
                    <Tab
                        id="attributes"
                        data-testid="attributeTab"
                        title={t("attributes")}
                        {...attributesTab}
                    >
                        <div className="p-6">
                            <AttributesForm
                                form={form}
                                save={save}
                                reset={() =>
                                    form.reset({
                                        ...form.getValues()
                                    })
                                }
                                name="attributes"
                            />
                        </div>
                    </Tab>
                    <Tab
                        id="members"
                        data-testid="membersTab"
                        title={t("members")}
                        {...membersTab}
                    >
                        <MembersSection />
                    </Tab>
                    <Tab
                        id="identityProviders"
                        data-testid="identityProvidersTab"
                        title={t("identityProviders")}
                        {...identityProvidersTab}
                    >
                        <IdentityProviders />
                    </Tab>
                    {realmRepresentation?.adminEventsEnabled &&
                        hasAccess("view-events") && (
                            <Tab
                                data-testid="admin-events-tab"
                                title={t("adminEvents")}
                                {...eventsTab}
                            >
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
                                        <AdminEvents
                                            resourcePath={`organizations/${id}`}
                                        />
                                    )}
                                    {activeEventsTab === "membershipEvents" && (
                                        <AdminEvents
                                            resourcePath={`organizations/${id}/members`}
                                        />
                                    )}
                                </div>
                            </Tab>
                        )}
                </RoutableTabs>
            </FormProvider>
        </div>
    );
}
