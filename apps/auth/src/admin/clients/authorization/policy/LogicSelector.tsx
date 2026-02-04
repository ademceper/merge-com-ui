import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";

import { HelpItem } from "../../../../shared/keycloak-ui-shared";

const LOGIC_TYPES = ["POSITIVE", "NEGATIVE"] as const;

type LogicSelectorProps = {
    isDisabled?: boolean;
};

export const LogicSelector = ({ isDisabled }: LogicSelectorProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{t("logic")}</Label>
                <HelpItem helpText={t("logicHelp")} fieldLabelId="logic" />
            </div>
            <Controller
                name="logic"
                data-testid="logic"
                defaultValue={LOGIC_TYPES[0]}
                control={control}
                render={({ field }) => (
                    <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                        className="flex flex-col gap-2"
                    >
                        {LOGIC_TYPES.map(type => (
                            <div key={type} className="flex items-center gap-2" data-testid={type}>
                                <RadioGroupItem value={type} id={type} />
                                <Label htmlFor={type}>{t(`logicType.${type.toLowerCase()}`)}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
        </div>
    );
};
