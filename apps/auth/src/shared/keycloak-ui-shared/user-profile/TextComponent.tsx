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

import { Input } from "@merge/ui/components/input";
import { UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, isRequiredAttribute, label } from "./utils";

type HtmlInputType = "text" | "email" | "tel" | "url";

export const TextComponent = (props: UserProfileFieldProps) => {
    const { form, inputType, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);
    const type: HtmlInputType = inputType.startsWith("html")
        ? (inputType.substring("html".length + 2) as HtmlInputType)
        : "text";

    return (
        <UserProfileGroup {...props}>
            <Input
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
                disabled={attribute.readOnly}
                defaultValue={attribute.defaultValue}
                {...form.register(fieldName(attribute.name))}
            />
        </UserProfileGroup>
    );
};
