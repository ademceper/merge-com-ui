import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, UseFormReturn } from "react-hook-form";

import { FormAccess } from "../form/form-access";
import type { KeyValueType } from "./key-value-convert";
import { KeyValueInput } from "./key-value-input";
import { FixedButtonsGroup } from "../form/fixed-button-group";

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
