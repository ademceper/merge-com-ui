import {
    UserProfileAttributeGroupMetadata,
    UserProfileAttributeMetadata,
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { Input } from "@merge/ui/components/input";
import { Textarea } from "@merge/ui/components/textarea";
import { TFunction } from "i18next";
import { ReactNode, useMemo, type JSX } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";

import { ScrollForm } from "../scroll-form/ScrollForm";
import { LocaleSelector } from "./LocaleSelector";
import { MultiInputComponent } from "./MultiInputComponent";
import { OptionComponent } from "./OptionsComponent";
import { SelectComponent } from "./SelectComponent";
import { UserProfileGroup } from "./UserProfileGroup";
import { UserFormFields, fieldName, isRootAttribute, isRequiredAttribute, label } from "./utils";

type HtmlInputType = "text" | "email" | "tel" | "url" | "number" | "range" | "datetime-local" | "date" | "month" | "time";

function TextFieldComponent(props: UserProfileFieldProps) {
    const { form, inputType, attribute } = props;
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
                              attribute.annotations?.["inputOptionLabelsI18nPrefix"] as string
                          )
                }
                disabled={attribute.readOnly}
                defaultValue={attribute.defaultValue}
                className="h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register(fieldName(attribute.name))}
            />
        </UserProfileGroup>
    );
}

function TextAreaFieldComponent(props: UserProfileFieldProps) {
    const { form, attribute } = props;
    const isRequired = isRequiredAttribute(attribute);

    return (
        <UserProfileGroup {...props}>
            <Textarea
                id={attribute.name}
                data-testid={attribute.name}
                cols={attribute.annotations?.["inputTypeCols"] as number}
                rows={attribute.annotations?.["inputTypeRows"] as number}
                disabled={attribute.readOnly}
                required={isRequired}
                defaultValue={attribute.defaultValue}
                className="rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register(fieldName(attribute.name))}
            />
        </UserProfileGroup>
    );
}

export type UserProfileError = {
    responseData: { errors?: { errorMessage: string }[] };
};

export type Options = {
    options?: string[];
};

export type InputType =
    | "text"
    | "textarea"
    | "select"
    | "select-radiobuttons"
    | "multiselect"
    | "multiselect-checkboxes"
    | "html5-email"
    | "html5-tel"
    | "html5-url"
    | "html5-number"
    | "html5-range"
    | "html5-datetime-local"
    | "html5-date"
    | "html5-month"
    | "html5-time"
    | "multi-input";

export type UserProfileFieldProps = {
    t: TFunction;
    form: UseFormReturn<UserFormFields>;
    inputType: InputType;
    attribute: UserProfileAttributeMetadata;
    renderer?: (attribute: UserProfileAttributeMetadata) => ReactNode;
};

export type OptionLabel = Record<string, string> | undefined;

export const FIELDS: {
    [type in InputType]: (props: UserProfileFieldProps) => JSX.Element;
} = {
    text: TextFieldComponent,
    textarea: TextAreaFieldComponent,
    select: SelectComponent,
    "select-radiobuttons": OptionComponent,
    multiselect: SelectComponent,
    "multiselect-checkboxes": OptionComponent,
    "html5-email": TextFieldComponent,
    "html5-tel": TextFieldComponent,
    "html5-url": TextFieldComponent,
    "html5-number": TextFieldComponent,
    "html5-range": TextFieldComponent,
    "html5-datetime-local": TextFieldComponent,
    "html5-date": TextFieldComponent,
    "html5-month": TextFieldComponent,
    "html5-time": TextFieldComponent,
    "multi-input": MultiInputComponent
} as const;

export type UserProfileFieldsProps = {
    t: TFunction;
    form: UseFormReturn<UserFormFields>;
    userProfileMetadata: UserProfileMetadata;
    supportedLocales: string[];
    currentLocale: string;
    hideReadOnly?: boolean;
    renderer?: (attribute: UserProfileAttributeMetadata) => JSX.Element | undefined;
};

