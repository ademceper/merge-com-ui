import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@merge-rd/ui/components/breadcrumb";
import React, { useMemo } from "react";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useLocation } from "@tanstack/react-router";

import { useRealm } from "../../../app/providers/realm-context/realm-context";

interface CrumbEntry {
    label: string;
    pathname: string;
}

function useCrumbs(): CrumbEntry[] {
    const { t: _t } = useTranslation();
    const { realm } = useRealm();
    const location = useLocation();

    return useMemo(() => {
        const crumbs: CrumbEntry[] = [];
        const segments = location.pathname.split("/").filter(Boolean);
        const realmIdx = segments.indexOf(realm);
        const meaningful = segments.slice(realmIdx + 1);
        let path = "/" + segments.slice(0, realmIdx + 1).join("/");
        for (const seg of meaningful) {
            path = `${path}/${seg}`;
            const label = seg
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            crumbs.push({ label, pathname: path });
        }
        return crumbs;
    }, [location.pathname, realm]);
}

export function usePageTitle() {
    const crumbs = useCrumbs();
    if (crumbs.length === 0) return null;
    return crumbs[crumbs.length - 1].label;
}

export const PageBreadCrumbs = () => {
    const crumbs = useCrumbs();
    if (crumbs.length === 0) return null;
    if (crumbs.length === 1) {
        return (
            <h1 className="text-base">{crumbs[0].label}</h1>
        );
    }
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        <BreadcrumbItem>
                            {crumbs.length - 1 !== i ? (
                                <BreadcrumbLink asChild>
                                    <Link to={crumb.pathname as string}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {i < crumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
