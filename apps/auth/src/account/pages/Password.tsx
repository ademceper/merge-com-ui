import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Input } from "@merge/ui/components/input";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

export default function Password(props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const placeholderStr = (value: unknown, fallback: string) =>
        typeof value === "string" ? value : fallback;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{msg("changePassword")}</h3>
                <p className="text-sm text-muted-foreground">
                    {msg("passwordDescription")}
                </p>
            </div>
            <Separator />

            {message && (
                <Alert variant={message.type === "error" ? "destructive" : message.type === "success" ? "default" : "default"}>
                    <AlertDescription>{message.summary}</AlertDescription>
                </Alert>
            )}


            <form
                action={url.passwordUrl}
                method="post"
                onSubmit={() => {
                    setIsSubmitting(true);
                    return true;
                }}
                className="space-y-8"
            >
                <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                {/* Current Password */}
                <div className="space-y-2">
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder={placeholderStr(msgStr("currentPassword"), "Mevcut Şifre") + " *"}
                        aria-invalid={messagesPerField.existsError("password")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("password") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("password") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password")}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <Input
                        type="password"
                        id="password-new"
                        name="password-new"
                        autoComplete="new-password"
                        placeholder={placeholderStr(msgStr("newPassword"), "Yeni Şifre") + " *"}
                        aria-invalid={messagesPerField.existsError("password-new")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("password-new") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("password-new") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password-new")}
                        </p>
                    )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                    <Input
                        type="password"
                        id="password-confirm"
                        name="password-confirm"
                        autoComplete="new-password"
                        placeholder={placeholderStr(msgStr("passwordConfirm"), "Şifre Onayı") + " *"}
                        aria-invalid={messagesPerField.existsError("password-confirm")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("password-confirm") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("password-confirm") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password-confirm")}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                    {msg("updatePassword")}
                </button>
            </form>
        </div>
    );
}

