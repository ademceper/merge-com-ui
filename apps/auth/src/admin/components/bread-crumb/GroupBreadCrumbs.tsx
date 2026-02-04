import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Breadcrumb replaced with HTML nav + tailwind

import { useSubGroups } from "../../groups/SubGroupsContext";
import { useRealm } from "../../context/realm-context/RealmContext";

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
    }, [location]);

    return subGroups.length !== 0 ? (
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm">
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
