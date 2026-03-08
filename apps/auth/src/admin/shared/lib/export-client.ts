import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { saveAs } from "file-saver";
import { cloneDeep } from "lodash-es";
import { prettyPrintJSON } from "./strings";

export const exportClient = (client: ClientRepresentation): void => {
    const clientCopy = cloneDeep(client);
    delete clientCopy.id;

    if (clientCopy.protocolMappers) {
        for (let i = 0; i < clientCopy.protocolMappers.length; i++) {
            delete clientCopy.protocolMappers[i].id;
        }
    }

    saveAs(
        new Blob([prettyPrintJSON(clientCopy)], {
            type: "application/json"
        }),
        `${clientCopy.clientId}.json`
    );
};
