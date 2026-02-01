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
import { QrCode } from "lucide-react";

export default function Totp(props: PageProps<Extract<KcContext, { pageId: "totp.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, totp, mode, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSetupMode = mode === "manual" || mode === "qr";

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="totp.ftl">
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
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                    {msg("unableToScan")}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {mode === "manual" && (
                                    <div className="space-y-2">
                                        <Label>{msg("scanBarcode")}</Label>
                                        <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg tracking-wider">
                                            {totp.totpSecretEncoded}
                                        </div>
                                        {totp.qrUrl && (
                                            <Button variant="outline" asChild className="w-full">
                                                <a href={totp.qrUrl}>
                                                    <QrCode className="h-4 w-4 mr-2" />
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
                                        <Label htmlFor="totp">
                                            {msg("oneTimeCode")}
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            id="totp"
                                            name="totp"
                                            autoComplete="off"
                                            autoFocus
                                            aria-invalid={messagesPerField.existsError("totp")}
                                            className={cn(
                                                "text-center text-2xl tracking-widest font-mono",
                                                messagesPerField.existsError("totp") && "border-destructive"
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
                                            className="flex-1"
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            asChild
                                            className="flex-1"
                                        >
                                            <a href={url.accountUrl}>
                                                {msgStr("doCancel")}
                                            </a>
                                        </Button>
                                    </div>
                                </form>
                        </div>
                    </div>
                )}

                {/* Remove TOTP */}
                {!isSetupMode && (
                    <div className="rounded-md border p-4">
                        <div className="mb-4">
                            <h4 className="text-base font-medium">{msg("authenticator")}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Mobile authenticator is configured for your account
                            </p>
                        </div>
                        <form action={url.totpUrl} method="post">
                            <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                            <input type="hidden" name="submitAction" value="Delete" />
                            <Button type="submit" variant="destructive" size="sm">
                                {msgStr("doRemove")}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}

