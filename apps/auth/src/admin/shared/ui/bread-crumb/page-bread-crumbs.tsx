import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@merge-rd/ui/components/breadcrumb";
import { uniqBy } from "lodash-es";
import React, { isValidElement } from "react";
import { useTranslation } from "@merge-rd/i18n";
import { Link } from "@tanstack/react-router";
import useBreadcrumbs, {
    BreadcrumbData,
    BreadcrumbsRoute
} from "use-react-router-breadcrumbs";

import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { routes } from "../../../app/routes";

function useCrumbs() {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const elementText = (crumb: BreadcrumbData) =>
        isValidElement(crumb.breadcrumb) && (crumb.breadcrumb as React.ReactElement<{ children?: unknown }>).props?.children;

    const routesWithCrumbs: BreadcrumbsRoute[] = routes.map((route) => ({
        ...route,
        breadcrumb: route.breadcrumb?.(t)
    }));

    return uniqBy(
        useBreadcrumbs(routesWithCrumbs, {
            disableDefaults: true,
            excludePaths: ["/", `/${realm}`, `/${realm}/page-section`]
        }),
        elementText
    );
}

export function usePageTitle() {
    const crumbs = useCrumbs();
    if (crumbs.length === 0) return null;
    return crumbs[crumbs.length - 1].breadcrumb;
}

export const PageBreadCrumbs = () => {
    const crumbs = useCrumbs();
    if (crumbs.length === 0) return null;
    if (crumbs.length === 1) {
        return (
            <h1 className="text-base">{crumbs[0].breadcrumb}</h1>
        );
    }
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map(({ match, breadcrumb: crumb }, i) => (
                    <React.Fragment key={i}>
                        <BreadcrumbItem>
                            {crumbs.length - 1 !== i ? (
                                <BreadcrumbLink asChild>
                                    <Link to={match.pathname as string}>{crumb}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{crumb}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {i < crumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
