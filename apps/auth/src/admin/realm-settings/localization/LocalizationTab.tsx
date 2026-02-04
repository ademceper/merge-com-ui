import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { SelectControl, SwitchControl } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { useMemo, useState } from "react";
import { FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
        <div>
            <div className="flex border-b" role="tablist">
                <button
                    role="tab"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    aria-selected={activeTab === 0}
                    onClick={() => setActiveTab(0)}
                    data-testid="rs-localization-locales-tab"
                >
                    {t("locales")}
                </button>
                <button
                    role="tab"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 1 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    aria-selected={activeTab === 1}
                    onClick={() => setActiveTab(1)}
                    data-testid="rs-localization-realm-overrides-tab"
                >
                    {t("realmOverrides")}
                </button>
                <button
                    role="tab"
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 2 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
                    aria-selected={activeTab === 2}
                    onClick={() => setActiveTab(2)}
                    data-testid="rs-localization-effective-message-bundles-tab"
                >
                    {t("effectiveMessageBundles")}
                </button>
            </div>
            {activeTab === 0 && (
                <FormAccess
                    isHorizontal
                    role="manage-realm"
                    className="mt-6 ml-4"
                    onSubmit={handleSubmit(save)}
                >
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
                                <SelectControl
                                    name="supportedLocales"
                                    isScrollable
                                    label={t("supportedLocales")}
                                    labelIcon={t("supportedLocalesHelp")}
                                    controller={{
                                        defaultValue: defaultSupportedLocales,
                                        rules: {
                                            required: t("required"),
                                            validate: (value: string[]) =>
                                                value.every(v =>
                                                    allLocales.includes(v)
                                                ) || t("invalidLocale")
                                        }
                                    }}
                                    variant="typeaheadMulti"
                                    placeholderText={t("selectLocales")}
                                    options={allLocales.map(l => ({
                                        key: l,
                                        value: localeToDisplayName(l, whoAmI.locale) || l
                                    }))}
                                />
                                <SelectControl
                                    name="defaultLocale"
                                    label={t("defaultLocale")}
                                    labelIcon={t("defaultLocaleHelp")}
                                    controller={{
                                        defaultValue: DEFAULT_LOCALE,
                                        rules: {
                                            required: t("required"),
                                            validate: (value: string) =>
                                                watchSupportedLocales?.includes(value) ||
                                                t("required")
                                        }
                                    }}
                                    data-testid="select-default-locale"
                                    options={watchSupportedLocales!.map(l => ({
                                        key: l,
                                        value: localeToDisplayName(l, whoAmI.locale) || l
                                    }))}
                                />
                            </>
                        )}
                    </FormProvider>
                    <div className="flex gap-2">
                        <Button
                            disabled={!formState.isDirty}
                            type="submit"
                            data-testid="localization-tab-save"
                        >
                            {t("save")}
                        </Button>
                        <Button variant="ghost" onClick={() => reset(realm)}>
                            {t("revert")}
                        </Button>
                    </div>
                </FormAccess>
            )}
            {activeTab === 1 && (
                <RealmOverrides
                    internationalizationEnabled={internationalizationEnabled || false}
                    watchSupportedLocales={watchSupportedLocales || []}
                    realm={realm}
                    tableData={tableData}
                />
            )}
            {activeTab === 2 && (
                <EffectiveMessageBundles
                    defaultSupportedLocales={defaultSupportedLocales}
                    defaultLocales={[defaultLocales!]}
                />
            )}
        </div>
    );
};
