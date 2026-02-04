/**
 * This file has been claimed for ownership from @keycloakify/keycloak-ui-shared version 260502.0.0.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/masthead/Masthead.tsx" --revert
 */

import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import { Avatar, AvatarImage } from "@merge/ui/components/avatar";
import type { ComponentProps } from "react";
import { List } from "@phosphor-icons/react";
import { TFunction } from "i18next";
import type { Keycloak, KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DefaultAvatar } from "./DefaultAvatar";
import type { DefaultAvatarProps } from "./DefaultAvatar";
import { KeycloakDropdown } from "./KeycloakDropdown";

function loggedInUserName(token: KeycloakTokenParsed | undefined, t: TFunction) {
    if (!token) {
        return t("unknownUser");
    }

    const givenName = token.given_name;
    const familyName = token.family_name;
    const preferredUsername = token.preferred_username;

    if (givenName && familyName) {
        return t("fullName", { givenName, familyName });
    }

    return givenName || familyName || preferredUsername || t("unknownUser");
}

type BrandLogo = { src?: string; alt?: string; className?: string; [k: string]: unknown };

type KeycloakMastheadProps = {
    keycloak: Keycloak;
    brand: BrandLogo;
    avatar?: Omit<ComponentProps<typeof Avatar>, "children"> & { src?: string };
    features?: {
        hasLogout?: boolean;
        hasManageAccount?: boolean;
        hasUsername?: boolean;
    };
    kebabDropdownItems?: ReactNode[];
    dropdownItems?: ReactNode[];
    toolbarItems?: ReactNode[];
    toolbar?: ReactNode;
};

const KeycloakMasthead = ({
    keycloak,
    brand: { src, alt, className, ...brandProps },
    avatar,
    features: { hasLogout = true, hasManageAccount = true, hasUsername = true } = {},
    kebabDropdownItems,
    dropdownItems = [],
    toolbarItems,
    toolbar,
    ...rest
}: KeycloakMastheadProps) => {
    const { t } = useTranslation();
    const extraItems: ReactNode[] = [];
    if (hasManageAccount && typeof keycloak.accountManagement === "function") {
        extraItems.push(
            <DropdownMenuItem key="manageAccount" onClick={() => keycloak.accountManagement!()}>
                {t("manageAccount")}
            </DropdownMenuItem>
        );
    }
    if (hasLogout) {
        extraItems.push(
            <DropdownMenuItem key="signOut" onClick={() => keycloak.logout()}>
                {t("signOut")}
            </DropdownMenuItem>
        );
    }

    const picture = keycloak.idTokenParsed?.picture as string | undefined;
    return (
        <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4" {...rest}>
            <Button variant="ghost" size="icon" aria-label={t("navigation")}>
                <List size={20} />
            </Button>
            <div {...brandProps} className="flex shrink-0 items-center">
                <img src={src} alt={alt} className={className} />
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
                {toolbar}
                {toolbarItems?.map((item, index) => <div key={index}>{item}</div>)}
                <div className="hidden md:block">
                    <KeycloakDropdown
                        data-testid="options"
                        dropDownItems={[...dropdownItems, ...extraItems]}
                        title={
                            hasUsername
                                ? loggedInUserName(keycloak.idTokenParsed, t)
                                : undefined
                        }
                    />
                </div>
                <div className="md:hidden">
                    <KeycloakDropdown
                        data-testid="options-kebab"
                        isKebab
                        dropDownItems={[...(kebabDropdownItems || dropdownItems), ...extraItems]}
                    />
                </div>
                <div className="flex items-center">
                    {picture || avatar?.src ? (
                        <Avatar {...(avatar ? { className: avatar.className, size: avatar.size } : {})}>
                            <AvatarImage src={picture || avatar?.src} alt={t("avatar")} />
                        </Avatar>
                    ) : (
                        <DefaultAvatar {...(avatar as DefaultAvatarProps)} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default KeycloakMasthead;
