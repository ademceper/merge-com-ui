import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Input } from "@merge/ui/components/input";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

export default function Account(props: PageProps<Extract<KcContext, { pageId: "account.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, account, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const placeholderStr = (value: unknown, fallback: string) =>
        typeof value === "string" ? value : fallback;

    return (
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
                    <Input
                        type="text"
                        id="username"
                        name="username"
                        disabled
                        defaultValue={account.username ?? ""}
                        placeholder={placeholderStr(msgStr("username") ?? msg("username"), "Kullanıcı Adı")}
                        className="h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20"
                    />
                </div>

                <div className="space-y-2">
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        defaultValue={account.email ?? ""}
                        placeholder={placeholderStr(msgStr("email") ?? msg("email"), "E-posta") + (kcContext.realm.registrationEmailAsUsername ? " *" : "")}
                        aria-invalid={messagesPerField.existsError("email")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("email") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("email") ? (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("email")}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        defaultValue={account.firstName ?? ""}
                        placeholder={placeholderStr(msgStr("firstName") ?? msg("firstName"), "Ad") + " *"}
                        aria-invalid={messagesPerField.existsError("firstName")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("firstName") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("firstName") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("firstName")}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        defaultValue={account.lastName ?? ""}
                        placeholder={placeholderStr(msgStr("lastName") ?? msg("lastName"), "Soyad") + " *"}
                        aria-invalid={messagesPerField.existsError("lastName")}
                        className={cn(
                            "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20",
                            messagesPerField.existsError("lastName") && "border border-red-500"
                        )}
                    />
                    {messagesPerField.existsError("lastName") && (
                        <p className="text-sm text-destructive">
                            {messagesPerField.get("lastName")}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                    {msgStr("save")}
                </button>
            </form>
        </div>
    );
}

