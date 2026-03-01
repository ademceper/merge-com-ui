/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/Header.tsx" --revert
 */

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { Link } from "@merge/ui/components/link";
import { useThemeToggle } from "@merge/ui/components/theme-toggle";
import type { Environment } from "../environment";

const baseUrl = import.meta.env.BASE_URL;

export const Header = () => {
    const { keycloak } = useEnvironment<Environment>();
    const { t } = useTranslation();
    const { isDark } = useThemeToggle();
    const logoUrl = isDark ? `${baseUrl}merge-white-text.svg` : `${baseUrl}merge-black-text.svg`;

    return (
        <header className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] lg:gap-x-12 items-center mb-6 gap-y-4">
            <div className="flex items-center justify-center lg:justify-start">
                <img key={logoUrl} src={logoUrl} alt="Merge" className="h-11 w-auto max-w-[13rem] object-contain" />
            </div>
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight">{t("accountManagement")}</h2>
                    <p className="text-muted-foreground">{t("accountSecurityDescription")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        href={keycloak.logoutUrl}
                        className="text-foreground hover:text-destructive text-sm font-medium"
                    >
                        {t("doSignOut")}
                    </Link>
                </div>
            </div>
        </header>
    );
};
