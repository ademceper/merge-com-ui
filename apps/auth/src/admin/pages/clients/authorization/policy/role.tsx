import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
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
import { FormLabel, HelpItem } from "../../../../../shared/keycloak-ui-shared";
import {
    AddRoleButton,
    AddRoleMappingModal,
    type FilterType
} from "../../../../shared/ui/role-mapping/add-role-mapping-modal";
import { type Row, ServiceRole } from "../../../../shared/ui/role-mapping/role-mapping";
import { DefaultSwitchControl } from "../../../../shared/ui/switch-control";
import { useRolesById } from "../hooks/use-roles-by-id";
import type { RequiredIdValue } from "./client-scope";

export const Role = () => {
    const { t } = useTranslation();
    const { control, getValues, setValue } = useFormContext<{
        roles?: RequiredIdValue[];
        fetchRoles?: boolean;
    }>();
    const values = getValues("roles");

    const [open, setOpen] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("clients");

    const [selectedRoles, setSelectedRoles] = useState<Row[]>([]);

    const roleIds = (values || []).map(r => r.id);
    const { data: rolesData } = useRolesById(roleIds);

    useEffect(() => {
        if (rolesData) {
            setSelectedRoles(rolesData);
        }
    }, [rolesData]);

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
