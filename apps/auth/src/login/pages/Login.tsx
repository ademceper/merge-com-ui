import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Link } from "@merge/ui/components/link";
import { SocialLoginButtons, getFallbackSocialProviders } from "../components/SocialLoginButtons";
import { Input } from "@merge/ui/components/input";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const providers = realm.password && (social?.providers?.length ? social.providers : getFallbackSocialProviders());

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("loginAccountTitle")}
                </h1>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                {realm.password && (
                    <form
                        id="kc-form-login"
                        onSubmit={() => {
                            setIsLoginButtonDisabled(true);
                            return true;
                        }}
                        action={url.loginAction}
                        method="post"
                        className="space-y-4"
                    >
                        {!usernameHidden && (
                            <div className="space-y-2">
                                <Input
                                    tabIndex={2}
                                    id="username"
                                    name="username"
                                    defaultValue={login.username ?? ""}
                                    type="text"
                                    autoFocus
                                    autoComplete="username"
                                    placeholder={msgStr("loginPlaceholder") || msgStr("usernameOrEmail")}
                                    aria-invalid={messagesPerField.existsError("username", "password")}
                                    className={cn(
                                        "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                                        messagesPerField.existsError("username", "password") && "border border-red-500"
                                    )}
                                />
                                {messagesPerField.existsError("username", "password") && (
                                    <p className="text-sm text-red-600">
                                        {messagesPerField.getFirstError("username", "password")}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input
                                tabIndex={3}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder={msgStr("password")}
                                aria-invalid={messagesPerField.existsError("username", "password")}
                                className={cn(
                                    "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                                    usernameHidden && messagesPerField.existsError("username", "password") && "border border-red-500"
                                )}
                            />
                            {usernameHidden && messagesPerField.existsError("username", "password") && (
                                <p className="text-sm text-red-600">
                                    {messagesPerField.getFirstError("username", "password")}
                                </p>
                            )}
                            {realm.resetPasswordAllowed && (
                                <div className="flex justify-end mt-1">
                                    <Link
                                        tabIndex={6}
                                        href={url.loginResetCredentialsUrl}
                                        className="text-sm text-gray-600 hover:text-black"
                                    >
                                        {msg("doForgotPassword")}
                                    </Link>
                                </div>
                            )}
                        </div>

                        <input
                            type="hidden"
                            id="id-hidden-input"
                            name="credentialId"
                            value={auth.selectedCredential}
                        />

                        <button
                            tabIndex={7}
                            type="submit"
                            disabled={isLoginButtonDisabled}
                            className="w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                        >
                            {msgStr("doContinue") || msgStr("doLogIn")}
                        </button>
                    </form>
                )}

                {providers && providers.length > 0 && (
                    <SocialLoginButtons
                        providers={providers}
                        dividerLabel={msgStr("orSeparator") || "Veya"}
                        getButtonLabel={(displayName) =>
                            msgStr("continueWithProvider")?.replace("{{provider}}", displayName) || `${displayName} ile devam edin`
                        }
                    />
                )}

                {realm.password && realm.registrationAllowed && !registrationDisabled && (
                    <p className="text-center text-sm text-gray-500 pt-2">
                        {msg("noAccount")}{" "}
<Link tabIndex={8} href={url.registrationUrl} className="text-black font-medium">
                                {msg("doRegister")}
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
