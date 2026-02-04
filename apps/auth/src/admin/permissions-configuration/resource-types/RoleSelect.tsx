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
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import {
    AddRoleButton,
    AddRoleMappingModal,
    FilterType
} from "../../components/role-mapping/AddRoleMappingModal";
import { Row, ServiceRole } from "../../components/role-mapping/RoleMapping";

type RoleSelectorProps = {
    name: string;
    isRadio?: boolean;
};

export const RoleSelect = ({ name, isRadio = false }: RoleSelectorProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const {
        getValues,
        setValue,
        formState: { errors }
    } = useFormContext<{ [key: string]: string[] }>();
    const values = getValues(name) || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<Row[]>([]);
    const [filterType, setFilterType] = useState<FilterType>("clients");

    useFetch(
        async () => {
            if (values.length > 0) {
                const roles = await Promise.all(
                    values.map(id => adminClient.roles.findOneById({ id }))
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
            return [];
        },
        setSelectedRoles,
        []
    );

    return (
        <FormLabel
            name={name}
            label={isRadio ? t("role") : t("roles")}
            labelIcon={
                <HelpItem
                    helpText={isRadio ? t("selectRole") : t("policyRolesHelp")}
                    fieldLabelId="roles"
                />
            }
            isRequired
        >
            {isModalOpen && (
                <AddRoleMappingModal
                    id="role"
                    type="roles"
                    title={t("selectRole")}
                    actionLabel={t("select")}
                    isRadio={isRadio}
                    onAssign={rows => {
                        setValue(name, [
                            ...(!isRadio ? values : []),
                            ...rows
                                .filter(row => row.role.id !== undefined)
                                .map(row => row.role.id!)
                        ]);

                        setSelectedRoles(isRadio ? rows : [...selectedRoles, ...rows]);
                        setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                    filterType={filterType}
                />
            )}
            <AddRoleButton
                label={isRadio ? t("selectRole") : t("addRoles")}
                data-testid="select-role-button"
                variant="secondary"
                onFilerTypeChange={type => {
                    setFilterType(type);
                    setIsModalOpen(true);
                }}
            />
            {selectedRoles.length > 0 && (
                <Table className="mt-2 text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("roles")}</TableHead>
                            <TableHead aria-hidden="true" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedRoles.map(row => (
                            <TableRow key={row.role.id}>
                                <TableCell>
                                    <ServiceRole role={row.role} client={row.client} />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="link"
                                        size="icon-sm"
                                        className="keycloak__client-authorization__policy-row-remove"
                                        onClick={() => {
                                            setValue(
                                                name,
                                                values.filter(id => id !== row.role.id)
                                            );
                                            setSelectedRoles(
                                                selectedRoles.filter(
                                                    s => s.role.id !== row.role.id
                                                )
                                            );
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
            {errors[name] && <FormErrorText message={t("requiredRoles")} />}
        </FormLabel>
    );
};
