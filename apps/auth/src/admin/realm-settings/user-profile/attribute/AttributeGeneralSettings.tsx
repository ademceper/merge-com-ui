import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import {
    HelpItem,
    KeycloakSelect,
    KeycloakSpinner,
    SelectControl,
    SelectVariant,
    TextControl,
    useFetch
} from "../../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Separator } from "@merge/ui/components/separator";
import { Switch } from "@merge/ui/components/switch";
import { SelectOption } from "../../../../shared/keycloak-ui-shared";
import { isEqual } from "lodash-es";
import { useState } from "react";
import { Controller, FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";
import { FormAccess } from "../../../components/form/FormAccess";
import { DefaultSwitchControl } from "../../../components/SwitchControl";
import { useParams } from "../../../utils/useParams";
import { USERNAME_EMAIL } from "../../NewAttributeSettings";
import { AttributeParams } from "../../routes/Attribute";
import { TranslatableField } from "./TranslatableField";

import useLocaleSort, { mapByKey } from "../../../utils/useLocaleSort";

const REQUIRED_FOR = [
    { label: "requiredForLabel.both", value: ["admin", "user"] },
    { label: "requiredForLabel.users", value: ["user"] },
    { label: "requiredForLabel.admins", value: ["admin"] }
] as const;

export const AttributeGeneralSettings = () => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const form = useFormContext();
    const [clientScopes, setClientScopes] = useState<ClientScopeRepresentation[]>();
    const [config, setConfig] = useState<UserProfileConfig>();
    const [selectEnabledWhenOpen, setSelectEnabledWhenOpen] = useState(false);
    const [selectRequiredForOpen, setSelectRequiredForOpen] = useState(false);

    const [enabledWhenSearch, setEnableWhenSearch] = useState("");
    const localeSort = useLocaleSort();

    const { attributeName } = useParams<AttributeParams>();
    const editMode = attributeName ? true : false;

    const hasSelector = useWatch({
        control: form.control,
        name: "hasSelector"
    });

    const hasRequiredScopes = useWatch({
        control: form.control,
        name: "hasRequiredScopes"
    });

    const required = useWatch({
        control: form.control,
        name: "isRequired",
        defaultValue: false
    });

    useFetch(() => adminClient.clientScopes.find(), setClientScopes, []);
    useFetch(() => adminClient.users.getProfile(), setConfig, []);

    if (!clientScopes) {
        return <KeycloakSpinner />;
    }

    function setHasSelector(hasSelector: boolean) {
        form.setValue("hasSelector", hasSelector);
    }

    function setHasRequiredScopes(hasRequiredScopes: boolean) {
        form.setValue("hasRequiredScopes", hasRequiredScopes);
    }

    const items = () =>
        localeSort(clientScopes, mapByKey("name"))
            .filter(s => enabledWhenSearch === "" || s.name?.includes(enabledWhenSearch))
            .map(option => (
                <SelectOption key={option.name} value={option.name ?? ""}>
                    {option.name}
                </SelectOption>
            ));

    const ROOT_ATTRIBUTE = [...USERNAME_EMAIL, "firstName", "lastName"];

    return (
        <FormProvider {...form}>
            <FormAccess role="manage-realm" isHorizontal>
                <TextControl
                    name="name"
                    label={t("attributeName")}
                    labelIcon={t("upAttributeNameHelp")}
                    isDisabled={editMode}
                    rules={{
                        required: t("validateAttributeName")
                    }}
                />
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="kc-attribute-displayName">{t("attributeDisplayName")}</Label>
                        <HelpItem
                            helpText={t("attributeDisplayNameHelp")}
                            fieldLabelId="attributeDisplayName"
                        />
                    </div>
                    <TranslatableField
                        attributeName="name"
                        prefix="profile.attributes"
                        fieldName="displayName"
                        predefinedAttributes={[
                            "username",
                            "email",
                            "firstName",
                            "lastName"
                        ]}
                    />
                </div>
                <DefaultSwitchControl
                    name="multivalued"
                    label={t("multivalued")}
                    labelIcon={t("multivaluedHelp")}
                />
                {!ROOT_ATTRIBUTE.includes(attributeName) && (
                    <TextControl
                        name="defaultValue"
                        label={t("defaultValue")}
                        labelIcon={t("defaultValueHelp")}
                    />
                )}
                <SelectControl
                    name="group"
                    label={t("attributeGroup")}
                    labelIcon={t("attributeGroupHelp")}
                    controller={{
                        defaultValue: ""
                    }}
                    options={[
                        { key: "", value: t("none") },
                        ...(config?.groups?.map(g => ({
                            key: g.name!,
                            value: g.name!
                        })) || [])
                    ]}
                />
                {!USERNAME_EMAIL.includes(attributeName) && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label>{t("enabledWhen")}</Label>
                                <HelpItem
                                    helpText={t("enabledWhenTooltip")}
                                    fieldLabelId="enabled-when"
                                />
                            </div>
                            <RadioGroup
                                value={hasSelector ? "scopesAsRequested" : "always"}
                                onValueChange={value => setHasSelector(value === "scopesAsRequested")}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <RadioGroupItem value="always" id="always" data-testid="always" />
                                    <Label htmlFor="always">{t("always")}</Label>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <RadioGroupItem value="scopesAsRequested" id="scopesAsRequested" data-testid="scopesAsRequested" />
                                    <Label htmlFor="scopesAsRequested">{t("scopesAsRequested")}</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {hasSelector && (
                            <div>
                                <Controller
                                    name="selector.scopes"
                                    control={form.control}
                                    defaultValue={[]}
                                    render={({ field }) => (
                                        <KeycloakSelect
                                            data-testid="enabled-when-scope-field"
                                            variant={SelectVariant.typeaheadMulti}
                                            onFilter={value => {
                                                setEnableWhenSearch(value);
                                                return items();
                                            }}
                                            typeAheadAriaLabel="Select"
                                            chipGroupProps={{
                                                numChips: 3,
                                                expandedText: t("hide"),
                                                collapsedText: t("showRemaining")
                                            }}
                                            onToggle={isOpen =>
                                                setSelectEnabledWhenOpen(isOpen)
                                            }
                                            selections={field.value}
                                            onSelect={selectedValue => {
                                                const option = selectedValue.toString();
                                                let changedValue = [""];
                                                if (field.value) {
                                                    changedValue = field.value.includes(
                                                        option
                                                    )
                                                        ? field.value.filter(
                                                              (item: string) =>
                                                                  item !== option
                                                          )
                                                        : [...field.value, option];
                                                } else {
                                                    changedValue = [option];
                                                }

                                                field.onChange(changedValue);
                                            }}
                                            onClear={() => {
                                                field.onChange([]);
                                            }}
                                            isOpen={selectEnabledWhenOpen}
                                            aria-labelledby={"scope"}
                                        >
                                            {items()}
                                        </KeycloakSelect>
                                    )}
                                />
                            </div>
                        )}
                    </>
                )}
                {attributeName !== "username" && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label>{t("required")}</Label>
                                <HelpItem
                                    helpText={t("requiredHelp")}
                                    fieldLabelId="required"
                                />
                            </div>
                            <Controller
                                name="isRequired"
                                data-testid="required"
                                defaultValue={false}
                                control={form.control}
                                render={({ field }) => (
                                    <Switch
                                        id={"kc-required"}
                                        onCheckedChange={field.onChange}
                                        checked={field.value}
                                        aria-label={t("required")}
                                    />
                                )}
                            />
                        </div>
                        {required && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t("requiredFor")}</Label>
                                    <Controller
                                        name="required.roles"
                                        data-testid="requiredFor"
                                        defaultValue={REQUIRED_FOR[0].value}
                                        control={form.control}
                                        render={({ field }) => (
                                            <div>
                                                {REQUIRED_FOR.map(option => (
                                                    <div key={option.label} className="flex items-center gap-2 mb-2">
                                                        <input
                                                            type="radio"
                                                            id={option.label}
                                                            data-testid={option.label}
                                                            checked={isEqual(
                                                                field.value,
                                                                option.value
                                                            )}
                                                            name="roles"
                                                            onChange={() => {
                                                                field.onChange(option.value);
                                                            }}
                                                        />
                                                        <Label htmlFor={option.label}>{t(option.label)}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                        <Label>{t("requiredWhen")}</Label>
                                        <HelpItem
                                            helpText={t("requiredWhenTooltip")}
                                            fieldLabelId="required-when"
                                        />
                                    </div>
                                    <RadioGroup
                                        value={hasRequiredScopes ? "requiredScopesAsRequested" : "requiredAlways"}
                                        onValueChange={value => setHasRequiredScopes(value === "requiredScopesAsRequested")}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <RadioGroupItem value="requiredAlways" id="requiredAlways" data-testid="requiredAlways" />
                                            <Label htmlFor="requiredAlways">{t("always")}</Label>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <RadioGroupItem value="requiredScopesAsRequested" id="requiredScopesAsRequested" data-testid="requiredScopesAsRequested" />
                                            <Label htmlFor="requiredScopesAsRequested">{t("scopesAsRequested")}</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {hasRequiredScopes && (
                                    <div>
                                        <Controller
                                            name="required.scopes"
                                            control={form.control}
                                            defaultValue={[]}
                                            render={({ field }) => (
                                                <KeycloakSelect
                                                    data-testid="required-when-scope-field"
                                                    variant={SelectVariant.typeaheadMulti}
                                                    typeAheadAriaLabel="Select"
                                                    chipGroupProps={{
                                                        numChips: 3,
                                                        expandedText: t("hide"),
                                                        collapsedText: t("showRemaining")
                                                    }}
                                                    onToggle={isOpen =>
                                                        setSelectRequiredForOpen(isOpen)
                                                    }
                                                    selections={field.value}
                                                    onSelect={selectedValue => {
                                                        const option =
                                                            selectedValue.toString();
                                                        let changedValue = [""];
                                                        if (field.value) {
                                                            changedValue =
                                                                field.value.includes(
                                                                    option
                                                                )
                                                                    ? field.value.filter(
                                                                          (
                                                                              item: string
                                                                          ) =>
                                                                              item !==
                                                                              option
                                                                      )
                                                                    : [
                                                                          ...field.value,
                                                                          option
                                                                      ];
                                                        } else {
                                                            changedValue = [option];
                                                        }
                                                        field.onChange(changedValue);
                                                    }}
                                                    onClear={() => {
                                                        field.onChange([]);
                                                    }}
                                                    isOpen={selectRequiredForOpen}
                                                    aria-labelledby={"scope"}
                                                >
                                                    {clientScopes.map(option => (
                                                        <SelectOption
                                                            key={option.name}
                                                            value={option.name ?? ""}
                                                        >
                                                            {option.name}
                                                        </SelectOption>
                                                    ))}
                                                </KeycloakSelect>
                                            )}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </FormAccess>
        </FormProvider>
    );
};
