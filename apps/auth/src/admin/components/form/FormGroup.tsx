import { Label } from "@merge/ui/components/label";
import { ReactNode } from "react";

type FormGroupProps = {
    label: string;
    fieldId: string;
    labelIcon?: ReactNode;
    id?: string;
    hasNoPaddingTop?: boolean;
    children: ReactNode;
};

export const FormGroup = ({ label, fieldId, labelIcon, id, hasNoPaddingTop: _hasNoPaddingTop, children }: FormGroupProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-1">
            <Label htmlFor={fieldId} id={id}>
                {label}
            </Label>
            {labelIcon}
        </div>
        {children}
    </div>
);
