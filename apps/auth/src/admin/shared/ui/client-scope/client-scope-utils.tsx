import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type { TFunction } from "@merge-rd/i18n";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import { SelectItem } from "@merge-rd/ui/components/select";
import { adminClient } from "../../../app/admin-client";
import { toUpperCase } from "../../lib/util";

export enum ClientScope {
    default = "default",
    optional = "optional"
}

export enum AllClientScopes {
    none = "none"
}

export type ClientScopeType = ClientScope;
export type AllClientScopeType = ClientScope | AllClientScopes;

const clientScopeTypes = Object.keys(ClientScope);
export const allClientScopeTypes = Object.keys({
    ...AllClientScopes,
    ...ClientScope
}) as AllClientScopeType[];

export const clientScopeTypesSelectOptions = (
    t: TFunction,
    scopeTypes: string[] | undefined = clientScopeTypes
) =>
    scopeTypes.map(type => (
        <SelectItem key={type} value={type}>
            {t(`clientScopeType.${type}`)}
        </SelectItem>
    ));

export const clientScopeTypesDropdown = (
    t: TFunction,
    onClick: (scope: ClientScopeType) => void
) =>
    clientScopeTypes.map(type => (
        <DropdownMenuItem key={type} onClick={() => onClick(type as ClientScopeType)}>
            {t(`clientScopeType.${type}`)}
        </DropdownMenuItem>
    ));

export type ClientScopeDefaultOptionalType = ClientScopeRepresentation & {
    type: AllClientScopeType;
};

export const changeScope = async (
    clientScope: ClientScopeDefaultOptionalType,
    changeTo: AllClientScopeType
) => {
    await removeScope(clientScope);
    await addScope(clientScope, changeTo);
};

const castAdminClient = () =>
    adminClient.clientScopes as unknown as {
        [index: string]: (params: { id: string }) => Promise<void>;
    };

export const removeScope = async (
    clientScope: ClientScopeDefaultOptionalType
) => {
    if (clientScope.type !== AllClientScopes.none)
        await castAdminClient()[
            `delDefault${
                clientScope.type === ClientScope.optional ? "Optional" : ""
            }ClientScope`
        ]({
            id: clientScope.id!
        });
};

const addScope = async (
    clientScope: ClientScopeDefaultOptionalType,
    type: AllClientScopeType
) => {
    if (type !== AllClientScopes.none)
        await castAdminClient()[
            `addDefault${type === ClientScope.optional ? "Optional" : ""}ClientScope`
        ]({
            id: clientScope.id!
        });
};

export const changeClientScope = async (
    clientId: string,
    clientScope: ClientScopeRepresentation,
    type: AllClientScopeType,
    changeTo: ClientScopeType
) => {
    if (type !== "none") {
        await removeClientScope(clientId, clientScope, type);
    }
    await addClientScope(clientId, clientScope, changeTo);
};

export const removeClientScope = async (
    clientId: string,
    clientScope: ClientScopeRepresentation,
    type: ClientScope
) => {
    const methodName = `del${toUpperCase(type)}ClientScope` as const;

    await adminClient.clients[methodName]({
        id: clientId,
        clientScopeId: clientScope.id!
    });
};

export const addClientScope = async (
    clientId: string,
    clientScope: ClientScopeRepresentation,
    type: ClientScopeType
) => {
    const methodName = `add${toUpperCase(type)}ClientScope` as const;

    await adminClient.clients[methodName]({
        id: clientId,
        clientScopeId: clientScope.id!
    });
};
