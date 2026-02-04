import { Input } from "@merge/ui/components/input";
import { useFormContext } from "react-hook-form";

import { FieldProps, FormGroupField } from "./FormGroupField";

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
