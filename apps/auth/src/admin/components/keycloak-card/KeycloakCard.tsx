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

import { Button } from "@merge/ui/components/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@merge/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Label } from "@merge/ui/components/label";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { ReactElement, useState } from "react";
import { Link, To } from "react-router-dom";

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
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader
                className="flex-row items-center justify-between space-y-0"
                action={dropdownItems ? (
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`${title}-dropdown`}
                            >
                                <DotsThreeVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {dropdownItems}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : undefined}
            >
                <CardTitle data-testid="keycloak-card-title">
                    <Link to={to}>{title}</Link>
                </CardTitle>
            </CardHeader>
            <CardContent />
            <CardFooter className="flex items-center justify-between gap-2">
                <span className="keycloak--keycloak-card__footer">{footerText}</span>
                {labelText && (
                    <Label variant={labelColor === "blue" ? "default" : "secondary"}>
                        {labelText}
                    </Label>
                )}
            </CardFooter>
        </Card>
    );
};
