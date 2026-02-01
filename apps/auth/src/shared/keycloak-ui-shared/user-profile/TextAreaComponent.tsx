/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/user-profile/TextAreaComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { KeycloakTextArea } from "../controls/keycloak-text-area/KeycloakTextArea";
import { UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, isRequiredAttribute } from "./utils";

export const TextAreaComponent = (props: UserProfileFieldProps) => {
    const { form, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);

    return (
        <UserProfileGroup {...props}>
            <KeycloakTextArea
                id={attribute.name}
                data-testid={attribute.name}
                {...form.register(fieldName(attribute.name))}
                cols={attribute.annotations?.["inputTypeCols"] as number}
                rows={attribute.annotations?.["inputTypeRows"] as number}
                readOnly={attribute.readOnly}
                isRequired={isRequired}
                defaultValue={attribute.defaultValue}
            />
        </UserProfileGroup>
    );
};
