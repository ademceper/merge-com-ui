/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/api/request.ts"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { Keycloak } from "oidc-spa/keycloak-js";
import type {
    BaseEnvironment,
    KeycloakContext
} from "../../../shared/keycloak-ui-shared";

import { joinPath } from "../lib/joinPath";
import { CONTENT_TYPE_HEADER, CONTENT_TYPE_JSON } from "./constants";

type RequestOptions = {
    signal?: AbortSignal;
    getAccessToken?: () => Promise<string | undefined>;
    method?: "POST" | "PUT" | "DELETE";
    searchParams?: Record<string, string>;
    body?: unknown;
};

async function _request(
    url: URL,
    { signal, getAccessToken, method, searchParams, body }: RequestOptions = {}
): Promise<Response> {
    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) =>
            url.searchParams.set(key, value)
        );
    }

    return fetch(url, {
        signal,
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
            authorization: `Bearer ${await getAccessToken?.()}`
        }
    });
}

export async function request(
    path: string,
    { environment, keycloak }: KeycloakContext<BaseEnvironment>,
    opts: RequestOptions = {},
    fullUrl?: URL
) {
    if (typeof fullUrl === "undefined") {
        fullUrl = url(environment, path);
    }
    return _request(fullUrl, {
        ...opts,
        getAccessToken: token(keycloak)
    });
}

const url = (environment: BaseEnvironment, path: string) =>
    new URL(
        joinPath(environment.serverBaseUrl, "realms", environment.realm, "account", path)
    );

const token = (keycloak: Keycloak) =>
    async function getAccessToken() {
        try {
            await keycloak.updateToken(5);
        } catch {
            await keycloak.login();
        }

        return keycloak.token;
    };
