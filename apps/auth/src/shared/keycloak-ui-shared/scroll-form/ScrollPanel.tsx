/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/scroll-form/ScrollPanel.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

/* eslint-disable react/jsx-no-useless-fragment */
// See: https://github.com/i18next/react-i18next/issues/1543
import { HTMLProps } from "react";
import { cn } from "@merge/ui/lib/utils";
import { FormTitle } from "./FormTitle";

type ScrollPanelProps = HTMLProps<HTMLFormElement> & {
    title: string;
    scrollId: string;
};

export const ScrollPanel = (props: ScrollPanelProps) => {
    const { title, children, scrollId, className, ...rest } = props;
    return (
        <section {...rest} className={cn("mt-8", className)}>
            <FormTitle id={scrollId} title={title} className="mb-4" />
            {children}
        </section>
    );
};
