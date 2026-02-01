/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user/utils/user-profile.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { UserProfileAttributeMetadata } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";

export function isRequiredAttribute({
    required,
    validators
}: UserProfileAttributeMetadata): boolean {
    // Check if required is true or if the validators include a validation that would make the attribute implicitly required.
    return required || hasRequiredValidators(validators);
}

/**
 * Checks whether the given validators include a validation that would make the attribute implicitly required.
 */
function hasRequiredValidators(
    validators?: UserProfileAttributeMetadata["validators"]
): boolean {
    // If we don't have any validators, the attribute is not required.
    if (!validators) {
        return false;
    }

    // If the 'length' validator is defined and has a minimal length greater than zero the attribute is implicitly required.
    // We have to do a lot of defensive coding here, because we don't have type information for the validators.
    if (
        "length" in validators &&
        "min" in validators.length &&
        typeof validators.length.min === "number"
    ) {
        return validators.length.min > 0;
    }

    return false;
}
