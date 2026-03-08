import { useTranslation } from "@merge-rd/i18n";
import { Label } from "@merge-rd/ui/components/label";
import type { PropsWithChildren } from "react";

import { HelpItem } from "../../../../shared/keycloak-ui-shared";

export type FieldProps = { label: string; field: string; isReadOnly?: boolean };
type FormGroupFieldProps = { label: string };

export const FormGroupField = ({
    label,
    children
}: PropsWithChildren<FormGroupFieldProps>) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={label}>{t(label)}</Label>
                <HelpItem helpText={t(`${label}Help`)} fieldLabelId={label} />
            </div>
            {children}
        </div>
    );
};
