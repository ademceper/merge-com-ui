import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";

const DECISION_STRATEGY = ["UNANIMOUS", "AFFIRMATIVE", "CONSENSUS"] as const;

type DecisionStrategySelectProps = {
    helpLabel?: string;
    isDisabled?: boolean;
    isLimited?: boolean;
};

export const DecisionStrategySelect = ({
    helpLabel,
    isDisabled = false,
    isLimited = false
}: DecisionStrategySelectProps) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{t("decisionStrategy")}</Label>
                <HelpItem
                    helpText={t(helpLabel || "decisionStrategyHelp")}
                    fieldLabelId="decisionStrategy"
                />
            </div>
            <Controller
                name="decisionStrategy"
                data-testid="decisionStrategy"
                defaultValue={DECISION_STRATEGY[0]}
                control={control}
                render={({ field }) => (
                    <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isDisabled}
                        className="flex flex-col gap-2"
                    >
                        {(isLimited
                            ? DECISION_STRATEGY.slice(0, 2)
                            : DECISION_STRATEGY
                        ).map(strategy => (
                            <div key={strategy} className="flex items-center gap-2" data-testid={strategy}>
                                <RadioGroupItem value={strategy} id={strategy} />
                                <Label htmlFor={strategy}>{t(`decisionStrategies.${strategy}`)}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
        </div>
    );
};
