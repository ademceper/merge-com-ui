import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kc-context";
import type { I18n } from "../i18n";
import AuthLayout from "../components/auth-layout";
import { Link } from "@merge-rd/ui/components/link";
import { Input } from "@merge-rd/ui/components/input";
import { Button } from "@merge-rd/ui/components/button";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";
import { cn } from "@merge-rd/ui/lib/utils";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, realm, auth, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{msg("emailForgotTitle")}</h1>
                <p className="text-sm text-muted-foreground">{msg("emailForgotDescription")}</p>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-reset-password-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Input
                            variant="secondary"
                            size="xl"
                            type="text"
                            id="username"
                            name="username"
                            autoFocus
                            defaultValue={auth?.attemptedUsername ?? ""}
                            placeholder={
                                !realm.loginWithEmailAllowed
                                    ? msgStr("username")
                                    : !realm.registrationEmailAsUsername
                                      ? msgStr("usernameOrEmail")
                                      : msgStr("email")
                            }
                            autoComplete="username"
                            aria-invalid={messagesPerField.existsError("username")}
                            className={cn(messagesPerField.existsError("username") && "border border-destructive")}
                        />
                        {messagesPerField.existsError("username") && <p className="text-sm text-destructive">{messagesPerField.get("username")}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} size="xl" className="w-full">
                        {msgStr("doSubmit")}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground pt-2">
                    <Link href={url.loginUrl} className="text-foreground font-medium">
                        {msg("backToLoginPage")}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
