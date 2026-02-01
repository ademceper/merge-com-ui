/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/UserAttributes.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { PageSection, PageSectionVariants } from "../../shared/@patternfly/react-core";
import { UseFormReturn, useFormContext } from "react-hook-form";

import {
    AttributeForm,
    AttributesForm
} from "../components/key-value-form/AttributeForm";
import { UserFormFields, toUserFormFields } from "./form-state";
import {
    UnmanagedAttributePolicy,
    UserProfileConfig
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";

type UserAttributesProps = {
    user: UserRepresentation;
    save: (user: UserFormFields) => void;
    upConfig?: UserProfileConfig;
};

export const UserAttributes = ({ user, save, upConfig }: UserAttributesProps) => {
    const form = useFormContext<UserFormFields>();

    return (
        <PageSection variant={PageSectionVariants.light}>
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
                    UnmanagedAttributePolicy.AdminView ==
                    upConfig?.unmanagedAttributePolicy
                }
            />
        </PageSection>
    );
};
