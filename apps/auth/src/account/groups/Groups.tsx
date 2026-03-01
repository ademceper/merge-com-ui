/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/groups/Groups.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { getGroups } from "../api/methods";
import { Group } from "../api/representations";
import { Page } from "../components/page/Page";
import { usePromise } from "../utils/usePromise";
import { Check } from "@phosphor-icons/react";

export const Groups = () => {
    const { t } = useTranslation();
    const context = useEnvironment();

    const [groups, setGroups] = useState<Group[]>([]);
    const [directMembership, setDirectMembership] = useState(false);

    usePromise(
        signal => getGroups({ signal, context }),
        groups => {
            if (!directMembership) {
                groups.forEach(el =>
                    getParents(
                        el,
                        groups,
                        groups.map(({ path }) => path)
                    )
                );
            }
            setGroups(groups);
        },
        [directMembership]
    );

    const getParents = (el: Group, groups: Group[], groupsPaths: string[]) => {
        const parentPath = el.path.slice(0, el.path.lastIndexOf("/"));
        if (parentPath && !groupsPaths.includes(parentPath)) {
            el = {
                name: parentPath.slice(parentPath.lastIndexOf("/") + 1),
                path: parentPath
            };
            groups.push(el);
            groupsPaths.push(parentPath);

            getParents(el, groups, groupsPaths);
        }
    };

    return (
        <Page title={t("groups")} description={t("groupDescriptionLabel")}>
            <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        id="directMembership-checkbox"
                        data-testid="directMembership-checkbox"
                        checked={directMembership}
                        onChange={e => setDirectMembership(e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                    />
                    {t("directMembership")}
                </label>

                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-medium">{t("name")}</th>
                                <th className="text-left p-3 font-medium">{t("path")}</th>
                                <th className="text-left p-3 font-medium">{t("directMembership")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group, appIndex) => (
                                <tr
                                    key={"group-" + appIndex}
                                    id={`${appIndex}-group`}
                                    className="border-b last:border-b-0"
                                >
                                    <td
                                        className="p-3"
                                        data-testid={`group[${appIndex}].name`}
                                    >
                                        {group.name}
                                    </td>
                                    <td
                                        className="p-3 text-muted-foreground"
                                        id={`${appIndex}-group-path`}
                                    >
                                        {group.path}
                                    </td>
                                    <td
                                        className="p-3"
                                        id={`${appIndex}-group-directMembership`}
                                    >
                                        {group.id != null && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Page>
    );
};

export default Groups;
