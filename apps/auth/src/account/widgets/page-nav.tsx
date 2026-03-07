/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/PageNav.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import {
    PropsWithChildren,
    Suspense,
    useMemo,
    useState
} from "react";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useLocation } from "@tanstack/react-router";

import fetchContentJson from "../shared/lib/fetchContent";
import { environment, type Environment, type Feature } from "../app/environment";
import type { MenuItem } from "../shared/lib/menu-item";
import { usePromise } from "../shared/lib/usePromise";
import { buttonVariants } from "@merge-rd/ui/components/button";
import { cn } from "@merge-rd/ui/lib/utils";

;

export const PageNav = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>();
    const context = useEnvironment<Environment>();

    usePromise(signal => fetchContentJson({ signal, context }), setMenuItems);

    return (
        <nav className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 lg:flex-col lg:overflow-visible">
            <Suspense>
                {menuItems
                    ?.filter(menuItem =>
                        menuItem.isVisible
                            ? context.environment.features[menuItem.isVisible]
                            : true
                    )
                    .map(menuItem => (
                        <NavMenuItem
                            key={menuItem.label as string}
                            menuItem={menuItem}
                        />
                    ))}
            </Suspense>
        </nav>
    );
};

type NavMenuItemProps = {
    menuItem: MenuItem;
};

function NavMenuItem({ menuItem }: NavMenuItemProps) {
    const { t } = useTranslation();
    const {
        environment: { features }
    } = useEnvironment<Environment>();
    const location = useLocation();
    const isActive = useMemo(
        () => matchMenuItem(location.pathname, menuItem),
        [location.pathname, menuItem]
    );

    if ("path" in menuItem) {
        return (
            <NavLink path={menuItem.path} isActive={isActive}>
                {t(menuItem.label)}
            </NavLink>
        );
    }

    return (
        <>
            <span className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(menuItem.label)}
            </span>
            {menuItem.children
                .filter(menuItem =>
                    menuItem.isVisible ? features[menuItem.isVisible] : true
                )
                .map(child => (
                    <NavMenuItem key={child.label as string} menuItem={child} />
                ))}
        </>
    );
}

function getFullUrl(path: string) {
    return `${new URL(environment.baseUrl).pathname}${path}`;
}

function matchMenuItem(currentPath: string, menuItem: MenuItem): boolean {
    if ("path" in menuItem) {
        const fullUrl = getFullUrl(menuItem.path);
        return currentPath === fullUrl || currentPath === fullUrl + "/";
    }

    return menuItem.children.some(child => matchMenuItem(currentPath, child));
}

type NavLinkProps = {
    path: string;
    isActive: boolean;
};

const NavLink = ({
    path,
    isActive,
    children
}: PropsWithChildren<NavLinkProps>) => {
    const linkPath = ("/" + path) as string;

    return (
        <Link
            data-testid={path}
            to={linkPath}
            className={cn(
                buttonVariants({ variant: "ghost" }),
                "min-h-10 justify-start whitespace-nowrap lg:whitespace-normal",
                isActive
                    ? "bg-muted hover:bg-muted hover:text-foreground"
                    : "hover:bg-muted/60 hover:text-foreground"
            )}
        >
            {children}
        </Link>
    );
};