type GroupWithAttributes = {
    group: UserProfileAttributeGroupMetadata;
    attributes: UserProfileAttributeMetadata[];
};

export const UserProfileFields = ({
    t,
    form,
    userProfileMetadata,
    supportedLocales,
    currentLocale,
    hideReadOnly = false,
    renderer
}: UserProfileFieldsProps) => {
    // Group attributes by group, for easier rendering.
    const groupsWithAttributes = useMemo(() => {
        // If there are no attributes, there is no need to group them.
        if (!userProfileMetadata.attributes) {
            return [];
        }

        // Hide read-only attributes if 'hideReadOnly' is enabled.
        const attributes = hideReadOnly
            ? userProfileMetadata.attributes.filter(({ readOnly }) => !readOnly)
            : userProfileMetadata.attributes;

        return [
            // Insert an empty group for attributes without a group.
            { name: undefined },
            ...(userProfileMetadata.groups ?? [])
        ].map<GroupWithAttributes>(group => ({
            group,
            attributes: attributes.filter(attribute => attribute.group === group.name)
        }));
    }, [hideReadOnly, userProfileMetadata.groups, userProfileMetadata.attributes]);

    if (groupsWithAttributes.length === 0) {
        return null;
    }

    return (
        <ScrollForm
            label={t("jumpToSection")}
            sections={groupsWithAttributes
                .filter(group => group.attributes.length > 0)
                .map(({ group, attributes }) => ({
                    title: label(t, group.displayHeader, group.name) || t("general"),
                    panel: (
                        <div className="space-y-6">
                            {group.displayDescription && (
                                <p className="pb-4">
                                    {label(t, group.displayDescription, "")}
                                </p>
                            )}
                            {attributes.map(attribute => (
                                <FormField
                                    key={attribute.name}
                                    t={t}
                                    form={form}
                                    supportedLocales={supportedLocales}
                                    currentLocale={currentLocale}
                                    renderer={renderer}
                                    attribute={attribute}
                                />
                            ))}
                        </div>
                    )
                }))}
        />
    );
};

type FormFieldProps = {
    t: TFunction;
    form: UseFormReturn<UserFormFields>;
    supportedLocales: string[];
    currentLocale: string;
    attribute: UserProfileAttributeMetadata;
    renderer?: (attribute: UserProfileAttributeMetadata) => JSX.Element | undefined;
};

const FormField = ({
    t,
    form,
    renderer,
    supportedLocales,
    currentLocale,
    attribute
}: FormFieldProps) => {
    const value = form.watch(fieldName(attribute.name) as FieldPath<UserFormFields>);
    const inputType = useMemo(() => determineInputType(attribute), [attribute]);

    const Component =
        attribute.multivalued ||
        (isMultiValue(value) && attribute.annotations?.inputType === undefined)
            ? FIELDS["multi-input"]
            : FIELDS[inputType];

    if (attribute.name === "locale")
        return (
            <LocaleSelector
                form={form}
                supportedLocales={supportedLocales}
                currentLocale={currentLocale}
                t={t}
                attribute={attribute}
            />
        );
    return (
        <Component
            t={t}
            form={form}
            inputType={inputType}
            attribute={attribute}
            renderer={renderer}
        />
    );
};

const DEFAULT_INPUT_TYPE = "text" satisfies InputType;

function determineInputType(attribute: UserProfileAttributeMetadata): InputType {
    // Always treat the root attributes as a text field.
    if (isRootAttribute(attribute.name)) {
        return "text";
    }

    const inputType = attribute.annotations?.inputType;

    // if we have an valid input type use that to render
    if (isValidInputType(inputType)) {
        return inputType;
    }

    // In all other cases use the default
    return DEFAULT_INPUT_TYPE;
}

const isValidInputType = (value: unknown): value is InputType =>
    typeof value === "string" && value in FIELDS;

const isMultiValue = (value: unknown): boolean =>
    Array.isArray(value) && value.length > 1;
