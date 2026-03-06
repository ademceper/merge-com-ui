/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/resources/SharedWith.tsx"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Trans } from "react-i18next";

import { Permission } from "../api/representations";

type SharedWithProps = {
    permissions?: Permission[];
};

export const SharedWith = ({ permissions: p = [] }: SharedWithProps) => (
    <div data-testid={`shared-with-${p.length ? p.map(e => e.username) : "none"}`}>
        <Trans i18nKey="resourceSharedWith" count={p.length}>
            <strong>
                {{
                    username: p[0] ? p[0].username : undefined
                }}
            </strong>
            <strong>
                {{
                    other: p.length - 1
                }}
            </strong>
        </Trans>
    </div>
);
