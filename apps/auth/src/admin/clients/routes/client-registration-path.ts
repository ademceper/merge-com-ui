/**
 * Client registration route path helpers and types.
 * Split from ClientRegistration.tsx so that registration/ClientRegistration.tsx
 * (used inside ClientsSection) does not import the module that lazy-loads ClientsSection.
 */

import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";

export type ClientRegistrationTab = "anonymous" | "authenticated";

export type ClientRegistrationParams = {
    realm: string;
    subTab: ClientRegistrationTab;
};

export const CLIENT_REGISTRATION_PATH =
    "/:realm/clients/client-registration/:subTab";

export const toClientRegistration = (
    params: ClientRegistrationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(CLIENT_REGISTRATION_PATH, params)
});
