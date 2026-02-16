import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Link } from "@merge/ui/components/link";
import { SocialLoginButtons } from "../components/SocialLoginButtons";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";
import { formInputClassName } from "../../shared/keycloak-ui-shared";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const providers = realm.password && social?.providers?.length ? social.providers : undefined;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
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
                                        formInputClassName,
                                        messagesPerField.existsError("username", "password") && "border border-destructive"
                                    )}
                                />
                                {messagesPerField.existsError("username", "password") && (
                                    <p className="text-sm text-destructive">
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
                                    formInputClassName,
                                    usernameHidden && messagesPerField.existsError("username", "password") && "border border-destructive"
                                )}
                            />
                            {usernameHidden && messagesPerField.existsError("username", "password") && (
                                <p className="text-sm text-destructive">
                                    {messagesPerField.getFirstError("username", "password")}
                                </p>
                            )}
                            {realm.resetPasswordAllowed && (
                                <div className="flex justify-end mt-1">
                                    <Link
                                        tabIndex={6}
                                        href={url.loginResetCredentialsUrl}
                                        className="text-sm text-muted-foreground hover:text-foreground"
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

                        <Button
                            tabIndex={7}
                            type="submit"
                            disabled={isLoginButtonDisabled}
                            size="lg"
                            className="w-full"
                        >
                            {msgStr("doContinue") || msgStr("doLogIn")}
                        </Button>
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
                    <p className="text-center text-sm text-muted-foreground pt-2">
                        {msg("noAccount")}{" "}
                        <Link tabIndex={8} href={url.registrationUrl} className="text-foreground font-medium">
                                {msg("doRegister")}
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
