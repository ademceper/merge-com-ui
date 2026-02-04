import {
    HelpItem,
    KeycloakSelect,
    SelectOption,
    SelectVariant
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";

const comparisonValues = ["exact", "minimum", "maximum", "better"];

export const ReqAuthnConstraints = () => {
    const { t } = useTranslation();
    const { control } = useFormContext();
    const [comparisonOpen, setComparisonOpen] = useState(false);
    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="comparison">{t("comparison")}</Label>
                    <HelpItem helpText={t("comparisonHelp")} fieldLabelId="comparison" />
                </div>
                <Controller
                    name="config.authnContextComparisonType"
                    defaultValue={comparisonValues[0]}
                    control={control}
                    render={({ field }) => (
                        <KeycloakSelect
                            toggleId="comparison"
                            direction="up"
                            onToggle={isExpanded => setComparisonOpen(isExpanded)}
                            onSelect={value => {
                                field.onChange(value.toString());
                                setComparisonOpen(false);
                            }}
                            selections={field.value}
                            variant={SelectVariant.single}
                            aria-label={t("comparison")}
                            isOpen={comparisonOpen}
                        >
                            {comparisonValues.map(option => (
                                <SelectOption
                                    key={option}
                                    value={option}
                                >
                                    {t(option)}
                                </SelectOption>
                            ))}
                        </KeycloakSelect>
                    )}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="kc-authnContextClassRefs">{t("authnContextClassRefs")}</Label>
                    <HelpItem
                        helpText={t("authnContextClassRefsHelp")}
                        fieldLabelId="authnContextClassRefs"
                    />
                </div>
                <MultiLineInput
                    name="config.authnContextClassRefs"
                    aria-label={t("identify-providers:authnContextClassRefs")}
                    addButtonLabel="addAuthnContextClassRef"
                    data-testid="classref-field"
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="kc-authnContextDeclRefs">{t("authnContextDeclRefs")}</Label>
                    <HelpItem
                        helpText={t("authnContextDeclRefsHelp")}
                        fieldLabelId="authnContextDeclRefs"
                    />
                </div>
                <MultiLineInput
                    name="config.authnContextDeclRefs"
                    aria-label={t("identify-providers:authnContextDeclRefs")}
                    addButtonLabel="addAuthnContextDeclRef"
                    data-testid="declref-field"
                />
            </div>
        </>
    );
};
