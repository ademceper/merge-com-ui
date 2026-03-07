/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/api/parse-links.ts"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

export type Links = {
    prev?: Record<string, string>;
    next?: Record<string, string>;
};

export function parseLinks(response: Response): Links {
    const linkHeader = response.headers.get("link");

    if (!linkHeader) {
        return {};
    }

    const links = linkHeader.split(/,\s*</);
    return links.reduce<Links>((acc: Links, link: string) => {
        const matcher = /<?([^>]*)>(.*)/.exec(link);
        if (!matcher) return {};
        const linkUrl = matcher[1];
        const rel = /\s*(.+)\s*=\s*"?([^"]+)"?/.exec(matcher[2]);
        if (rel) {
            const link: Record<string, string> = {};
            for (const [key, value] of new URL(linkUrl).searchParams.entries()) {
                link[key] = value;
            }
            acc[rel[2] as keyof Links] = link;
        }
        return acc;
    }, {});
}
