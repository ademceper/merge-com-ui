/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/Root.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { environment } from "../app/environment";

const router = createRouter({
    routeTree,
    basepath: decodeURIComponent(new URL(environment.baseUrl).pathname),
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export const Root = () => {
    return <RouterProvider router={router} />;
};
