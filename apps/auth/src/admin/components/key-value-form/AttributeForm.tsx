/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/key-value-form/AttributeForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, UseFormReturn } from "react-hook-form";

import { FormAccess } from "../form/FormAccess";
import type { KeyValueType } from "./key-value-convert";
import { KeyValueInput } from "./KeyValueInput";
import { FixedButtonsGroup } from "../form/FixedButtonGroup";

import "./AttributeForm.css";

export type AttributeForm = Omit<RoleRepresentation, "attributes"> & {
    attributes?: KeyValueType[];
};

export type AttributesFormProps = {
    form: UseFormReturn<AttributeForm>;
    save?: (model: AttributeForm) => void;
    reset?: () => void;
    fineGrainedAccess?: boolean;
    name?: string;
    isDisabled?: boolean;
};

export const AttributesForm = ({
    form,
    reset,
    save,
    fineGrainedAccess,
    name = "attributes",
    isDisabled = false
}: AttributesFormProps) => {
    const noSaveCancelButtons = !save && !reset;
    const { handleSubmit } = form;

    return (
        <FormAccess
            role="manage-realm"
            onSubmit={save ? handleSubmit(save) : undefined}
            fineGrainedAccess={fineGrainedAccess}
        >
            <FormProvider {...form}>
                <KeyValueInput name={name} isDisabled={isDisabled} />
            </FormProvider>
            {!noSaveCancelButtons && (
                <FixedButtonsGroup name="attributes" reset={reset} isSubmit />
            )}
        </FormAccess>
    );
};
