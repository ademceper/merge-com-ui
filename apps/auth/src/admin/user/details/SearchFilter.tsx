import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
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
                <Select
                    open={open}
                    onOpenChange={setOpen}
                    value={searchType}
                    onValueChange={(val) => {
                        onSelect(val as SearchType);
                        setOpen(false);
                    }}
                >
                    <SelectTrigger className="keycloak__users__searchtype">
                        <SelectValue placeholder={t("default")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">{t("default")}</SelectItem>
                        <SelectItem value="attribute">{t("attribute")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );
};
