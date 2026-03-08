import {
    UnmanagedAttributePolicy,
    type UserProfileConfig
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { type UseFormReturn, useFormContext } from "react-hook-form";
import {
    type AttributeForm,
    AttributesForm
} from "../../shared/ui/key-value-form/attribute-form";
import { toUserFormFields, type UserFormFields } from "./form-state";

type UserAttributesProps = {
    user: UserRepresentation;
    save: (user: UserFormFields) => void;
    upConfig?: UserProfileConfig;
};

export const UserAttributes = ({ user, save, upConfig }: UserAttributesProps) => {
    const form = useFormContext<UserFormFields>();

    return (
        <div className="bg-muted/30 p-4">
            <AttributesForm
                form={form as UseFormReturn<AttributeForm>}
                save={save}
                fineGrainedAccess={user.access?.manage}
                reset={() =>
                    form.reset({
                        ...form.getValues(),
                        attributes: toUserFormFields(user).attributes
                    })
                }
                name="unmanagedAttributes"
                isDisabled={
                    UnmanagedAttributePolicy.AdminView ===
                    upConfig?.unmanagedAttributePolicy
                }
            />
        </div>
    );
};
