/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/component/DisplayOrder.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";

export const DisplayOrder = () => {
    const { t } = useTranslation();

    const { control } = useFormContext();

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor="kc-display-order">{t("displayOrder")}</Label>
                <HelpItem helpText={t("displayOrderHelp")} fieldLabelId="displayOrder" />
            </div>
            <Controller
                name="config.guiOrder"
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <Input
                        id="kc-display-order"
                        type="number"
                        value={field.value}
                        data-testid="displayOrder"
                        min={0}
                        onChange={(e) => {
                            const value = e.target.value;
                            const num = Number(value);
                            field.onChange(value === "" ? value : num < 0 ? 0 : num);
                        }}
                    />
                )}
            />
        </div>
    );
};
