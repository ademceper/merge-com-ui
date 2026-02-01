import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AccountLayout from "../components/AccountLayout";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function Password(props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="password.ftl">
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
                        <Label htmlFor="password">
                            {msg("currentPassword") || msgStr("password")}
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            autoComplete="current-password"
                            aria-invalid={messagesPerField.existsError("password")}
                            className={cn(
                                messagesPerField.existsError("password") && "border-destructive"
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
                        <Label htmlFor="password-new">
                            {msg("newPassword") || msgStr("passwordNew")}
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                            type="password"
                            id="password-new"
                            name="password-new"
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password-new")}
                            className={cn(
                                messagesPerField.existsError("password-new") && "border-destructive"
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
                        <Label htmlFor="password-confirm">
                            {msg("passwordConfirm") || msgStr("passwordConfirm")}
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                            type="password"
                            id="password-confirm"
                            name="password-confirm"
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password-confirm")}
                            className={cn(
                                messagesPerField.existsError("password-confirm") && "border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("password-confirm") && (
                            <p className="text-sm text-destructive">
                                {messagesPerField.get("password-confirm")}
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {msg("updatePassword")}
                    </Button>
                </form>
            </div>
        </AccountLayout>
    );
}

