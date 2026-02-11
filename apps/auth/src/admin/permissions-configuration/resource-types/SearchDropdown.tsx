import PolicyRepresentation from "@keycloak/keycloak-admin-client/lib/defs/policyRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { SelectField, TextControl } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useToggle from "../../utils/useToggle";
import { ResourceType } from "./ResourceType";

export type SearchForm = {
    name?: string;
    resources?: string;
    scope?: string;
    type?: string;
    uri?: string;
    owner?: string;
    resourceType?: string;
};

type SearchDropdownProps = {
    resources?: UserRepresentation[];
    types: PolicyRepresentation[];
    search: SearchForm;
    onSearch: (form: SearchForm) => void;
    resourceType?: string;
};

export const SearchDropdown = ({ types, search, onSearch }: SearchDropdownProps) => {
    const { t } = useTranslation();
    const form = useForm<SearchForm>({
        mode: "onChange",
        defaultValues: search
    });

    const {
        reset,
        formState: { isDirty },
        handleSubmit
    } = form;

    const [open, toggle] = useToggle();
    const [resourceScopes, setResourceScopes] = useState<string[]>([]);
    const selectedType = useWatch({
        control: form.control,
        name: "resourceType",
        defaultValue: ""
    });
    const [key, setKey] = useState(0);
    const ref = useRef("clients");

    const submit = (form: SearchForm) => {
        toggle();
        onSearch(form);
    };

    useEffect(() => {
        const type = types?.find(item => item.type === selectedType);
        setResourceScopes(type?.scopes || []);
    }, [selectedType, types]);

    useEffect(() => {
        reset(search);
        setKey(prevKey => prevKey + 1);
    }, [search]);

    return (
        <Popover open={open} onOpenChange={toggle}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-testid="searchdropdown_dorpdown"
                    onClick={toggle}
                >
                    {t("searchClientAuthorizationPermission")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
            <FormProvider {...form}>
                <form
                    key={key}
                    className="keycloak__client_authentication__searchdropdown_form space-y-4"
                    onSubmit={handleSubmit(submit)}
                >
                    <TextControl name="name" label={t("name")} />
                    <SelectField
                        name="resourceType"
                        label={t("type")}
                        defaultValue=""
                        options={[
                            { key: "", value: t("choose") },
                            ...types.map(({ type, name }) => ({
                                key: type!,
                                value: name! || type!
                            }))
                        ]}
                        onSelect={(value, onChange) => {
                            if (ref.current !== value) {
                                ref.current = value as string;
                                form.setValue("resources", undefined);
                            }
                            onChange(value);
                        }}
                    />
                    {selectedType !== "" && (
                        <>
                            <ResourceType
                                resourceType={selectedType || "clients"}
                                withEnforceAccessTo={false}
                            />
                            <SelectField
                                name={"scope"}
                                label={t("authorizationScope")}
                                defaultValue=""
                                options={[
                                    ...(resourceScopes || []).map(resourceScope => ({
                                        key: resourceScope!,
                                        value: resourceScope!
                                    }))
                                ]}
                            />
                        </>
                    )}

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            data-testid="search-btn"
                            disabled={!isDirty}
                        >
                            {t("search")}
                        </Button>
                        <Button
                            variant="link"
                            data-testid="revert-btn"
                            onClick={() => {
                                reset({});
                                onSearch({});
                            }}
                        >
                            {t("clear")}
                        </Button>
                    </div>
                </form>
            </FormProvider>
            </PopoverContent>
        </Popover>
    );
};
