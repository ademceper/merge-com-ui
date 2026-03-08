import { fetchWithError } from "@keycloak/keycloak-admin-client";
import { adminClient } from "../../admin-client";
import { getAuthorizationHeaders } from "../../../shared/lib/get-authorization-headers";
import { joinPath } from "../../../shared/lib/join-path";
import type { UiRealmInfo } from "./ui-realm-info";

export async function fetchAdminUI<T>(
    endpoint: string,
    query?: Record<string, string>
): Promise<T> {
    const accessToken = await adminClient.getAccessToken();
    const baseUrl = adminClient.baseUrl;

    const response = await fetchWithError(
        joinPath(
            baseUrl,
            "admin/realms",
            encodeURIComponent(adminClient.realmName),
            endpoint
        ) + (query ? `?${new URLSearchParams(query)}` : ""),
        {
            method: "GET",
            headers: getAuthorizationHeaders(accessToken)
        }
    );

    return await response.json();
}

async function fetchRealmInfo(): Promise<UiRealmInfo> {
    return fetchAdminUI(`ui-ext/info`);
}
