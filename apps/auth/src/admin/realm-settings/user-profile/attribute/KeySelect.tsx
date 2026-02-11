import { SelectControlOption } from "../../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Input } from "@merge/ui/components/input";
import { useState } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useToggle from "../../../utils/useToggle";

type KeySelectProp = UseControllerProps & {
    selectItems: SelectControlOption[];
};

export const KeySelect = ({ selectItems, ...rest }: KeySelectProp) => {
    const { t } = useTranslation();
    const [open, toggle] = useToggle();
    const { field } = useController(rest);
    const [custom, setCustom] = useState(
        !selectItems.map(({ key }) => key).includes(field.value)
    );

    return (
        <div className="flex gap-2">
            <div className={custom ? "w-1/6" : "w-full"}>
                <Select
                    open={open}
                    onOpenChange={() => toggle()}
                    value={!custom ? field.value : ""}
                    onValueChange={(v) => {
                        if (v) setCustom(false);
                        field.onChange(v);
                        toggle();
                    }}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__custom__">
                            {t("customAttribute")}
                        </SelectItem>
                        {selectItems.map(item => (
                            <SelectItem key={item.key} value={item.key}>
                                {item.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {custom && (
                <div className="flex-1">
                    <Input
                        id="customValue"
                        data-testid={rest.name}
                        placeholder={t("keyPlaceholder")}
                        value={field.value}
                        onChange={field.onChange}
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
};
