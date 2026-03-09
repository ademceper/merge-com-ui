import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { HelpItem } from "@/shared/keycloak-ui-shared";
import { GroupPickerDialog } from "../group/group-picker-dialog";
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
                            <Label htmlFor={name!}>
                                {t(label!)}
                                {required && " *"}
                            </Label>
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
