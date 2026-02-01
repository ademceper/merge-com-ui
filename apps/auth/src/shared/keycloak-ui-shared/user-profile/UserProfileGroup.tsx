/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/user-profile/UserProfileGroup.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { UserProfileAttributeMetadata } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { FormGroup, InputGroup } from "../../@patternfly/react-core";
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
        <FormGroup
            key={attribute.name}
            label={labelAttribute(t, attribute) || ""}
            fieldId={attribute.name}
            isRequired={isRequiredAttribute(attribute)}
            labelIcon={
                helpText ? (
                    <HelpItem helpText={helpText} fieldLabelId={attribute.name!} />
                ) : undefined
            }
        >
            {component ? (
                <InputGroup>
                    {children}
                    {component}
                </InputGroup>
            ) : (
                children
            )}
            {error && (
                <FormErrorText
                    data-testid={`${attribute.name}-helper`}
                    message={error.message as string}
                />
            )}
        </FormGroup>
    );
};
