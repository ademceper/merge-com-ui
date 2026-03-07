import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import { ClientRegistrationTab } from "./client-registration-path";

export type RegistrationProviderParams = {
    realm: string;
    subTab: ClientRegistrationTab;
    id?: string;
    providerId: string;
};

export const toRegistrationProvider = (
    params: RegistrationProviderParams
): string => {
    const path = params.id
        ? "/:realm/clients/client-registration/:subTab/:providerId/:id"
        : "/:realm/clients/client-registration/:subTab/:providerId";
    return generateEncodedPath(path, params as any);
};
