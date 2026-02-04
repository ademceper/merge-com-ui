import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

const inputClassName =
    "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
const primaryButtonClassName =
    "w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50";
const secondaryButtonClassName =
    "w-full h-12 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors border-0";

export default function LoginUpdatePassword(
    props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, messagesPerField, isAppInitiatedAction, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("updatePasswordTitle")}
                </h1>
                <p className="text-sm text-gray-500">
                    {isAppInitiatedAction
                        ? msg("updatePasswordDescription")
                        : msg("updatePasswordRequiredDescription")}
                </p>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-passwd-update-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        id="username"
                        name="username"
                        autoComplete="username"
                        style={{ display: "none" }}
                    />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        style={{ display: "none" }}
                    />

                    <div className="space-y-2">
                        <Input
                            type="password"
                            id="password-new"
                            name="password-new"
                            autoFocus
                            placeholder={msgStr("passwordNew")}
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            className={cn(
                                inputClassName,
                                messagesPerField.existsError("password", "password-confirm") && "border border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("password", "password-confirm") && (
                            <p className="text-sm text-red-600">
                                {messagesPerField.getFirstError("password", "password-confirm")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            id="password-confirm"
                            name="password-confirm"
                            placeholder={msgStr("passwordConfirm")}
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password-confirm")}
                            className={cn(
                                inputClassName,
                                messagesPerField.existsError("password-confirm") && "border border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("password-confirm") && (
                            <p className="text-sm text-destructive">{messagesPerField.get("password-confirm")}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2 justify-between">
                        {isAppInitiatedAction && (
                            <Button
                                type="submit"
                                name="cancel-aia"
                                value="true"
                                className={secondaryButtonClassName}
                            >
                                {msgStr("doCancel")}
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={primaryButtonClassName}
                        >
                            {msgStr("doSubmit")}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
