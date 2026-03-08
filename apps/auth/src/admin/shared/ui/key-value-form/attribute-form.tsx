import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { FixedButtonsGroup } from "../form/fixed-button-group";
import { FormAccess } from "../form/form-access";
import type { KeyValueType } from "./key-value-convert";
import { KeyValueInput } from "./key-value-input";

export type AttributeForm = Omit<RoleRepresentation, "attributes"> & {
    attributes?: KeyValueType[];
};

type AttributesFormProps = {
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
