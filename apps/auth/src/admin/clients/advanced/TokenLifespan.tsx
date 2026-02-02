/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/advanced/TokenLifespan.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Label } from "@merge/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@merge/ui/components/select";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { TimeSelector, Unit } from "../../components/time-selector/TimeSelector";

type TokenLifespanProps = {
    id: string;
    name: string;
    defaultValue?: number;
    units?: Unit[];
};

const inherited = "tokenLifespan.inherited";
const expires = "tokenLifespan.expires";

export const TokenLifespan = ({ id, name, defaultValue, units }: TokenLifespanProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const [focused, setFocused] = useState(false);
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    const { control } = useFormContext();
    const isExpireSet = (value: string | number) =>
        typeof value === "number" ||
        (typeof value === "string" && value !== "") ||
        focused;

    return (
        <div className="space-y-2" data-testid={`token-lifespan-${id}`}>
            <div className="flex items-center gap-2">
                <Label htmlFor={id}>{t(id)}</Label>
                <HelpItem helpText={t(`${id}Help`)} fieldLabelId={id} />
            </div>
            <Controller
                name={name}
                defaultValue=""
                control={control}
                render={({ field }) => (
                    <div className="flex gap-4">
                        <div>
                            <Select
                                value={isExpireSet(field.value) ? "60" : ""}
                                onValueChange={(value) => {
                                    field.onChange(value === "" ? "" : 60);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue>
                                        {isExpireSet(field.value)
                                            ? t(expires)
                                            : t(inherited)}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">{t(inherited)}</SelectItem>
                                    <SelectItem value="60">{t(expires)}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {isExpireSet(field.value) && (
                            <div>
                                <TimeSelector
                                    validated={
                                        isExpireSet(field.value) && field.value! < 1
                                            ? "warning"
                                            : "default"
                                    }
                                    units={units}
                                    value={field.value === "" ? defaultValue : field.value}
                                    onChange={field.onChange}
                                    onFocus={onFocus}
                                    onBlur={onBlur}
                                    min={1}
                                    isDisabled={!isExpireSet(field.value)}
                                />
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};
