/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/GroupComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { GroupPickerDialog } from "../group/GroupPickerDialog";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";

export const GroupComponent = ({
    name,
    label,
    helpText,
    required,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<GroupRepresentation[]>();
    const { control } = useFormContext();

    return (
        <Controller
            name={convertToName(name!)}
            defaultValue=""
            control={control}
            render={({ field }) => (
                <>
                    {open && (
                        <GroupPickerDialog
                            type="selectOne"
                            text={{
                                title: "selectGroup",
                                ok: "select"
                            }}
                            onConfirm={groups => {
                                field.onChange(groups?.[0].path);
                                setGroups(groups);
                                setOpen(false);
                            }}
                            onClose={() => setOpen(false)}
                            filterGroups={groups}
                        />
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                            <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {field.value && (
                                <Badge
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-muted"
                                    onClick={() => field.onChange(undefined)}
                                >
                                    {field.value}
                                </Badge>
                            )}
                            <div>
                                <Button
                                    id="kc-join-groups-button"
                                    onClick={() => setOpen(!open)}
                                    variant="secondary"
                                    data-testid="join-groups-button"
                                >
                                    {t("selectGroup")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        />
    );
};
