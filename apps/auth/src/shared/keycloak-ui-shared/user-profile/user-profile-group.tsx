import type { UserProfileAttributeMetadata } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Field, FieldContent } from "@merge-rd/ui/components/field";
import { InputGroup } from "@merge-rd/ui/components/input-group";
import type { TFunction } from "i18next";
import { get } from "lodash-es";
import type { PropsWithChildren, ReactNode } from "react";
import type { FieldError, UseFormReturn } from "react-hook-form";

import { FormErrorText } from "../controls/form-error-text";
import { fieldName, label, type UserFormFields } from "./utils";

type UserProfileGroupProps = {
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
    const helpText = label(t, attribute.annotations?.inputHelperTextBefore as string);
    const {
        formState: { errors }
    } = form;

    const component = renderer?.(attribute);
    const error = get(errors, fieldName(attribute.name)) as FieldError;

    return (
        <Field key={attribute.name} className="w-full">
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
