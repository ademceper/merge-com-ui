import { WarningCircle } from "@phosphor-icons/react";
import { FieldError } from "@merge/ui/components/field";

export type FormErrorTextProps = React.ComponentProps<"div"> & {
    message: string;
};

export const FormErrorText = ({ message, ...props }: FormErrorTextProps) => {
    return (
        <FieldError className="flex items-center gap-1.5 text-destructive text-sm" {...props}>
            <WarningCircle size={16} className="shrink-0" />
            {message}
        </FieldError>
    );
};
