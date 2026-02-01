/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/user-profile/TextComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { TextInput, TextInputTypes } from "../../@patternfly/react-core";

import { UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, isRequiredAttribute, label } from "./utils";

export const TextComponent = (props: UserProfileFieldProps) => {
    const { form, inputType, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);
    const type = inputType.startsWith("html")
        ? (inputType.substring("html".length + 2) as TextInputTypes)
        : "text";

    return (
        <UserProfileGroup {...props}>
            <TextInput
                id={attribute.name}
                data-testid={attribute.name}
                type={type}
                placeholder={
                    attribute.readOnly
                        ? ""
                        : label(
                              props.t,
                              attribute.annotations?.["inputTypePlaceholder"] as string,
                              "",
                              attribute.annotations?.[
                                  "inputOptionLabelsI18nPrefix"
                              ] as string
                          )
                }
                isDisabled={attribute.readOnly}
                isRequired={isRequired}
                defaultValue={attribute.defaultValue}
                {...form.register(fieldName(attribute.name))}
            />
        </UserProfileGroup>
    );
};
