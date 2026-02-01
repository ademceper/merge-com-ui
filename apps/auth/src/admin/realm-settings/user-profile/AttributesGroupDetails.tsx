/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/AttributesGroupDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import AttributesGroupForm from "./AttributesGroupForm";
import { UserProfileProvider } from "./UserProfileContext";

const AttributesGroupDetails = () => (
    <UserProfileProvider>
        <AttributesGroupForm />
    </UserProfileProvider>
);

export default AttributesGroupDetails;
