/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/scopes/GeneratedCodeTab.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import {
    CodeBlock,
    CodeBlockAction,
    EmptyState,
    EmptyStateBody,
    EmptyStateHeader,
    TextArea
} from "../../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { CopyToClipboardButton } from "../../components/copy-to-clipboard-button/CopyToClipboardButton";

type GeneratedCodeTabProps = {
    user?: UserRepresentation;
    text: string;
    label: string;
};

export const GeneratedCodeTab = ({ text, user, label }: GeneratedCodeTabProps) => {
    const { t } = useTranslation();

    return user ? (
        <CodeBlock
            id={label}
            actions={
                <CodeBlockAction>
                    <CopyToClipboardButton id="code" text={text} label={label} />
                </CodeBlockAction>
            }
        >
            <TextArea
                id={`text-area-${label}`}
                rows={20}
                value={text}
                aria-label={label}
            />
        </CodeBlock>
    ) : (
        <EmptyState variant="lg" id={label}>
            <EmptyStateHeader titleText={<>{t(`${label}No`)}</>} headingLevel="h2" />
            <EmptyStateBody>{t(`${label}IsDisabled`)}</EmptyStateBody>
        </EmptyState>
    );
};
