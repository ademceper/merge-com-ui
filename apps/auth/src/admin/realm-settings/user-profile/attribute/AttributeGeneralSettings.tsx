import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import {
    HelpItem,
    KeycloakSpinner,
    TextControl,
    useFetch
} from "../../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Separator } from "@merge/ui/components/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Switch } from "@merge/ui/components/switch";
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

    const scopeOptions = localeSort(clientScopes, mapByKey("name"));

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
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Label htmlFor="attribute-group">{t("attributeGroup")}</Label>
                        <HelpItem helpText={t("attributeGroupHelp")} fieldLabelId="attributeGroup" />
                    </div>
                    <Controller
                        name="group"
                        control={form.control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger id="attribute-group">
                                    <SelectValue placeholder={t("none")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t("none")}</SelectItem>
                                    {(config?.groups ?? []).map((g) => (
                                        <SelectItem key={g.name} value={g.name ?? ""}>
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
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
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="min-h-9 w-full justify-between font-normal"
                                                    data-testid="enabled-when-scope-field"
                                                >
                                                    <span className="truncate">
                                                        {Array.isArray(field.value) && field.value.length > 0
                                                            ? field.value.join(", ")
                                                            : t("selectScopes")}
                                                    </span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-(--radix-popover-trigger-width) p-0"
                                                align="start"
                                            >
                                                <ul className="max-h-64 overflow-auto py-1">
                                                    {scopeOptions.map((s) => {
                                                        const name = s.name ?? "";
                                                        const selected = Array.isArray(field.value) && field.value.includes(name);
                                                        return (
                                                            <li
                                                                key={name}
                                                                role="option"
                                                                aria-selected={selected}
                                                                className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => {
                                                                    if (selected) {
                                                                        field.onChange(field.value.filter((x: string) => x !== name));
                                                                    } else {
                                                                        field.onChange([...(field.value || []), name]);
                                                                    }
                                                                }}
                                                            >
                                                                {name}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                                {Array.isArray(field.value) && field.value.length > 0 && (
                                                    <div className="border-t px-2 py-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-full justify-center"
                                                            onClick={() => field.onChange([])}
                                                        >
                                                            {t("clear")}
                                                        </Button>
                                                    </div>
                                                )}
                                            </PopoverContent>
                                        </Popover>
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
                                        render={({ field }) => {
                                            const selectedLabel = REQUIRED_FOR.find(opt => isEqual(field.value, opt.value))?.label ?? REQUIRED_FOR[0].label;
                                            return (
                                                <RadioGroup
                                                    value={selectedLabel}
                                                    onValueChange={(label) => {
                                                        const option = REQUIRED_FOR.find(o => o.label === label);
                                                        if (option) field.onChange(option.value);
                                                    }}
                                                >
                                                    {REQUIRED_FOR.map(option => (
                                                        <div key={option.label} className="flex items-center gap-2 mb-2">
                                                            <RadioGroupItem value={option.label} id={option.label} data-testid={option.label} />
                                                            <Label htmlFor={option.label}>{t(option.label)}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            );
                                        }}
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
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="min-h-9 w-full justify-between font-normal"
                                                            data-testid="required-when-scope-field"
                                                        >
                                                            <span className="truncate">
                                                                {Array.isArray(field.value) && field.value.length > 0
                                                                    ? field.value.join(", ")
                                                                    : t("selectScopes")}
                                                            </span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-(--radix-popover-trigger-width) p-0"
                                                        align="start"
                                                    >
                                                        <ul className="max-h-64 overflow-auto py-1">
                                                            {scopeOptions.map((s) => {
                                                                const name = s.name ?? "";
                                                                const selected = Array.isArray(field.value) && field.value.includes(name);
                                                                return (
                                                                    <li
                                                                        key={name}
                                                                        role="option"
                                                                        aria-selected={selected}
                                                                        className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                                        onMouseDown={(e) => e.preventDefault()}
                                                                        onClick={() => {
                                                                            if (selected) {
                                                                                field.onChange(field.value.filter((x: string) => x !== name));
                                                                            } else {
                                                                                field.onChange([...(field.value || []), name]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {name}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                        {Array.isArray(field.value) && field.value.length > 0 && (
                                                            <div className="border-t px-2 py-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-full justify-center"
                                                                    onClick={() => field.onChange([])}
                                                                >
                                                                    {t("clear")}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </PopoverContent>
                                                </Popover>
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
