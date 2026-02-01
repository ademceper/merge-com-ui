import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const inputClassName =
    "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20";
const primaryButtonClassName =
    "w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50";
const secondaryButtonClassName =
    "w-full h-12 rounded-lg bg-gray-100 text-black font-medium text-sm hover:bg-gray-200 transition-colors border-0";

export default function LoginUpdateProfile(
    props: PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, profile, messagesPerField, isAppInitiatedAction, message } = kcContext;

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
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("loginProfileTitle")}
                </h1>
                <p className="text-sm text-gray-500">
                    {isAppInitiatedAction
                        ? msg("loginProfileDescription")
                        : msg("loginProfileRequiredDescription")}
                </p>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-update-profile-form"
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
                                    messagesPerField.existsError("username") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("username") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("username")}</p>
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
                                messagesPerField.existsError("email") && "border border-red-500"
                            )}
                        />
                        {messagesPerField.existsError("email") && (
                            <p className="text-sm text-red-600">{messagesPerField.get("email")}</p>
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
                                    messagesPerField.existsError("firstName") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("firstName") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("firstName")}</p>
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
                                    messagesPerField.existsError("lastName") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("lastName") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("lastName")}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2 justify-between">
                        {isAppInitiatedAction && (
                            <button
                                type="submit"
                                name="cancel-aia"
                                value="true"
                                className={secondaryButtonClassName}
                            >
                                {msgStr("doCancel")}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={primaryButtonClassName}
                        >
                            {msgStr("doSubmit")}
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}

