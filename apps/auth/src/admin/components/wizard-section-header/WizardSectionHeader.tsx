/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/wizard-section-header/WizardSectionHeader.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Text, TextContent, Title } from "../../../shared/@patternfly/react-core";

import "./wizard-section-header.css";

export type WizardSectionHeaderProps = {
    title: string;
    description?: string;
    showDescription?: boolean;
};

export const WizardSectionHeader = ({
    title,
    description,
    showDescription = false
}: WizardSectionHeaderProps) => {
    return (
        <>
            <Title
                size={"xl"}
                headingLevel={"h2"}
                className={
                    showDescription
                        ? "kc-wizard-section-header__title--has-description"
                        : "kc-wizard-section-header__title"
                }
            >
                {title}
            </Title>
            {showDescription && (
                <TextContent className="kc-wizard-section-header__description">
                    <Text>{description}</Text>
                </TextContent>
            )}
        </>
    );
};
