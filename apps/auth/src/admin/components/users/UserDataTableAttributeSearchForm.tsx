import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { KeycloakSelect,
    label,
    SelectVariant } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Input } from "@merge/ui/components/input";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import { Check } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Form } from "react-router-dom";
import { UserAttribute, UserFilter } from "./UserDataTable";

type UserDataTableAttributeSearchFormProps = {
    activeFilters: UserFilter;
    setActiveFilters: (filters: UserFilter) => void;
    profile: UserProfileConfig;
    createAttributeSearchChips: () => ReactNode;
    searchUserWithAttributes: () => void;
    clearAllFilters: () => void;
};

type UserFilterForm = UserAttribute & { exact: boolean };

export function UserDataTableAttributeSearchForm({
    activeFilters,
    setActiveFilters,
    profile,
    createAttributeSearchChips,
    searchUserWithAttributes,
    clearAllFilters
}: UserDataTableAttributeSearchFormProps) {
    const { t } = useTranslation();
    const [selectAttributeKeyOpen, setSelectAttributeKeyOpen] = useState(false);

    const defaultValues: UserAttribute = {
        name: "",
        displayName: "",
        value: ""
    };

    const {
        getValues,
        register,
        reset,
        formState: { errors },
        setValue,
        setError,
        clearErrors
    } = useForm<UserFilterForm>({
        mode: "onChange",
        defaultValues
    });

    const isAttributeKeyDuplicate = () => {
        return activeFilters.userAttribute.some(
            filter => filter.name === getValues().name
        );
    };

    const isAttributeNameValid = () => {
        let valid = false;
        if (!getValues().name.length) {
            setError("name", {
                type: "empty",
                message: t("searchUserByAttributeMissingKeyError")
            });
        } else if (
            activeFilters.userAttribute.some(filter => filter.name === getValues().name)
        ) {
            setError("name", {
                type: "conflict",
                message: t("searchUserByAttributeKeyAlreadyInUseError")
            });
        } else {
            valid = true;
        }
        return valid;
    };

    const isAttributeValueValid = () => {
        let valid = false;
        if (!getValues().value.length) {
            setError("value", {
                type: "empty",
                message: t("searchUserByAttributeMissingValueError")
            });
        } else {
            valid = true;
        }
        return valid;
    };

    const isAttributeValid = () => isAttributeNameValid() && isAttributeValueValid();

    const addToFilter = () => {
        if (isAttributeValid()) {
            setActiveFilters({
                ...activeFilters,
                userAttribute: [...activeFilters.userAttribute, { ...getValues() }]
            });
            reset(defaultValues);
        } else {
            if (errors.name?.message) {
                toast.error(errors.name.message);
            }

            if (errors.value?.message) {
                toast.error(errors.value.message);
            }
        }
    };

    const clearActiveFilters = () => {
        const filtered = [...activeFilters.userAttribute].filter(
            chip => chip.name !== chip.name
        );
        setActiveFilters({ ...activeFilters, userAttribute: filtered });
        clearAllFilters();
    };

    const createAttributeKeyInputField = () => {
        if (profile) {
            return (
                <KeycloakSelect
                    data-testid="search-attribute-name-select"
                    variant={SelectVariant.typeahead}
                    onToggle={isOpen => setSelectAttributeKeyOpen(isOpen)}
                    selections={getValues().displayName}
                    onSelect={selectedValue => {
                        setValue("displayName", selectedValue.toString());
                        if (isAttributeKeyDuplicate()) {
                            setError("name", { type: "conflict" });
                        } else {
                            clearErrors("name");
                        }
                    }}
                    isOpen={selectAttributeKeyOpen}
                    placeholderText={t("selectAttribute")}
                    validated={errors.name && "error"}
                    maxHeight={300}
                    {...register("displayName", {
                        required: true,
                        validate: isAttributeNameValid
                    })}
                >
                    {profile.attributes?.map(option => (
                        <SelectOption
                            key={option.name}
                            value={label(t, option.displayName!, option.name)}
                            onClick={e => {
                                e.stopPropagation();
                                setSelectAttributeKeyOpen(false);
                                setValue("name", option.name!);
                            }}
                        >
                            {label(t, option.displayName!, option.name)}
                        </SelectOption>
                    ))}
                </KeycloakSelect>
            );
        } else {
            return (
                <Input
                    id="name"
                    placeholder={t("keyPlaceholder")}
                    className={errors.name ? "border-destructive" : ""}
                    onKeyDown={e => e.key === "Enter" && addToFilter()}
                    {...register("name", {
                        required: true,
                        validate: isAttributeNameValid
                    })}
                />
            );
        }
    };

    return (
        <Form
            className="user-attribute-search-form"
            data-testid="user-attribute-search-form"
        >
            <div className="user-attribute-search-form-headline">
                <h2>{t("selectAttributes")}</h2>
            </div>
            <Alert
                className="user-attribute-search-form-alert"
                variant="default"
            >
                <AlertDescription>{t("searchUserByAttributeDescription")}</AlertDescription>
            </Alert>
            <div className="user-attribute-search-form-key-value flex gap-4">
                <div className="user-attribute-search-form-left">
                    <h3>{t("key")}</h3>
                </div>
                <div className="user-attribute-search-form-right">
                    <h3>{t("value")}</h3>
                </div>
            </div>
            <div className="user-attribute-search-form-left">
                {createAttributeKeyInputField()}
            </div>
            <div className="user-attribute-search-form-right">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            id="value"
                            placeholder={t("valuePlaceholder")}
                            className={errors.value ? "border-destructive" : ""}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addToFilter();
                                }
                            }}
                            {...register("value", {
                                required: true,
                                validate: isAttributeValueValid
                            })}
                        />
                    </div>
                    <div>
                        <Button
                            data-testid="user-attribute-search-add-filter-button"
                            variant="outline"
                            onClick={addToFilter}
                            aria-label={t("addToFilter")}
                        >
                            <Check className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
            {createAttributeSearchChips()}

            <div className="pf-v5-u-pt-lg">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="exact"
                        data-testid="exact"
                        checked={activeFilters.exact}
                        onCheckedChange={(value) => {
                            setActiveFilters({
                                ...activeFilters,
                                exact: !!value
                            });
                        }}
                    />
                    <label htmlFor="exact">{t("exactSearch")}</label>
                </div>
            </div>
            <div className="flex gap-2 user-attribute-search-form-action-group">
                <Button
                    data-testid="search-user-attribute-btn"
                    type="submit"
                    disabled={!activeFilters.userAttribute.length}
                    onClick={searchUserWithAttributes}
                >
                    {t("search")}
                </Button>
                <Button
                    variant="link"
                    onClick={() => {
                        reset();
                        clearActiveFilters();
                    }}
                >
                    {t("reset")}
                </Button>
            </div>
        </Form>
    );
}
