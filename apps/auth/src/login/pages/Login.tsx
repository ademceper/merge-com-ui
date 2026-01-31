import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "./AuthLayout";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    return (
        <AuthLayout
            title="Welcome Back"
            description="Sign in to access your account and continue your journey with us."
            features={[
                {
                    title: "Secure Authentication",
                    description: "Your data is protected with industry-standard security"
                },
                {
                    title: "Quick Access",
                    description: "Get instant access to all your services"
                }
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{msg("loginAccountTitle")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{msg("loginAccountDescription")}</p>
                </div>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
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
                                        <Label htmlFor="username">
                                            {!realm.loginWithEmailAllowed
                                                ? msg("username")
                                                : !realm.registrationEmailAsUsername
                                                  ? msg("usernameOrEmail")
                                                  : msg("email")}
                                        </Label>
                                        <Input
                                            tabIndex={2}
                                            id="username"
                                            name="username"
                                            defaultValue={login.username ?? ""}
                                            type="text"
                                            autoFocus
                                            autoComplete="username"
                                            aria-invalid={messagesPerField.existsError("username", "password")}
                                            className={cn(
                                                messagesPerField.existsError("username", "password") && "border-destructive"
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">{msg("password")}</Label>
                                        {realm.resetPasswordAllowed && (
                                            <a
                                                tabIndex={6}
                                                href={url.loginResetCredentialsUrl}
                                                className="text-sm text-primary hover:underline font-medium"
                                            >
                                                {msg("doForgotPassword")}
                                            </a>
                                        )}
                                    </div>
                                    <Input
                                        tabIndex={3}
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                        className={cn(
                                            usernameHidden && messagesPerField.existsError("username", "password") && "border-destructive"
                                        )}
                                    />
                                    {usernameHidden && messagesPerField.existsError("username", "password") && (
                                        <p className="text-sm text-destructive">
                                            {messagesPerField.getFirstError("username", "password")}
                                        </p>
                                    )}
                                </div>

                                {realm.rememberMe && !usernameHidden && (
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">
                                            {msg("rememberMe")}
                                        </Label>
                                        <Checkbox
                                            tabIndex={5}
                                            id="rememberMe"
                                            name="rememberMe"
                                            defaultChecked={!!login.rememberMe}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                )}

                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    value={auth.selectedCredential}
                                />
                                
                                <Button
                                    tabIndex={7}
                                    disabled={isLoginButtonDisabled}
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                >
                                    {msgStr("doLogIn")}
                                </Button>
                            </form>
                        )}

                        {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            {msg("identity-provider-login-label") || msg("orSeparator")}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-2">
                                    {social.providers.map((p) => (
                                        <Button
                                            key={p.alias}
                                            variant="outline"
                                            type="button"
                                            asChild
                                        >
                                            <a href={p.loginUrl}>
                                                {p.iconClasses && <i className={cn("mr-2", p.iconClasses)} aria-hidden="true"></i>}
                                                {p.displayName}
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                {realm.password && realm.registrationAllowed && !registrationDisabled && (
                    <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            {msg("noAccount")}{" "}
                            <a tabIndex={8} href={url.registrationUrl} className="text-primary hover:underline font-medium">
                                {msg("doRegister")}
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
