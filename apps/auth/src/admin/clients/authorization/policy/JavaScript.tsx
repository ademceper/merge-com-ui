import type { ComponentType } from "react";
import { HelpItem } from "../../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import CodeEditor from "../../../components/form/CodeEditor";
import { Controller, type ControllerProps, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

const FormController = Controller as ComponentType<ControllerProps>;

export const JavaScript = () => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{t("code")}</Label>
                <HelpItem helpText={t("policyCodeHelp")} fieldLabelId="code" />
            </div>
            <FormController
                name="code"
                defaultValue=""
                control={control}
                render={({ field }) => (
                    <CodeEditor
                        id="code"
                        data-testid="code"
                        readOnly
                        value={field.value}
                        language="js"
                        height={600}
                    />
                )}
            />
        </div>
    );
};
