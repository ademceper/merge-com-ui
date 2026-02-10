import {
    KeycloakSelect,
    KeycloakSelectProps,
    SelectVariant
} from "../../../shared/keycloak-ui-shared";
import { NumberInput } from "@merge/ui/components/number-input";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export type Unit = "second" | "minute" | "hour" | "day";

type TimeUnit = { unit: Unit; label: string; multiplier: number };

const allTimes: TimeUnit[] = [
    { unit: "second", label: "times.seconds", multiplier: 1 },
    { unit: "minute", label: "times.minutes", multiplier: 60 },
    { unit: "hour", label: "times.hours", multiplier: 3600 },
    { unit: "day", label: "times.days", multiplier: 86400 }
];

export type TimeSelectorProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "defaultValue"> &
    Pick<KeycloakSelectProps, "menuAppendTo"> & {
        value?: number;
        units?: Unit[];
        onChange?: (time: number | string) => void;
        className?: string;
        validated?: "success" | "warning" | "error" | "default";
        /** Input + unit row takes full width, number input grows. */
        fullWidth?: boolean;
    };

const getTimeUnit = (units: TimeUnit[], value = 0) =>
    units.reduce(
        (v, time) =>
            value % time.multiplier === 0 && v.multiplier < time.multiplier ? time : v,
        units[0]
    );

export const toHumanFormat = (value: number, locale: string) => {
    const timeUnit = getTimeUnit(allTimes, value);
    const formatter = new Intl.NumberFormat(locale, {
        style: "unit",
        unit: timeUnit.unit,
        unitDisplay: "long"
    });
    return formatter.format(value / timeUnit.multiplier);
};

export const TimeSelector = ({
    value,
    units = ["second", "minute", "hour", "day"],
    onChange,
    className,
    min,
    max,
    menuAppendTo,
    validated: _validated,
    fullWidth = false,
    children: _children,
    ...rest
}: TimeSelectorProps) => {
    const { t } = useTranslation();

    const [lastMultiplier, setLastMultiplier] = useState<number>();

    const defaultMultiplier = useMemo(
        () => allTimes.find(time => time.unit === units[0])?.multiplier,
        [units]
    );

    const [timeValue, setTimeValue] = useState<"" | number>("");
    const [multiplier, setMultiplier] = useState(defaultMultiplier);
    const [open, setOpen] = useState(false);

    const times = useMemo(() => {
        const filteredUnits = units.map(
            unit => allTimes.find(time => time.unit === unit)!
        );
        if (
            !filteredUnits.every(u => u.multiplier === multiplier) &&
            filteredUnits[0] !== allTimes[0]
        ) {
            filteredUnits.unshift(allTimes[0]);
        }
        return filteredUnits;
    }, [units, multiplier]);

    useEffect(() => {
        const multiplier = getTimeUnit(times, value).multiplier;

        if (value) {
            setMultiplier(multiplier);
            setTimeValue(value / multiplier);
            setLastMultiplier(multiplier);
        } else {
            setTimeValue(value || "");
            setMultiplier(lastMultiplier ?? defaultMultiplier);
            setLastMultiplier(lastMultiplier ?? defaultMultiplier);
        }
    }, [value, defaultMultiplier]);

    const updateTimeout = (
        timeout: "" | number,
        times: number | undefined = multiplier
    ) => {
        if (timeout !== "") {
            onChange?.(timeout * (times || 1));
            setTimeValue(timeout);
        } else {
            onChange?.("");
        }
    };

    return (
        <div className={`flex gap-4 ${fullWidth ? "w-full" : ""} ${className || ""}`}>
            <div className={fullWidth ? "flex-1 min-w-0" : ""}>
                <NumberInput
                    {...({
                        ...rest,
                        "aria-label": "kc-time",
                        min: min !== undefined && min !== "" ? Number(min) : 0,
                        max: max !== undefined && max !== "" ? Number(max) : undefined,
                        value: timeValue,
                        className: `${className || ""}-input ${fullWidth ? "w-full" : ""}`,
                        onChange: (v: number | "") => updateTimeout(v)
                    } as React.ComponentProps<typeof NumberInput>)}
                />
            </div>
            <div id={`${className || ""}-select-menu`} className={fullWidth ? "shrink-0" : ""}>
                <KeycloakSelect
                    variant={SelectVariant.single}
                    aria-label={t("unitLabel")}
                    className={`${className}-select`}
                    onSelect={value => {
                        setMultiplier(value as number);
                        updateTimeout(timeValue, value as number);
                        setOpen(false);
                    }}
                    menuAppendTo={menuAppendTo}
                    selections={multiplier}
                    onToggle={() => {
                        setOpen(!open);
                    }}
                    isOpen={open}
                    isDisabled={rest.disabled}
                >
                    {times.map(time => (
                        <SelectOption
                            id={time.label}
                            key={time.label}
                            value={String(time.multiplier)}
                        >
                            {t(time.label)}
                        </SelectOption>
                    ))}
                </KeycloakSelect>
            </div>
        </div>
    );
};
