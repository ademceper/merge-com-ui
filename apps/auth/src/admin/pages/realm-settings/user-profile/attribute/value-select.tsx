import { useTranslation } from "@merge-rd/i18n";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { useState } from "react";
import { type UseControllerProps, useController } from "react-hook-form";

type ValueSelectProps = UseControllerProps & {
    selectItems: string[];
};

export const ValueSelect = ({ selectItems, ...rest }: ValueSelectProps) => {
    const { t } = useTranslation();
    const { field } = useController(rest);
    const [open, setOpen] = useState(false);

    return (
        <Select
            open={open}
            onOpenChange={setOpen}
            value={field.value ?? ""}
            onValueChange={v => {
                field.onChange(v);
                setOpen(false);
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder={t("valuePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
                {selectItems.map(item => (
                    <SelectItem key={item} value={item}>
                        {item}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
