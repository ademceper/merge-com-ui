/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/LinkedAccounts.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLinkedAccounts, LinkedAccountQueryParams } from "../api/methods";
import { LinkedAccountRepresentation } from "../api/representations";
import { EmptyRow } from "../components/datalist/EmptyRow";
import { Page } from "../components/page/Page";
import { usePromise } from "../utils/usePromise";
import { AccountRow } from "./AccountRow";
import { LinkedAccountsToolbar } from "./LinkedAccountsToolbar";

export const LinkedAccounts = () => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccountRepresentation[]>(
        []
    );
    const [unlinkedAccounts, setUninkedAccounts] = useState<
        LinkedAccountRepresentation[]
    >([]);

    const [paramsUnlinked, setParamsUnlinked] = useState<LinkedAccountQueryParams>({
        first: 0,
        max: 6,
        linked: false
    });
    const [paramsLinked, setParamsLinked] = useState<LinkedAccountQueryParams>({
        first: 0,
        max: 6,
        linked: true
    });
    const [key, setKey] = useState(1);
    const refresh = () => setKey(key + 1);

    usePromise(
        signal => getLinkedAccounts({ signal, context }, paramsUnlinked),
        setUninkedAccounts,
        [paramsUnlinked, key]
    );

    usePromise(
        signal => getLinkedAccounts({ signal, context }, paramsLinked),
        setLinkedAccounts,
        [paramsLinked, key]
    );

    return (
        <Page title={t("linkedAccounts")} description={t("linkedAccountsIntroMessage")}>
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {t("linkedLoginProviders")}
                    </h2>
                    <LinkedAccountsToolbar
                        onFilter={search =>
                            setParamsLinked({ ...paramsLinked, first: 0, search })
                        }
                        count={linkedAccounts.length}
                        first={paramsLinked["first"]}
                        max={paramsLinked["max"]}
                        onNextClick={() => {
                            setParamsLinked({
                                ...paramsLinked,
                                first: paramsLinked.first + paramsLinked.max - 1
                            });
                        }}
                        onPreviousClick={() =>
                            setParamsLinked({
                                ...paramsLinked,
                                first: paramsLinked.first - paramsLinked.max + 1
                            })
                        }
                        onPerPageSelect={(first, max) =>
                            setParamsLinked({
                                ...paramsLinked,
                                first,
                                max
                            })
                        }
                        hasNext={linkedAccounts.length > paramsLinked.max - 1}
                    />
                    <div id="linked-idps" className="space-y-3">
                        {linkedAccounts.length > 0 ? (
                            linkedAccounts.map(
                                (account, index) =>
                                    index !== paramsLinked.max - 1 && (
                                        <AccountRow
                                            key={account.providerName}
                                            account={account}
                                            isLinked
                                            refresh={refresh}
                                        />
                                    )
                            )
                        ) : (
                            <EmptyRow message={t("linkedEmpty")} />
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {t("unlinkedLoginProviders")}
                    </h2>
                    <LinkedAccountsToolbar
                        onFilter={search =>
                            setParamsUnlinked({ ...paramsUnlinked, first: 0, search })
                        }
                        count={unlinkedAccounts.length}
                        first={paramsUnlinked["first"]}
                        max={paramsUnlinked["max"]}
                        onNextClick={() => {
                            setParamsUnlinked({
                                ...paramsUnlinked,
                                first: paramsUnlinked.first + paramsUnlinked.max - 1
                            });
                        }}
                        onPreviousClick={() =>
                            setParamsUnlinked({
                                ...paramsUnlinked,
                                first: paramsUnlinked.first - paramsUnlinked.max + 1
                            })
                        }
                        onPerPageSelect={(first, max) =>
                            setParamsUnlinked({
                                ...paramsUnlinked,
                                first,
                                max
                            })
                        }
                        hasNext={unlinkedAccounts.length > paramsUnlinked.max - 1}
                    />
                    <div id="unlinked-idps" className="space-y-3">
                        {unlinkedAccounts.length > 0 ? (
                            unlinkedAccounts.map(
                                (account, index) =>
                                    index !== paramsUnlinked.max - 1 && (
                                        <AccountRow
                                            key={account.providerName}
                                            account={account}
                                            refresh={refresh}
                                        />
                                    )
                            )
                        ) : (
                            <EmptyRow message={t("unlinkedEmpty")} />
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default LinkedAccounts;
