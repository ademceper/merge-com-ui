import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { AuthLink } from "../components/AuthLink";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const inputClassName =
    "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20";
const primaryButtonClassName =
    "w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50";

export default function LoginResetPassword(
    props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, realm, auth, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("emailForgotTitle")}
                </h1>
                <p className="text-sm text-gray-500">{msg("emailForgotDescription")}</p>

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
                            className={cn(
                                inputClassName,
                                messagesPerField.existsError("username") && "border border-red-500"
                            )}
                        />
                        {messagesPerField.existsError("username") && (
                            <p className="text-sm text-red-600">{messagesPerField.get("username")}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={primaryButtonClassName}
                    >
                        {msgStr("doSubmit")}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 pt-2">
                    <AuthLink href={url.loginUrl} className="text-black font-medium">
                        {msg("backToLoginPage")}
                    </AuthLink>
                </p>
            </div>
        </AuthLayout>
    );
}

