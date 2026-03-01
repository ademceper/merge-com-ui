/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/components/page/Page.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { PropsWithChildren } from "react";
import { Separator } from "@merge/ui/components/separator";

type PageProps = {
    title: string;
    description: string;
};

export const Page = ({ title, description, children }: PropsWithChildren<PageProps>) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium" data-testid="page-heading">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Separator />
            {children}
        </div>
    );
};
