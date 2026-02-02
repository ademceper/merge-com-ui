/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/resource-types/GroupSelect.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { FormErrorText, HelpItem, useFetch, FormLabel } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import { MinusCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import type { ComponentProps } from "../../components/dynamic/components";
import { GroupPickerDialog } from "../../components/group/GroupPickerDialog";

type GroupSelectProps = Omit<ComponentProps, "convertToName"> & {
    variant?: "typeahead" | "typeaheadMulti";
    isRequired?: boolean;
};

const convertGroups = (groups: GroupRepresentation[]): string[] =>
    groups.map(({ id }) => id!);

export const GroupSelect = ({
    name,
    label,
    helpText,
    defaultValue,
    isDisabled = false,
    isRequired,
    variant = "typeaheadMulti"
}: GroupSelectProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const {
        control,
        setValue,
        getValues,
        formState: { errors }
    } = useFormContext();
    const values: string[] = getValues(name!);
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<GroupRepresentation[]>([]);

    useFetch(
        () => {
            if (values && values.length > 0) {
                return Promise.all(
                    (values as string[]).map(id => adminClient.groups.findOne({ id }))
                );
            }
            return Promise.resolve([]);
        },
        groups => {
            setGroups(groups.flat().filter(g => g) as GroupRepresentation[]);
        },
        []
    );

    const selectOne = variant === "typeahead";

    return (
        <FormLabel
            name="groups"
            label={t(label!)}
            labelIcon={<HelpItem helpText={t(helpText!)} fieldLabelId="groups" />}
            isRequired={isRequired}
        >
            <Controller
                name={name!}
                control={control}
                defaultValue={defaultValue}
                rules={{
                    validate: (value?: string[]) =>
                        !isRequired || (value && value.length > 0)
                }}
                render={({ field }) => (
                    <>
                        {open && (
                            <GroupPickerDialog
                                type={selectOne ? "selectOne" : "selectMany"}
                                text={{
                                    title: "addGroupsToGroupPolicy",
                                    ok: "add"
                                }}
                                onConfirm={selectGroup => {
                                    if (selectOne) {
                                        field.onChange(convertGroups(selectGroup || []));
                                        setGroups(selectGroup || []);
                                    } else {
                                        field.onChange([
                                            ...(field.value || []),
                                            ...convertGroups(selectGroup || [])
                                        ]);
                                        setGroups([...groups, ...(selectGroup || [])]);
                                    }
                                    setOpen(false);
                                }}
                                onClose={() => {
                                    setOpen(false);
                                }}
                                filterGroups={groups}
                            />
                        )}
                        <Button
                            data-testid="select-group-button"
                            disabled={isDisabled}
                            variant="outline"
                            onClick={() => {
                                setOpen(true);
                            }}
                        >
                            {t("addGroups")}
                        </Button>
                    </>
                )}
            />
            {groups.length > 0 && (
                <Table className="mt-2 text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("groups")}</TableHead>
                            <TableHead aria-hidden="true" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.map(group => (
                            <TableRow key={group.id}>
                                <TableCell>{group.path}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="link"
                                        size="icon-sm"
                                        className="keycloak__client-authorization__policy-row-remove"
                                        onClick={() => {
                                            setValue(name!, [
                                                ...convertGroups(
                                                    (groups || []).filter(
                                                        ({ id }) => id !== group.id
                                                    )
                                                )
                                            ]);
                                            setGroups([
                                                ...groups.filter(
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
            {errors[name!] && <FormErrorText message={t("requiredGroups")} />}
        </FormLabel>
    );
};
