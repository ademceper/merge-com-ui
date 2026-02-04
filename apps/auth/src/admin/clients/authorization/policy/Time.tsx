import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { useState } from "react";
import { FormErrorText, HelpItem } from "../../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";

const DATE_TIME_FORMAT = /(\d\d\d\d-\d\d-\d\d)? (\d\d?):(\d\d?)/;
const padDateSegment = (value: number) => value.toString().padStart(2, "0");

const DateTime = ({ name }: { name: string }) => {
    const { control } = useFormContext();

    const parseDate = (value: string, date?: Date): string => {
        if (!date) {
            return value;
        }

        const parts = DATE_TIME_FORMAT.exec(value);
        const parsedDate = [
            date.getFullYear(),
            padDateSegment(date.getMonth() + 1),
            padDateSegment(date.getDate())
        ].join("-");

        return `${parsedDate} ${parts ? parts[2] : "00"}:${parts ? parts[3] : "00"}:00`;
    };

    const parseTime = (
        value: string,
        hour?: number | null,
        minute?: number | null
    ): string => {
        const parts = DATE_TIME_FORMAT.exec(value);
        if (minute !== undefined && minute !== null) {
            return `${parts ? parts[1] : ""} ${hour}:${
                minute < 10 ? `0${minute}` : minute
            }:00`;
        }
        return value;
    };

    return (
        <Controller
            name={name}
            defaultValue=""
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
                const dateTime = field.value.match(DATE_TIME_FORMAT) || [
                    "",
                    "",
                    "0",
                    "00"
                ];
                return (
                    <div className="flex gap-2" id={name}>
                        <Input
                            type="date"
                            value={dateTime[1]}
                            onChange={(e) => {
                                const date = e.target.valueAsDate;
                                field.onChange(parseDate(field.value, date || undefined));
                            }}
                        />
                        <Input
                            type="time"
                            value={`${dateTime[2].padStart(2, '0')}:${dateTime[3]}`}
                            onChange={(e) => {
                                const [h, m] = e.target.value.split(':').map(Number);
                                field.onChange(parseTime(field.value, h, m));
                            }}
                        />
                    </div>
                );
            }}
        />
    );
};

type NumberControlProps = {
    name: string;
    min: number;
    max: number;
};

const NumberControl = ({ name, min, max }: NumberControlProps) => {
    const { control } = useFormContext();
    const setValue = (newValue: number) => Math.min(newValue, max);

    return (
        <Controller
            name={name}
            defaultValue=""
            control={control}
            render={({ field }) => (
                <Input
                    type="number"
                    id={name}
                    value={field.value}
                    min={min}
                    max={max}
                    onChange={event => {
                        const newValue = Number(event.currentTarget.value);
                        field.onChange(setValue(!isNaN(newValue) ? newValue : 0));
                    }}
                />
            )}
        />
    );
};

const FromTo = ({ name, ...rest }: NumberControlProps) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label>{t(name)}</Label>
                <HelpItem helpText={t(`${name}Help`)} fieldLabelId={name} />
            </div>
            <div className="flex gap-2 items-center">
                <NumberControl name={name} {...rest} />
                <span>{t("to")}</span>
                <NumberControl name={`${name}End`} {...rest} />
            </div>
        </div>
    );
};

export const Time = () => {
    const { t } = useTranslation();
    const {
        getValues,
        formState: { errors }
    } = useFormContext();
    const [repeat, setRepeat] = useState(getValues("month"));
    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("repeat")}</Label>
                    <HelpItem helpText={t("repeatHelp")} fieldLabelId="repeat" />
                </div>
                <RadioGroup
                    value={repeat ? "repeat" : "notRepeat"}
                    onValueChange={(v) => setRepeat(v === "repeat")}
                    className="flex gap-4"
                >
                    <div className="flex items-center gap-2" data-testid="notRepeat">
                        <RadioGroupItem value="notRepeat" id="notRepeat" />
                        <Label htmlFor="notRepeat">{t("notRepeat")}</Label>
                    </div>
                    <div className="flex items-center gap-2" data-testid="repeat">
                        <RadioGroupItem value="repeat" id="repeat" />
                        <Label htmlFor="repeat">{t("repeat")}</Label>
                    </div>
                </RadioGroup>
            </div>
            {repeat && (
                <>
                    <FromTo name="month" min={1} max={12} />
                    <FromTo name="dayMonth" min={1} max={31} />
                    <FromTo name="hour" min={0} max={23} />
                    <FromTo name="minute" min={0} max={59} />
                </>
            )}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("startTime")}</Label>
                    <HelpItem helpText={t("startTimeHelp")} fieldLabelId="startTime" />
                </div>
                <DateTime name="notBefore" />
                {errors.notBefore && <FormErrorText message={t("required")} />}
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label>{t("expireTime")}</Label>
                    <HelpItem helpText={t("expireTimeHelp")} fieldLabelId="expireTime" />
                </div>
                <DateTime name="notOnOrAfter" />
                {errors.notOnOrAfter && <FormErrorText message={t("required")} />}
            </div>
        </>
    );
};
