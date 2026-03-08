import { Input } from "@merge-rd/ui/components/input";
import { useFormContext } from "react-hook-form";

import { type FieldProps, FormGroupField } from "./form-group-field";

export const TextField = ({ label, field, isReadOnly = false }: FieldProps) => {
    const { register } = useFormContext();
    return (
        <FormGroupField label={label}>
            <Input
                id={label}
                data-testid={label}
                readOnly={isReadOnly}
                {...register(field)}
            />
        </FormGroupField>
    );
};
