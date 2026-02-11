import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "keycloakify/login/Template";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoginResetPassword from "./pages/LoginResetPassword";
import LoginUpdatePassword from "./pages/LoginUpdatePassword";
import LoginUpdateProfile from "./pages/LoginUpdateProfile";
import DeleteAccountConfirm from "./pages/DeleteAccountConfirm";
import LoginPageExpired from "./pages/LoginPageExpired";
import Terms from "./pages/Terms";

const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "register.ftl":
                        return (
                            <Register
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-reset-password.ftl":
                        return (
                            <LoginResetPassword
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-update-password.ftl":
                        return (
                            <LoginUpdatePassword
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-update-profile.ftl":
                        return (
                            <LoginUpdateProfile
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "delete-account-confirm.ftl":
                        return (
                            <DeleteAccountConfirm
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-page-expired.ftl":
                        return (
                            <LoginPageExpired
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={{}}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "terms.ftl":
                        return (
                            <Terms
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
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };
