/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/Root.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useMemo } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { environment } from "../app/environment";

function getBasepath() {
    try {
        return decodeURIComponent(new URL(environment.baseUrl).pathname);
    } catch {
        return decodeURIComponent(environment.baseUrl);
    }
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}

export const Root = () => {
    const router = useMemo(
        () => createRouter({ routeTree, basepath: getBasepath() }),
        [],
    );

    return <RouterProvider router={router} />;
};
