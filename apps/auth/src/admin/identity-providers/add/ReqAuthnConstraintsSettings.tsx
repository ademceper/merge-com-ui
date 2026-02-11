import { HelpItem } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
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
                        <Select
                            open={comparisonOpen}
                            onOpenChange={setComparisonOpen}
                            value={field.value ?? comparisonValues[0]}
                            onValueChange={(v) => {
                                field.onChange(v);
                                setComparisonOpen(false);
                            }}
                            aria-label={t("comparison")}
                        >
                            <SelectTrigger id="comparison">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {comparisonValues.map(option => (
                                    <SelectItem key={option} value={option}>
                                        {t(option)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
