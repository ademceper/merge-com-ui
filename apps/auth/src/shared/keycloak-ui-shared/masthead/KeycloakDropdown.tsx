/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/masthead/KeycloakDropdown.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    Dropdown,
    DropdownList,
    DropdownProps,
    MenuToggle
} from "../../@patternfly/react-core";
import { EllipsisVIcon } from "../../@patternfly/react-icons";
import { ReactNode, useState } from "react";

type KeycloakDropdownProps = Omit<DropdownProps, "toggle"> & {
    "data-testid"?: string;
    isKebab?: boolean;
    title?: ReactNode;
    dropDownItems: ReactNode[];
};

export const KeycloakDropdown = ({
    isKebab = false,
    title,
    dropDownItems,
    ...rest
}: KeycloakDropdownProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Dropdown
            {...rest}
            popperProps={{
                position: "right"
            }}
            onOpenChange={isOpen => setOpen(isOpen)}
            toggle={ref => (
                <MenuToggle
                    data-testid={`${rest["data-testid"]}-toggle`}
                    ref={ref}
                    onClick={() => setOpen(!open)}
                    isExpanded={open}
                    variant={isKebab ? "plain" : "default"}
                >
                    {isKebab ? <EllipsisVIcon /> : title}
                </MenuToggle>
            )}
            isOpen={open}
        >
            <DropdownList>{dropDownItems}</DropdownList>
        </Dropdown>
    );
};
