import { HelpItem, useFetch, FormLabel } from "../../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
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
import { useAdminClient } from "../../../admin-client";
import { DefaultSwitchControl } from "../../../components/SwitchControl";
import {
    AddRoleButton,
    AddRoleMappingModal,
    FilterType
} from "../../../components/role-mapping/AddRoleMappingModal";
import { Row, ServiceRole } from "../../../components/role-mapping/RoleMapping";
import type { RequiredIdValue } from "./ClientScope";

export const Role = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { control, getValues, setValue } = useFormContext<{
        roles?: RequiredIdValue[];
        fetchRoles?: boolean;
    }>();
    const values = getValues("roles");

    const [open, setOpen] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("clients");

    const [selectedRoles, setSelectedRoles] = useState<Row[]>([]);

    useFetch(
        async () => {
            if (values && values.length > 0) {
                const roles = await Promise.all(
                    values.map(r => adminClient.roles.findOneById({ id: r.id }))
                );
                return Promise.all(
                    roles.map(async role => ({
                        role: role!,
                        client: role!.clientRole
                            ? await adminClient.clients.findOne({
                                  id: role?.containerId!
                              })
                            : undefined
                    }))
                );
            }
            return Promise.resolve([]);
        },
        setSelectedRoles,
        []
    );

    return (
        <>
            <FormLabel
                name="roles"
                label={t("roles")}
                labelIcon={
                    <HelpItem helpText={t("policyRolesHelp")} fieldLabelId="roles" />
                }
            >
                <Controller
                    name="roles"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                        <>
                            {open && (
                                <AddRoleMappingModal
                                    id="role"
                                    type="roles"
                                    title={t("assignRole")}
                                    filterType={filterType}
                                    onAssign={rows => {
                                        field.onChange([
                                            ...(field.value || []),
                                            ...rows.map(row => ({ id: row.role.id }))
                                        ]);
                                        setSelectedRoles([...selectedRoles, ...rows]);
                                        setOpen(false);
                                    }}
                                    onClose={() => {
                                        setOpen(false);
                                    }}
                                />
                            )}
                            <AddRoleButton
                                data-testid="select-role-button"
                                variant="secondary"
                                onFilerTypeChange={type => {
                                    setFilterType(type);
                                    setOpen(true);
                                }}
                            />
                        </>
                    )}
                />
                {selectedRoles.length > 0 && (
                    <Table className="mt-2 text-sm">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("roles")}</TableHead>
                                <TableHead>{t("required")}</TableHead>
                                <TableHead aria-hidden="true" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedRoles.map((row, index) => (
                                <TableRow key={row.role.id}>
                                    <TableCell>
                                        <ServiceRole
                                            role={row.role}
                                            client={row.client}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Controller
                                            name={`roles.${index}.required`}
                                            defaultValue={false}
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id="required"
                                                    data-testid="standard"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            size="icon-sm"
                                            className="keycloak__client-authorization__policy-row-remove"
                                            onClick={() => {
                                                setValue("roles", [
                                                    ...(values || []).filter(
                                                        s => s.id !== row.role.id
                                                    )
                                                ]);
                                                setSelectedRoles([
                                                    ...selectedRoles.filter(
                                                        s => s.role.id !== row.role.id
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
            </FormLabel>
            <DefaultSwitchControl
                name="fetchRoles"
                label={t("fetchRoles")}
                labelIcon={t("fetchRolesHelp")}
            />
        </>
    );
};
