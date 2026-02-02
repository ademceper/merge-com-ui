import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Separator } from "@merge/ui/components/separator";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

export default function Password(props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder={placeholderStr(msgStr("currentPassword"), "Mevcut Şifre")}
                            aria-invalid={messagesPerField.existsError("password")}
                            className={cn(
                                "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring pr-12",
                                messagesPerField.existsError("password") && "border border-red-500"
                            )}
                        />
                        <Button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                        </Button>
                    </div>
                    {messagesPerField.existsError("password") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password")}
                        </p>
                    )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            id="password-new"
                            name="password-new"
                            autoComplete="new-password"
                            placeholder={placeholderStr(msgStr("newPassword"), "Yeni Şifre")}
                            aria-invalid={messagesPerField.existsError("password-new")}
                            className={cn(
                                "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring pr-12",
                                messagesPerField.existsError("password-new") && "border border-red-500"
                            )}
                        />
                        <Button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowNewPassword((v) => !v)}
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                            aria-label={showNewPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                            {showNewPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                        </Button>
                    </div>
                    {messagesPerField.existsError("password-new") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password-new")}
                        </p>
                    )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            id="password-confirm"
                            name="password-confirm"
                            autoComplete="new-password"
                            placeholder={placeholderStr(msgStr("passwordConfirm"), "Şifre Onayı")}
                            aria-invalid={messagesPerField.existsError("password-confirm")}
                            className={cn(
                                "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring pr-12",
                                messagesPerField.existsError("password-confirm") && "border border-red-500"
                            )}
                        />
                        <Button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                            aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                            {showConfirmPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                        </Button>
                    </div>
                    {messagesPerField.existsError("password-confirm") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("password-confirm")}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {msg("updatePassword")}
                </Button>
            </form>
        </div>
    );
}

