import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Input } from "@merge/ui/components/input";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";
import { QrCodeIcon } from "@phosphor-icons/react";

export default function Totp(props: PageProps<Extract<KcContext, { pageId: "totp.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, totp, mode, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSetupMode = mode === "manual" || mode === "qr";

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{msg("totpTitle")}</h3>
                <p className="text-sm text-muted-foreground">{msg("totpDescription")}</p>
            </div>
            <Separator />

            {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.summary}</AlertDescription>
                </Alert>
            )}

            {/* TOTP Setup */}
            {isSetupMode && (
                <div className="space-y-4">
                    {/* Step 1: Install App */}
                    <div className="rounded-md border p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                            <h4 className="text-base font-medium">{msg("totpStep1")}</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {totp.supportedApplications?.map((app) => (
                                <div key={app} className="text-sm text-muted-foreground">
                                    • {app}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Scan QR Code */}
                    <div className="rounded-md border p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                            <h4 className="text-base font-medium">{msg("totpStep2")}</h4>
                        </div>
                        <div className="space-y-4">
                            {mode === "qr" && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-white rounded-lg border">
                                        <img
                                            src={`data:image/png;base64,${totp.totpSecretQrCode}`}
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    {totp.manualUrl && (
                                        <Button variant="outline" asChild>
                                            <a href={totp.manualUrl}>
                                                <QrCodeIcon className="h-4 w-4 mr-2" />
                                                {msg("unableToScan")}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                            {mode === "manual" && (
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">{msg("scanBarcode")}</div>
                                    <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg tracking-wider">
                                        {totp.totpSecretEncoded}
                                    </div>
                                    {totp.qrUrl && (
                                        <Button variant="outline" asChild className="w-full">
                                            <a href={totp.qrUrl}>
                                                <QrCodeIcon className="h-4 w-4 mr-2" />
                                                {msg("scanBarcode")}
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Enter Code */}
                    <div className="rounded-md border p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                            <h4 className="text-base font-medium">{msg("totpStep3")}</h4>
                        </div>
                        <form
                            action={url.totpUrl}
                            method="post"
                            onSubmit={() => {
                                setIsSubmitting(true);
                                return true;
                            }}
                            className="space-y-4"
                        >
                            <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />

                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    id="totp"
                                    name="totp"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder={msg("oneTimeCode") + " *"}
                                    aria-invalid={messagesPerField.existsError("totp")}
                                    className={cn(
                                        "h-12 rounded-lg bg-muted border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring text-center text-2xl tracking-widest font-mono",
                                        messagesPerField.existsError("totp") && "border border-red-500"
                                    )}
                                    maxLength={6}
                                />
                                {messagesPerField.existsError("totp") && (
                                    <p className="text-sm text-destructive">
                                        {messagesPerField.get("totp")}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    Submit
                                </Button>
                                <a
                                    href={url.accountUrl}
                                    className="flex-1 h-12 rounded-lg border border-border flex items-center justify-center font-medium text-sm text-foreground hover:bg-muted transition-colors"
                                >
                                    {msgStr("doCancel")}
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove TOTP */}
            {!isSetupMode && (
                <div className="rounded-md border p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h4 className="text-base font-medium">{msg("authenticator")}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            {msg("totpConfiguredDescription")}
                        </p>
                    </div>
                    <form action={url.totpUrl} method="post" className="shrink-0">
                        <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                        <input type="hidden" name="submitAction" value="Delete" />
                        <Button type="submit" variant="destructive" size="sm">
                            {msgStr("doRemove")}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
