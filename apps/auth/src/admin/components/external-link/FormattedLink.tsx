/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/external-link/FormattedLink.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ArrowSquareOut } from "@phosphor-icons/react";
import { AnchorHTMLAttributes } from "react";

export type FormattedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    isInline?: boolean;
};

export const FormattedLink = ({ title, href, isInline, ...rest }: FormattedLinkProps) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            style={{
                textDecoration: "underline",
                textDecorationColor: "transparent"
            }}
            className={isInline ? "pf-m-link pf-m-inline" : ""}
            {...rest}
        >
            {title ? title : href} {href?.startsWith("http") && <ArrowSquareOut className="size-4 inline" />}
        </a>
    );
};
