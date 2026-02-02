/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/keycloak-card/KeycloakCard.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Dropdown,
    DropdownList,
    Flex,
    FlexItem,
    Label,
    MenuToggle,
    MenuToggleElement
} from "../../../shared/@patternfly/react-core";
import { ReactElement, useState } from "react";
import { Link, To } from "react-router-dom";

import { EllipsisVIcon } from "../../../shared/@patternfly/react-icons";

export type KeycloakCardProps = {
    title: string;
    dropdownItems?: ReactElement[];
    labelText?: string;
    labelColor?: any;
    footerText?: string;
    to: To;
};

export const KeycloakCard = ({
    title,
    dropdownItems,
    labelText,
    labelColor,
    footerText,
    to
}: KeycloakCardProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const onDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <Card isSelectable isClickable>
            <CardHeader
                actions={{
                    actions: dropdownItems ? (
                        <Dropdown
                            popperProps={{
                                position: "right"
                            }}
                            onOpenChange={onDropdownToggle}
                            toggle={(ref: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                    ref={ref}
                                    onClick={onDropdownToggle}
                                    variant="plain"
                                    data-testid={`${title}-dropdown`}
                                >
                                    <EllipsisVIcon />
                                </MenuToggle>
                            )}
                            isOpen={isDropdownOpen}
                        >
                            <DropdownList>{dropdownItems}</DropdownList>
                        </Dropdown>
                    ) : undefined,
                    hasNoOffset: false,
                    className: undefined
                }}
            >
                <CardTitle data-testid="keycloak-card-title">
                    <Link to={to}>{title}</Link>
                </CardTitle>
            </CardHeader>
            <CardBody />
            <CardFooter>
                <Flex>
                    <FlexItem className="keycloak--keycloak-card__footer">
                        {footerText && footerText}
                    </FlexItem>
                    <FlexItem>
                        {labelText && (
                            <Label color={labelColor || "gray"}>{labelText}</Label>
                        )}
                    </FlexItem>
                </Flex>
            </CardFooter>
        </Card>
    );
};
