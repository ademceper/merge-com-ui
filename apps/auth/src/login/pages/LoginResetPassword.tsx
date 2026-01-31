import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "./AuthLayout";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { cn } from "@merge/ui/lib/utils";

export default function LoginResetPassword(
    props: PageProps<
        Extract<KcContext, { pageId: "login-reset-password.ftl" }>,
        I18n
    >
) {
    const { kcContext, i18n } = props;
    const { url, realm, auth, messagesPerField, message } = kcContext;
    const { msg, msgStr } = i18n;

    return (
        <AuthLayout
            title="Reset Password"
            description="Enter your email and we'll send you a link to reset your password."
            features={[
                {
                    title: "Secure Process",
                    description: "We'll send you a secure link to reset your password",
                },
                {
                    title: "Quick Recovery",
                    description: "Get back to your account in minutes",
                },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{msg("emailForgotTitle")}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {realm.duplicateEmailsAllowed
                            ? msg("emailInstructionUsername")
                            : msg("emailInstruction")}
                    </p>
                </div>

                {message && (
                    <Alert
                        variant={message.type === "error" ? "destructive" : "default"}
                    >
                        <AlertDescription
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(message.summary),
                            }}
                        />
                    </Alert>
                )}

                <form
                    id="kc-reset-password-form"
                    action={url.loginAction}
                    method="post"
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="username">
                            {!realm.loginWithEmailAllowed
                                ? msg("username")
                                : !realm.registrationEmailAsUsername
                                  ? msg("usernameOrEmail")
                                  : msg("email")}
                        </Label>
                        <Input
                            type="text"
                            id="username"
                            name="username"
                            autoFocus
                            defaultValue={auth.attemptedUsername ?? ""}
                            aria-invalid={messagesPerField.existsError("username")}
                            className={cn(
                                messagesPerField.existsError("username") &&
                                    "border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("username") && (
                            <p
                                className="text-sm text-destructive"
                                id="input-error-username"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(
                                        messagesPerField.get("username")
                                    ),
                                }}
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-4 pt-2">
                        <a
                            href={url.loginUrl}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            {msg("backToLogin")}
                        </a>
                        <Button type="submit" className="w-full" size="lg">
                            {msgStr("doSubmit")}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
