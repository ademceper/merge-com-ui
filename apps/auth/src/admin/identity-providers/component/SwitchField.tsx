import { Switch } from "@merge/ui/components/switch";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FieldProps, FormGroupField } from "./FormGroupField";

type FieldType = "boolean" | "string";

type SwitchFieldProps = FieldProps & {
    fieldType?: FieldType;
    defaultValue?: string | boolean;
};

export const SwitchField = ({
    label,
    field,
    fieldType = "string",
    isReadOnly = false,
    defaultValue
}: SwitchFieldProps) => {
    useTranslation();
    const { control } = useFormContext();
    return (
        <FormGroupField label={label}>
            <Controller
                name={field}
                defaultValue={
                    defaultValue ? defaultValue : fieldType === "string" ? "false" : false
                }
                control={control}
                render={({ field }) => (
                    <Switch
                        id={label}
                        checked={
                            fieldType === "string"
                                ? field.value === "true"
                                : (field.value as boolean)
                        }
                        onCheckedChange={(value) =>
                            field.onChange(fieldType === "string" ? "" + value : value)
                        }
                        disabled={isReadOnly}
                        aria-label={label}
                    />
                )}
            />
        </FormGroupField>
    );
};
