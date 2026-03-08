import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem } from "../../../../shared/keycloak-ui-shared";
import { CodeEditor } from "../form/code-editor";
import type { ComponentProps } from "./components";

const preWrapStyle = { whiteSpace: "pre-wrap" } as const;

export const ScriptComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>
                    {t(label!)}
                    {required && " *"}
                </Label>
                <HelpItem
                    helpText={<span style={preWrapStyle}>{helpText}</span>}
                    fieldLabelId={`${label}`}
                />
            </div>
            <Controller
                name={convertToName(name!)}
                defaultValue={defaultValue}
                control={control}
                render={({ field }) => (
                    <CodeEditor
                        id={name!}
                        data-testid={name}
                        readOnly={isDisabled}
                        onChange={field.onChange}
                        value={Array.isArray(field.value) ? field.value[0] : field.value}
                        language="js"
                        height={600}
                    />
                )}
            />
        </div>
    );
};
