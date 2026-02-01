import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AccountLayout from "../components/AccountLayout";
import { Separator } from "@merge/ui/components/separator";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@/lib/utils";

export default function Account(props: PageProps<Extract<KcContext, { pageId: "account.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, account, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="account.ftl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">{msg("editAccount")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {msg("personalInfoDescription")}
                    </p>
                </div>
                <Separator />

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    action={url.accountUrl}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-8"
                >
                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                    <div className="space-y-2">
                        <Label htmlFor="username">{msg("username")}</Label>
                        <Input
                            type="text"
                            id="username"
                            name="username"
                            disabled
                            defaultValue={account.username ?? ""}
                            className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground">
                            This is your username. It cannot be changed.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            {msg("email")}
                            {kcContext.realm.registrationEmailAsUsername && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            defaultValue={account.email ?? ""}
                            aria-invalid={messagesPerField.existsError("email")}
                            className={cn(
                                messagesPerField.existsError("email") && "border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("email") ? (
                            <p className="text-sm text-destructive">
                                {messagesPerField.get("email")}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                This is the email address associated with your account.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            {msg("firstName")}
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="firstName"
                            name="firstName"
                            defaultValue={account.firstName ?? ""}
                            aria-invalid={messagesPerField.existsError("firstName")}
                            className={cn(
                                messagesPerField.existsError("firstName") && "border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("firstName") && (
                            <p className="text-sm text-destructive">
                                {messagesPerField.get("firstName")}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            {msg("lastName")}
                            <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="lastName"
                            name="lastName"
                            defaultValue={account.lastName ?? ""}
                            aria-invalid={messagesPerField.existsError("lastName")}
                            className={cn(
                                messagesPerField.existsError("lastName") && "border-destructive"
                            )}
                        />
                        {messagesPerField.existsError("lastName") && (
                            <p className="text-sm text-destructive">
                                {messagesPerField.get("lastName")}
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {msgStr("save")}
                    </Button>
                </form>
            </div>
        </AccountLayout>
    );
}

