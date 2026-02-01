import React from "react";
import { uniqBy } from "lodash-es";
import { isValidElement } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useBreadcrumbs, {
    type BreadcrumbData,
    type BreadcrumbsRoute
} from "use-react-router-breadcrumbs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useRealm } from "../context/realm-context/RealmContext";
import { routes, type AppRouteObject } from "../routes";

export function AdminBreadcrumbs() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const elementText = (crumb: BreadcrumbData) =>
        isValidElement(crumb.breadcrumb) && crumb.breadcrumb.props.children;

    const routesWithCrumbs: BreadcrumbsRoute[] = routes.map((route: AppRouteObject) => ({
        ...route,
        breadcrumb: route.breadcrumb?.(t)
    }));

    const crumbs = uniqBy(
        useBreadcrumbs(routesWithCrumbs, {
            disableDefaults: true,
            excludePaths: ["/", `/${realm}`, `/${realm}/page-section`]
        }),
        elementText
    );

    if (crumbs.length <= 1) return null;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map(({ match, breadcrumb: crumb }, i) => (
                    <React.Fragment key={match.pathname}>
                        {i > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {crumbs.length - 1 !== i ? (
                                <BreadcrumbLink asChild>
                                    <Link to={match.pathname}>{crumb}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{crumb}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
