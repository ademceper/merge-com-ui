import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { Label } from "@merge-rd/ui/components/label";
import { MinusCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/admin/shared/ui/data-table";
import { HelpItem, TextControl } from "@/shared/keycloak-ui-shared";
import { GroupPickerDialog } from "@/admin/shared/ui/group/group-picker-dialog";
import { useGroupsById } from "../hooks/use-groups-by-id";

type GroupForm = {
    groups?: GroupValue[];
    groupsClaim: string;
};

export type GroupValue = {
    id: string;
    extendChildren: boolean;
};

export const Group = () => {
    const { t } = useTranslation();
    const { control, getValues, setValue } = useFormContext<GroupForm>();
    const values = getValues("groups");

    const [open, setOpen] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);

    const groupIds = (values || []).map(g => g.id);
    const { data: groupsData } = useGroupsById(groupIds);

    useEffect(() => {
        if (groupsData) {
            const filteredGroup = groupsData.filter(g => g) as GroupRepresentation[];
            setSelectedGroups(filteredGroup);
        }
    }, [groupsData]);

    return (
        <>
            <TextControl
                name="groupsClaim"
                label={t("groupsClaim")}
                labelIcon={t("groupsClaimHelp")}
            />
            <div className="space-y-2">
                <Label htmlFor="groups" className="flex items-center gap-1">
                    {t("groups")}
                    <HelpItem helpText={t("policyGroupsHelp")} fieldLabelId="groups" />
                </Label>
                <div id="groups">
                    <Controller
                        name="groups"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <>
                                {open && (
                                    <GroupPickerDialog
                                        type="selectMany"
                                        text={{
                                            title: "addGroupsToGroupPolicy",
                                            ok: "add"
                                        }}
                                        onConfirm={groups => {
                                            field.onChange([
                                                ...(field.value || []),
                                                ...(groups || []).map(({ id }) => ({
                                                    id
                                                }))
                                            ]);
                                            setSelectedGroups([
                                                ...selectedGroups,
                                                ...(groups || [])
                                            ]);
                                            setOpen(false);
                                        }}
                                        onClose={() => {
                                            setOpen(false);
                                        }}
                                        filterGroups={selectedGroups}
                                    />
                                )}
                                <Button
                                    data-testid="select-group-button"
                                    variant="secondary"
                                    onClick={() => {
                                        setOpen(true);
                                    }}
                                >
                                    {t("addGroups")}
                                </Button>
                            </>
                        )}
                    />
                    {selectedGroups.length > 0 && (
                        <Table className="text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("groups")}</TableHead>
                                    <TableHead>{t("extendToChildren")}</TableHead>
                                    <TableHead aria-hidden="true" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedGroups.map((group, index) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.path}</TableCell>
                                        <TableCell>
                                            <Controller
                                                name={`groups.${index}.extendChildren`}
                                                defaultValue={false}
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        id="extendChildren"
                                                        data-testid="standard"
                                                        name="extendChildren"
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={
                                                            group.subGroupCount === 0
                                                        }
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="keycloak__client-authorization__policy-row-remove"
                                                onClick={() => {
                                                    setValue("groups", [
                                                        ...(values || []).filter(
                                                            ({ id }) => id !== group.id
                                                        )
                                                    ]);
                                                    setSelectedGroups([
                                                        ...selectedGroups.filter(
                                                            ({ id }) => id !== group.id
                                                        )
                                                    ]);
                                                }}
                                            >
                                                <MinusCircle className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </>
    );
};
