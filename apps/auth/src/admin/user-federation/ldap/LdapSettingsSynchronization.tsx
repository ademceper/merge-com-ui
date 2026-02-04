import { Controller, FormProvider, UseFormReturn } from "react-hook-form";
import { Switch } from "@merge/ui/components/switch";
import { FormLabel } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { WizardSectionHeader } from "../../components/wizard-section-header/WizardSectionHeader";

export type LdapSettingsSynchronizationProps = {
    form: UseFormReturn;
    showSectionHeading?: boolean;
    showSectionDescription?: boolean;
};

export const LdapSettingsSynchronization = ({
    form,
    showSectionHeading = false,
    showSectionDescription = false
}: LdapSettingsSynchronizationProps) => {
    const { t } = useTranslation();

    const watchPeriodicSync = form.watch("config.periodicFullSync", false);
    const watchChangedSync = form.watch("config.periodicChangedUsersSync", false);

    return (
        <FormProvider {...form}>
            {showSectionHeading && (
                <WizardSectionHeader
                    title={t("synchronizationSettings")}
                    description={t("ldapSynchronizationSettingsDescription")}
                    showDescription={showSectionDescription}
                />
            )}

            <FormAccess role="manage-realm" isHorizontal>
                <FormLabel
                    hasNoPaddingTop
                    name="kc-import-users"
                    label={t("importUsers")}
                    labelIcon={
                        <HelpItem
                            helpText={t("importUsersHelp")}
                            fieldLabelId="importUsers"
                        />
                    }
                >
                    <Controller
                        name="config.importEnabled"
                        defaultValue={["true"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-import-users"
                                data-testid="import-users"
                                checked={field.value[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("importUsers")}
                            />
                        )}
                    />
                </FormLabel>
                <FormLabel
                    hasNoPaddingTop
                    name="syncRegistrations"
                    label={t("syncRegistrations")}
                    labelIcon={
                        <HelpItem
                            helpText={t("syncRegistrations")}
                            fieldLabelId="syncRegistrations"
                        />
                    }
                >
                    <Controller
                        name="config.syncRegistrations"
                        defaultValue={["true"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="syncRegistrations"
                                data-testid="syncRegistrations"
                                checked={field.value[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("syncRegistrations")}
                            />
                        )}
                    />
                </FormLabel>
                <TextControl
                    name="config.batchSizeForSync.0"
                    type="number"
                    min={0}
                    label={t("batchSize")}
                    labelIcon={t("batchSizeHelp")}
                />
                <FormLabel
                    name="kc-periodic-full-sync"
                    label={t("periodicFullSync")}
                    labelIcon={
                        <HelpItem
                            helpText={t("periodicFullSyncHelp")}
                            fieldLabelId="periodicFullSync"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.periodicFullSync"
                        defaultValue={false}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-periodic-full-sync"
                                data-testid="periodic-full-sync"
                                checked={field.value === true}
                                onCheckedChange={(value) => field.onChange(value)}
                                aria-label={t("periodicFullSync")}
                            />
                        )}
                    />
                </FormLabel>
                {watchPeriodicSync && (
                    <TextControl
                        name="config.fullSyncPeriod.0"
                        label={t("fullSyncPeriod")}
                        labelIcon={t("fullSyncPeriodHelp")}
                        type="number"
                        min={-1}
                        defaultValue={604800}
                    />
                )}
                <FormLabel
                    name="kc-periodic-changed-users-sync"
                    label={t("periodicChangedUsersSync")}
                    labelIcon={
                        <HelpItem
                            helpText={t("periodicChangedUsersSyncHelp")}
                            fieldLabelId="periodicChangedUsersSync"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.periodicChangedUsersSync"
                        defaultValue={false}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-periodic-changed-users-sync"
                                data-testid="periodic-changed-users-sync"
                                checked={field.value === true}
                                onCheckedChange={(value) => field.onChange(value)}
                                aria-label={t("periodicChangedUsersSync")}
                            />
                        )}
                    />
                </FormLabel>
                {watchChangedSync && (
                    <TextControl
                        name="config.changedSyncPeriod.0"
                        label={t("changedUsersSyncPeriod")}
                        labelIcon={t("changedUsersSyncHelp")}
                        type="number"
                        min={-1}
                        defaultValue={86400}
                    />
                )}
                <FormLabel
                    name="kc-remove-invalid-users"
                    label={t("removeInvalidUsers")}
                    labelIcon={
                        <HelpItem
                            helpText={t("removeInvalidUsersHelp")}
                            fieldLabelId="removeInvalidUsers"
                        />
                    }
                    hasNoPaddingTop
                >
                    <Controller
                        name="config.removeInvalidUsersEnabled"
                        defaultValue={["true"]}
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                                id="kc-remove-invalid-users"
                                data-testid="remove-invalid-users"
                                checked={field.value[0] === "true"}
                                onCheckedChange={(value) => field.onChange([`${value}`])}
                                aria-label={t("removeInvalidUsers")}
                            />
                        )}
                    />
                </FormLabel>
            </FormAccess>
        </FormProvider>
    );
};
