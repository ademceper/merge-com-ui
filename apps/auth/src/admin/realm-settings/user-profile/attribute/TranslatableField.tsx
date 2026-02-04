import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { FormErrorText } from "../../../../shared/keycloak-ui-shared";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Globe } from "@phosphor-icons/react";
import { TFunction } from "i18next";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useRealm } from "../../../context/realm-context/RealmContext";
import { i18n } from "../../../i18n/i18n";
import { beerify, debeerify } from "../../../util";
import useToggle from "../../../utils/useToggle";
import { AddTranslationsDialog } from "./AddTranslationsDialog";

export type TranslationForm = {
    locale: string;
    value: string;
};

export type Translation = Record<string, TranslationForm[]>;

export type Translations = {
    translation: Translation;
};

type SaveTranslationsProps = {
    adminClient: KeycloakAdminClient;
    realmName: string;
    translationsData: Translations;
};

export const saveTranslations = async ({
    adminClient,
    realmName,
    translationsData
}: SaveTranslationsProps) => {
    await Promise.all(
        Object.entries(translationsData.translation)
            .map(([key, translation]) =>
                translation
                    .filter(translation => translation.value.trim() !== "")
                    .map(translation =>
                        adminClient.realms.addLocalization(
                            {
                                realm: realmName,
                                selectedLocale: translation.locale,
                                key: debeerify(key)
                            },
                            translation.value
                        )
                    )
            )
            .flat()
    );
    await i18n.reloadResources();
};

type TranslatableFieldProps = {
    attributeName: string;
    prefix: string;
    fieldName: string;
    predefinedAttributes?: string[];
};

function hasTranslation(value: string, t: TFunction) {
    return t(value) === value && value !== "";
}

export const TranslatableField = ({
    attributeName,
    prefix,
    fieldName,
    predefinedAttributes
}: TranslatableFieldProps) => {
    const { t } = useTranslation();
    const { realmRepresentation: realm } = useRealm();
    const { register, control, getFieldState, setValue } = useFormContext();
    const [open, toggle] = useToggle();

    const value = useWatch({ control, name: attributeName });

    const key = `${prefix}.${value}`;
    const translationPrefix = `translation.${beerify(key)}`;
    const requiredTranslationName = `${translationPrefix}.0.value`;

    useEffect(() => {
        if (predefinedAttributes?.includes(value)) {
            return;
        }
        if (realm?.internationalizationEnabled && value) {
            setValue(fieldName, `\${${prefix}.${value}}`);
        }
    }, [value]);

    function isTranslationRequired(
        value: string,
        t: TFunction,
        realm?: RealmRepresentation
    ) {
        return realm?.internationalizationEnabled && open && hasTranslation(value, t);
    }

    return (
        <>
            {isTranslationRequired(value, t, realm) && (
                <input
                    type="hidden"
                    data-testid="requiredTranslationName"
                    {...register(requiredTranslationName, { required: t("required") })}
                />
            )}
            {open && (
                <AddTranslationsDialog
                    orgKey={value}
                    translationKey={`${prefix}.${value}`}
                    fieldName={fieldName}
                    predefinedAttributes={predefinedAttributes}
                    toggleDialog={toggle}
                />
            )}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        id={`kc-attribute-${fieldName}`}
                        data-testid={`attributes-${fieldName}`}
                        disabled={realm?.internationalizationEnabled}
                        {...register(fieldName)}
                    />
                </div>
                {realm?.internationalizationEnabled && (
                    <div>
                        <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`addAttribute${fieldName}TranslationBtn`}
                            aria-label={t("addAttributeTranslation", { fieldName })}
                            onClick={toggle}
                        >
                            <Globe className="size-4" />
                        </Button>
                    </div>
                )}
            </div>
            {realm?.internationalizationEnabled && (
                <div className="text-sm text-muted-foreground">
                    <Alert>
                        <AlertDescription>
                            <Trans
                                i18nKey="addTranslationsModalSubTitle"
                                values={{ fieldName: t(fieldName) }}
                            >
                                You are able to translate the fieldName based on your
                                locale or
                                <strong>location</strong>
                            </Trans>
                        </AlertDescription>
                    </Alert>
                    {getFieldState(requiredTranslationName).error && (
                        <FormErrorText message={t("required")} />
                    )}
                </div>
            )}
        </>
    );
};
