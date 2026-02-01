/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/user-profile/OptionsComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Checkbox, Radio } from "../../@patternfly/react-core";
import { Controller } from "react-hook-form";
import { OptionLabel, Options, UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, isRequiredAttribute, label } from "./utils";

export const OptionComponent = (props: UserProfileFieldProps) => {
    const { form, inputType, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);
    const isMultiSelect = inputType.startsWith("multiselect");
    const Component = isMultiSelect ? Checkbox : Radio;
    const options = (attribute.validators?.options as Options | undefined)?.options || [];

    const optionLabel =
        (attribute.annotations?.["inputOptionLabels"] as OptionLabel) || {};
    const prefix = attribute.annotations?.["inputOptionLabelsI18nPrefix"] as string;

    return (
        <UserProfileGroup {...props}>
            <Controller
                name={fieldName(attribute.name)}
                control={form.control}
                defaultValue={attribute.defaultValue}
                render={({ field }) => (
                    <>
                        {options.map(option => (
                            <Component
                                key={option}
                                id={option}
                                data-testid={option}
                                label={label(
                                    props.t,
                                    optionLabel[option],
                                    option,
                                    prefix
                                )}
                                value={option}
                                isChecked={field.value?.includes(option)}
                                onChange={() => {
                                    if (isMultiSelect) {
                                        if (field.value?.includes(option)) {
                                            field.onChange(
                                                field.value?.filter(
                                                    (item: string) => item !== option
                                                )
                                            );
                                        } else {
                                            field.onChange([
                                                ...(field.value || []),
                                                option
                                            ]);
                                        }
                                    } else {
                                        field.onChange([option]);
                                    }
                                }}
                                readOnly={attribute.readOnly}
                                isRequired={isRequired}
                            />
                        ))}
                    </>
                )}
            />
        </UserProfileGroup>
    );
};
