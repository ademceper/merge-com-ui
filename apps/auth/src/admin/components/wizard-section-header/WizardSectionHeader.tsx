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
            <h2
                className={
                    showDescription
                        ? "kc-wizard-section-header__title--has-description text-2xl font-semibold"
                        : "kc-wizard-section-header__title text-2xl font-semibold"
                }
            >
                {title}
            </h2>
            {showDescription && (
                <p className="kc-wizard-section-header__description text-muted-foreground mt-1">
                    {description}
                </p>
            )}
        </>
    );
};
