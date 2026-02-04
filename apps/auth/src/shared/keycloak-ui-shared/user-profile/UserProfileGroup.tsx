import { UserProfileAttributeMetadata } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Field, FieldContent, FieldLabel } from "@merge/ui/components/field";
import { InputGroup } from "@merge/ui/components/input-group";
import { TFunction } from "i18next";
import { get } from "lodash-es";
import { PropsWithChildren, ReactNode } from "react";
import { UseFormReturn, type FieldError } from "react-hook-form";

import { FormErrorText } from "../controls/FormErrorText";
import { HelpItem } from "../controls/HelpItem";
import {
    UserFormFields,
    fieldName,
    isRequiredAttribute,
    label,
    labelAttribute
} from "./utils";

export type UserProfileGroupProps = {
    t: TFunction;
    form: UseFormReturn<UserFormFields>;
    attribute: UserProfileAttributeMetadata;
    renderer?: (attribute: UserProfileAttributeMetadata) => ReactNode;
};

export const UserProfileGroup = ({
    t,
    form,
    attribute,
    renderer,
    children
}: PropsWithChildren<UserProfileGroupProps>) => {
    const helpText = label(t, attribute.annotations?.["inputHelperTextBefore"] as string);
    const {
        formState: { errors }
    } = form;

    const component = renderer?.(attribute);
    const error = get(errors, fieldName(attribute.name)) as FieldError;

    return (
        <Field key={attribute.name} className="w-full">
            <FieldLabel htmlFor={attribute.name} className="flex items-center gap-1.5">
                {labelAttribute(t, attribute) || ""}
                {isRequiredAttribute(attribute) && <span className="text-destructive">*</span>}
                {helpText && (
                    <HelpItem helpText={helpText} fieldLabelId={attribute.name!} />
                )}
            </FieldLabel>
            <FieldContent>
                {component ? (
                    <InputGroup>
                        {children}
                        {component}
                    </InputGroup>
                ) : (
                    children
                )}
                {error?.message && (
                    <FormErrorText
                        data-testid={`${attribute.name}-helper`}
                        message={error.message as string}
                    />
                )}
            </FieldContent>
        </Field>
    );
};
