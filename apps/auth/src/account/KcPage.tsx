import { Suspense } from "react";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/account/DefaultPage";
import Template from "keycloakify/account/Template";
import AccountLayout from "./components/AccountLayout";
import Account from "./pages/Account";
import Password from "./pages/Password";
import Totp from "./pages/Totp";
import Sessions from "./pages/Sessions";
import Applications from "./pages/Applications";
import FederatedIdentity from "./pages/FederatedIdentity";
import Log from "./pages/Log";

const classes = {} satisfies Parameters<typeof DefaultPage>[0]["classes"];

export default function KcAccountPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;
    const { i18n } = useI18n({ kcContext });

    const pageContent = (() => {
        switch (kcContext.pageId) {
            case "account.ftl":
                return (
                    <Account
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "password.ftl":
                return (
                    <Password
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "totp.ftl":
                return (
                    <Totp
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "sessions.ftl":
                return (
                    <Sessions
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "applications.ftl":
                return (
                    <Applications
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "federatedIdentity.ftl":
                return (
                    <FederatedIdentity
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            case "log.ftl":
                return (
                    <Log
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={{}}
                        Template={Template}
                        doUseDefaultCss={false}
                    />
                );
            default:
                return (
                    <DefaultPage
                        kcContext={kcContext}
                        i18n={i18n}
                        classes={classes}
                        Template={Template}
                        doUseDefaultCss={true}
                    />
                );
        }
    })();

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage={kcContext.pageId}>
            <Suspense>{pageContent}</Suspense>
        </AccountLayout>
    );
}

