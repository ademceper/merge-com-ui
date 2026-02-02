/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/keycloak-card/ClickableCard.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import React, { KeyboardEvent, useId } from "react";
import { Card, CardHeader } from "@merge/ui/components/card";

type ClickableCardProps = React.HTMLAttributes<HTMLDivElement> & {
    onClick: () => void;
};

export const ClickableCard = ({ onClick, children, ...rest }: ClickableCardProps) => {
    const id = useId();
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") {
            onClick();
        }
    };
    return (
        <Card id={id} className="cursor-pointer" onKeyDown={onKeyDown} onClick={onClick} {...rest}>
            <CardHeader>
                {children}
            </CardHeader>
        </Card>
    );
};
