import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { MultiSelectField, SelectField, SwitchControl } from "../../../shared/keycloak-ui-shared";
import { FormPanel } from "../../../shared/keycloak-ui-shared/scroll-form/FormPanel";
import { useMemo, useState } from "react";
import { FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormAccess } from "../../components/form/FormAccess";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { DEFAULT_LOCALE } from "../../i18n/i18n";
import { localeToDisplayName } from "../../util";
import { EffectiveMessageBundles } from "./EffectiveMessageBundles";
import { RealmOverrides } from "./RealmOverrides";

type LocalizationTabProps = {
    save: (realm: RealmRepresentation) => void;
    realm: RealmRepresentation;
    tableData: Record<string, string>[] | undefined;
};

export const LocalizationTab = ({ save, realm, tableData }: LocalizationTabProps) => {
    const { t } = useTranslation();
    const { whoAmI } = useWhoAmI();

    const [activeTab, setActiveTab] = useState(0);
    const form = useFormContext<RealmRepresentation>();
    const { control, reset, handleSubmit, formState } = form;

    const defaultSupportedLocales = realm.supportedLocales?.length
        ? realm.supportedLocales
        : [DEFAULT_LOCALE];

    const themeTypes = useServerInfo().themes!;
    const allLocales = useMemo(() => {
        const locales = Object.values(themeTypes).flatMap(theme =>
            theme.flatMap(({ locales }) => (locales ? locales : []))
        );
        return Array.from(new Set(locales));
    }, [themeTypes]);

    const watchSupportedLocales = useWatch({
        control,
        name: "supportedLocales",
        defaultValue: defaultSupportedLocales
    });

    const internationalizationEnabled = useWatch({
        control,
        name: "internationalizationEnabled",
        defaultValue: realm.internationalizationEnabled
    });

    const defaultLocales = useWatch({
        name: "defaultLocale",
        control,
        defaultValue: "en"
    });

    return (
        <Tabs value={String(activeTab)} onValueChange={(v) => setActiveTab(Number(v))}>
            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                    <TabsTrigger value="0" data-testid="rs-localization-locales-tab">
                        {t("locales")}
                    </TabsTrigger>
                    <TabsTrigger value="1" data-testid="rs-localization-realm-overrides-tab">
                        {t("realmOverrides")}
                    </TabsTrigger>
                    <TabsTrigger value="2" data-testid="rs-localization-effective-message-bundles-tab">
                        {t("effectiveMessageBundles")}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="0" className="mt-0 pt-0 outline-none">
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(save)}
                >
                    <FormPanel title={t("locales")}>
                        <div className="space-y-4">
                            <FormProvider {...form}>
                                <SwitchControl
                            name="internationalizationEnabled"
                            label={t("internationalization")}
                            labelIcon={t("internationalizationHelp")}
                            labelOn={t("enabled")}
                            labelOff={t("disabled")}
                            aria-label={t("internationalization")}
                        />
                        {internationalizationEnabled && (
                            <>
                                <MultiSelectField
                                    name="supportedLocales"
                                    label={t("supportedLocales")}
                                    labelIcon={t("supportedLocalesHelp")}
                                    defaultValue={defaultSupportedLocales}
                                    rules={{
                                        required: t("required"),
                                        validate: (value: string[]) =>
                                            value.every(v =>
                                                allLocales.includes(v)
                                            ) || t("invalidLocale")
                                    }}
                                    placeholderText={t("selectLocales")}
                                    options={allLocales.map(l => ({
                                        key: l,
                                        value: localeToDisplayName(l, whoAmI.locale) || l
                                    }))}
                                />
                                <SelectField
                                    name="defaultLocale"
                                    label={t("defaultLocale")}
                                    labelIcon={t("defaultLocaleHelp")}
                                    defaultValue={DEFAULT_LOCALE}
                                    rules={{
                                        required: t("required"),
                                        validate: (value: string) =>
                                            watchSupportedLocales?.includes(value) ||
                                            t("required")
                                    }}
                                    options={watchSupportedLocales!.map(l => ({
                                        key: l,
                                        value: localeToDisplayName(l, whoAmI.locale) || l
                                    }))}
                                />
                            </>
                        )}
                            </FormProvider>
                        </div>
                    </FormPanel>
                    <div className="flex gap-2 pt-2">
                        <FixedButtonsGroup
                            name="localization-tab"
                            reset={() => reset(realm)}
                            isSubmit
                            isDisabled={!formState.isDirty}
                        />
                    </div>
                </FormAccess>
            </TabsContent>
            <TabsContent value="1" className="mt-0 pt-0 outline-none">
                <RealmOverrides
                    internationalizationEnabled={internationalizationEnabled || false}
                    watchSupportedLocales={watchSupportedLocales || []}
                    realm={realm}
                    tableData={tableData}
                />
            </TabsContent>
            <TabsContent value="2" className="mt-0 pt-0 outline-none">
                <EffectiveMessageBundles
                    defaultSupportedLocales={defaultSupportedLocales}
                    defaultLocales={[defaultLocales!]}
                />
            </TabsContent>
        </Tabs>
    );
};
