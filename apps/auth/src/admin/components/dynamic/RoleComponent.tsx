/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/RoleComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { FormErrorText, HelpItem } from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { Badge } from "@merge/ui/components/badge";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useToggle from "../../utils/useToggle";
import {
    AddRoleButton,
    AddRoleMappingModal,
    FilterType
} from "../role-mapping/AddRoleMappingModal";
import { Row, ServiceRole } from "../role-mapping/RoleMapping";
import type { ComponentProps } from "./components";

const parseValue = (value: any) =>
    value?.includes(".") ? value.split(".") : ["", value || ""];

const parseRow = (value: Row) =>
    value.client?.clientId
        ? `${value.client.clientId}.${value.role.name}`
        : value.role.name;

export const RoleComponent = ({
    name,
    label,
    helpText,
    defaultValue,
    required,
    isDisabled = false,
    convertToName
}: ComponentProps) => {
    const { t } = useTranslation();

    const [openModal, toggleModal] = useToggle();
    const [filterType, setFilterType] = useState<FilterType>("clients");

    const {
        control,
        formState: { errors }
    } = useFormContext();

    const fieldName = convertToName(name!);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                <Label htmlFor={name!}>{t(label!)}{required && " *"}</Label>
                <HelpItem helpText={t(helpText!)} fieldLabelId={`${label}`} />
            </div>
            <Controller
                name={fieldName}
                defaultValue={defaultValue || ""}
                control={control}
                render={({ field }) => (
                    <div className="flex gap-4">
                        {openModal && (
                            <AddRoleMappingModal
                                id="id"
                                type="roles"
                                filterType={filterType}
                                name={name}
                                onAssign={rows => field.onChange(parseRow(rows[0]))}
                                onClose={toggleModal}
                                isRadio
                            />
                        )}

                        {field.value !== "" && (
                            <Badge
                                variant="secondary"
                                className="max-w-[500px] cursor-pointer truncate py-1.5 px-2 hover:bg-muted"
                                onClick={() => field.onChange("")}
                            >
                                <ServiceRole
                                    role={{ name: parseValue(field.value)[1] }}
                                    client={{ clientId: parseValue(field.value)[0] }}
                                />
                            </Badge>
                        )}
                        <div>
                            <AddRoleButton
                                label="selectRole.label"
                                onFilerTypeChange={type => {
                                    setFilterType(type);
                                    toggleModal();
                                }}
                                variant="secondary"
                                data-testid="add-roles"
                                isDisabled={isDisabled}
                            />
                        </div>
                    </div>
                )}
            />
            {errors[fieldName] && <FormErrorText message={t("required")} />}
        </div>
    );
};
