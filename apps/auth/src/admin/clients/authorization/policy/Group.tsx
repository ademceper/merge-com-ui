/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/policy/Group.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { HelpItem, TextControl, useFetch } from "../../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Label } from "@merge/ui/components/label";
import { MinusCircle } from "@phosphor-icons/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";
import { GroupPickerDialog } from "../../../components/group/GroupPickerDialog";

type GroupForm = {
    groups?: GroupValue[];
    groupsClaim: string;
};

export type GroupValue = {
    id: string;
    extendChildren: boolean;
};

export const Group = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { control, getValues, setValue } = useFormContext<GroupForm>();
    const values = getValues("groups");

    const [open, setOpen] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>([]);

    useFetch(
        () => {
            if (values && values.length > 0)
                return Promise.all(
                    values.map(g => adminClient.groups.findOne({ id: g.id }))
                );
            return Promise.resolve([]);
        },
        groups => {
            const filteredGroup = groups.filter(g => g) as GroupRepresentation[];
            setSelectedGroups(filteredGroup);
        },
        []
    );

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
                                            ...(groups || []).map(({ id }) => ({ id }))
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
                                                    disabled={group.subGroupCount === 0}
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
