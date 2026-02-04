import { KeycloakSelect } from "../../../shared/keycloak-ui-shared";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import { Funnel } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type SearchType = "default" | "attribute";

type SearchToolbarProps = SearchDropdownProps;

type SearchDropdownProps = {
    searchType: SearchType;
    onSelect: (value: SearchType) => void;
};

export const SearchDropdown = ({ searchType, onSelect }: SearchDropdownProps) => {
    const { t } = useTranslation();
    const [searchToggle, setSearchToggle] = useState(false);

    const createDropdownItem = (type: SearchType) => (
        <DropdownMenuItem
            key={type}
            onClick={() => {
                onSelect(type);
                setSearchToggle(false);
            }}
        >
            {t(`searchType.${type}`)}
        </DropdownMenuItem>
    );

    return (
        <DropdownMenu open={searchToggle} onOpenChange={setSearchToggle}>
            <DropdownMenuTrigger asChild>
                <Button
                    data-testid="user-search-toggle"
                    id="toggle-id"
                    variant="outline"
                    className="keycloak__users__searchtype"
                >
                    <Funnel className="size-4" />
                    {t(`searchType.${searchType}`)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {createDropdownItem("default")}
                {createDropdownItem("attribute")}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const SearchToolbar = ({ searchType, onSelect }: SearchToolbarProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <>
            <div>
                <SearchDropdown searchType={searchType} onSelect={onSelect} />
            </div>
            <div>
                <KeycloakSelect
                    className="keycloak__users__searchtype"
                    onToggle={val => setOpen(val)}
                    isOpen={open}
                    selections={[t("default"), t("attribute")]}
                    onSelect={() => setOpen(false)}
                >
                    <SelectOption value={"default"}>{t("default")}</SelectOption>
                    <SelectOption value={"attribute"}>{t("attribute")}</SelectOption>
                </KeycloakSelect>
            </div>
        </>
    );
};
