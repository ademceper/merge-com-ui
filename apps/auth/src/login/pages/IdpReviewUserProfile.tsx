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

export default function IdpReviewUserProfile(
    props: PageProps<Extract<KcContext, { pageId: "idp-review-user-profile.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, profile, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAttrValue = (name: string) => {
        const attr = profile.attributesByName[name];
        return attr?.value ?? attr?.values?.[0] ?? "";
    };

    const usernameAttr = profile.attributesByName["username"];
    const editUsernameAllowed = usernameAttr && !usernameAttr.readOnly;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("loginIdpReviewProfileTitle")}
                </h1>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-idp-review-profile-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-4"
                >
                    {editUsernameAllowed && (
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                defaultValue={getAttrValue("username")}
                                placeholder={msgStr("username")}
                                autoComplete="username"
                                aria-invalid={messagesPerField.existsError("username")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("username") && "border border-destructive"
                                )}
                            />
                            {messagesPerField.existsError("username") && (
                                <p className="text-sm text-destructive">{messagesPerField.get("username")}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={getAttrValue("email")}
                            placeholder={msgStr("email")}
                            autoComplete="email"
                            aria-invalid={messagesPerField.existsError("email")}
                            className={cn(
                                inputClassName,
                                messagesPerField.existsError("email") && "border border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("email") && (
                            <p className="text-sm text-destructive">{messagesPerField.get("email")}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="firstName"
                                name="firstName"
                                defaultValue={getAttrValue("firstName")}
                                placeholder={msgStr("firstName")}
                                autoComplete="given-name"
                                aria-invalid={messagesPerField.existsError("firstName")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("firstName") && "border border-destructive"
                                )}
                            />
                            {messagesPerField.existsError("firstName") && (
                                <p className="text-sm text-destructive">{messagesPerField.get("firstName")}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="lastName"
                                name="lastName"
                                defaultValue={getAttrValue("lastName")}
                                placeholder={msgStr("lastName")}
                                autoComplete="family-name"
                                aria-invalid={messagesPerField.existsError("lastName")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("lastName") && "border border-destructive"
                                )}
                            />
                            {messagesPerField.existsError("lastName") && (
                                <p className="text-sm text-destructive">{messagesPerField.get("lastName")}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            size="lg"
                            className="w-full"
                        >
                            {msgStr("doSubmit")}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
