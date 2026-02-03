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

import { Checkbox } from "@merge/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Label } from "@merge/ui/components/label";
import { Controller } from "react-hook-form";
import { OptionLabel, Options, UserProfileFieldProps } from "./UserProfileFields";
import { UserProfileGroup } from "./UserProfileGroup";
import { fieldName, isRequiredAttribute, label } from "./utils";

export const OptionComponent = (props: UserProfileFieldProps) => {
    const { form, inputType, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);
    const isMultiSelect = inputType.startsWith("multiselect");
    const options = (attribute.validators?.options as Options | undefined)?.options || [];

    const optionLabel =
        (attribute.annotations?.["inputOptionLabels"] as OptionLabel) || {};
    const prefix = attribute.annotations?.["inputOptionLabelsI18nPrefix"] as string;

    const optionLabelText = (option: string) =>
        label(props.t, optionLabel[option], option, prefix);

    return (
        <UserProfileGroup {...props}>
            <Controller
                name={fieldName(attribute.name)}
                control={form.control}
                defaultValue={attribute.defaultValue}
                render={({ field }) =>
                    isMultiSelect ? (
                        <div className="flex flex-col gap-2">
                            {options.map(option => (
                                <div key={option} className="flex items-center gap-2">
                                    <Checkbox
                                        id={option}
                                        data-testid={option}
                                        checked={field.value?.includes(option)}
                                        disabled={attribute.readOnly}
                                        onCheckedChange={() => {
                                            if (field.value?.includes(option)) {
                                                field.onChange(
                                                    field.value.filter(
                                                        (item: string) => item !== option
                                                    )
                                                );
                                            } else {
                                                field.onChange([
                                                    ...(field.value || []),
                                                    option
                                                ]);
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={option}
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        {optionLabelText(option)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={attribute.readOnly}
                            className="flex flex-col gap-2"
                        >
                            {options.map(option => (
                                <div key={option} className="flex items-center gap-2">
                                    <RadioGroupItem value={option} id={option} data-testid={option} />
                                    <Label
                                        htmlFor={option}
                                        className="cursor-pointer text-sm font-normal"
                                    >
                                        {optionLabelText(option)}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )
                }
            />
        </UserProfileGroup>
    );
};
