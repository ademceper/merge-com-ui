/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/Root.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import {
    ErrorPage,
    useEnvironment,
    KeycloakContext
} from "../../shared/keycloak-ui-shared";
import { Suspense, useState } from "react";
import {
    createBrowserRouter,
    Outlet,
    RouteObject,
    RouterProvider
} from "react-router-dom";
import fetchContentJson from "../content/fetchContent";
import { Environment, environment } from "../environment";
import { usePromise } from "../utils/usePromise";
import { Header } from "./Header";
import { MenuItem, PageNav } from "./PageNav";
import { routes } from "../routes";
import { Separator } from "@merge/ui/components/separator";

function mapRoutes(
    context: KeycloakContext<Environment>,
    content: MenuItem[]
): RouteObject[] {
    return content
        .map(item => {
            if ("children" in item) {
                return mapRoutes(context, item.children);
            }

            // Do not add route disabled via feature flags
            if (item.isVisible && !context.environment.features[item.isVisible]) {
                return null;
            }

            return {
                ...item,
                element:
                    "path" in item
                        ? routes.find(r => r.path === (item.id ?? item.path))?.element
                        : undefined
            };
        })
        .filter(item => !!item)
        .flat();
}

export const Root = () => {
    const context = useEnvironment<Environment>();
    const [content, setContent] = useState<RouteObject[]>();

    usePromise(
        signal => fetchContentJson({ signal, context }),
        content => {
            setContent([
                {
                    path: decodeURIComponent(new URL(environment.baseUrl).pathname),
                    element: (
                        <div className="container mx-auto p-4 md:p-10 pb-16 max-w-7xl">
                            <div className="w-full lg:max-w-[58rem] mx-auto">
                                <Header />
                                <Separator className="mb-6" />
                                <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                                    <aside className="w-full lg:w-64 shrink-0">
                                        <PageNav />
                                    </aside>
                                    <div className="flex-1 w-full min-w-0 lg:max-w-2xl">
                                        <Suspense>
                                            <Outlet />
                                        </Suspense>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ),
                    errorElement: <ErrorPage />,
                    children: mapRoutes(context, content)
                }
            ]);
        }
    );

    if (!content) {
        return null;
    }
    return <RouterProvider router={createBrowserRouter(content)} />;
};
