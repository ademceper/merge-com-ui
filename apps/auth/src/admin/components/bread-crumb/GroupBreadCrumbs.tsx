import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@merge/ui/components/breadcrumb";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useSubGroups } from "../../groups/SubGroupsContext";
import { useRealm } from "../../context/realm-context/RealmContext";

/** Header'da kullanılmak üzere merge UI Breadcrumb bileşenleriyle aynı grup yolunu gösterir. */
export function GroupBreadCrumbsForHeader() {
    const { t } = useTranslation();
    const { remove, subGroups } = useSubGroups();
    const { realm } = useRealm();
    const location = useLocation();

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    {subGroups.length === 0 ? (
                        <BreadcrumbPage>{t("groups")}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link to={`/${realm}/groups`}>{t("groups")}</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {subGroups.length > 0 && subGroups.map((group, i) => {
                    const isLastGroup = i === subGroups.length - 1;
                    const to = location.pathname.substring(
                        0,
                        location.pathname.indexOf(group.id!) + group.id!.length
                    );
                    return (
                        <React.Fragment key={group.id}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {!isLastGroup ? (
                                    <BreadcrumbLink asChild>
                                        <Link to={to} onClick={() => remove(group)}>
                                            {group.name}
                                        </Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>
                                        {group.id === "search" ? group.name : t("groupDetails")}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export const GroupBreadCrumbs = () => {
    const { t } = useTranslation();
    const { clear, remove, subGroups } = useSubGroups();
    const { realm } = useRealm();
    const location = useLocation();

    useEffect(() => {
        const { pathname } = location;

        if (!pathname.includes("/groups") || pathname.endsWith("/groups")) {
            clear();
        }
    }, [location.pathname, clear]);

    return subGroups.length !== 0 ? (
        <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
            <span key="home">
                <Link to={`/${realm}/groups`}>{t("groups")}</Link>
                <span className="mx-1">/</span>
            </span>
            {subGroups.map((group, i) => {
                const isLastGroup = i === subGroups.length - 1;
                return (
                    <span key={group.id}>
                        {!isLastGroup && (
                            <>
                                <Link
                                    to={location.pathname.substring(
                                        0,
                                        location.pathname.indexOf(group.id!) +
                                            group.id!.length
                                    )}
                                    onClick={() => remove(group)}
                                >
                                    {group.name}
                                </Link>
                                <span className="mx-1">/</span>
                            </>
                        )}
                        {isLastGroup && (
                            <span className="font-medium">
                                {group.id === "search" ? group.name : t("groupDetails")}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    ) : null;
};
