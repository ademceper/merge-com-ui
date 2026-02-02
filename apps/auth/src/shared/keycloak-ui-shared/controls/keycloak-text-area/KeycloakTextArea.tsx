/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/keycloak-text-area/KeycloakTextArea.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Textarea } from "@merge/ui/components/textarea";
import { type ComponentProps, forwardRef } from "react";

export type KeycloakTextAreaProps = ComponentProps<typeof Textarea>;

export const KeycloakTextArea = forwardRef<HTMLTextAreaElement, KeycloakTextAreaProps>(
    (props, ref) => <Textarea ref={ref} {...props} />
);
KeycloakTextArea.displayName = "KeycloakTextArea";
