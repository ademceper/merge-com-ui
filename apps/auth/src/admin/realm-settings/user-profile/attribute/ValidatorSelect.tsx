import ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Label } from "@merge/ui/components/label";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../../../context/server-info/ServerInfoProvider";
import useToggle from "../../../utils/useToggle";

type ValidatorSelectProps = {
    selectedValidators: string[];
    onChange: (validator: ComponentTypeRepresentation) => void;
};

export const ValidatorSelect = ({
    selectedValidators,
    onChange
}: ValidatorSelectProps) => {
    const { t } = useTranslation();
    const allValidator: ComponentTypeRepresentation[] =
        useServerInfo().componentTypes?.["org.keycloak.validate.Validator"] || [];
    const validators = useMemo(
        () => allValidator.filter(({ id }) => !selectedValidators.includes(id)),
        [selectedValidators]
    );
    const [open, toggle] = useToggle();
    const [value, setValue] = useState<ComponentTypeRepresentation>();

    return (
        <div className="space-y-2">
            <Label htmlFor="validator">{t("validatorType")}</Label>
            <Select
                open={open}
                onOpenChange={toggle}
                value={value?.id ?? ""}
                onValueChange={(id) => {
                    const option = validators.find((v) => v.id === id);
                    if (option) {
                        onChange(option);
                        setValue(option);
                    }
                    toggle();
                }}
                aria-label={t("selectOne")}
            >
                <SelectTrigger id="validator">
                    <SelectValue placeholder={t("choose")} />
                </SelectTrigger>
                <SelectContent>
                    {validators
                        .filter((option) => option.id != null && option.id !== "")
                        .map((option) => (
                            <SelectItem key={option.id!} value={option.id!}>
                                {option.id}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    );
};
