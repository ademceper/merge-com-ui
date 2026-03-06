import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@merge-rd/ui/components/input";
import { Button } from "@merge-rd/ui/components/button";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import { Label } from "@merge-rd/ui/components/label";
import { Link } from "@merge-rd/ui/components/link";
import { cn } from "@merge-rd/ui/lib/utils";

export default function LoginConfigTotp(props: PageProps<Extract<KcContext, { pageId: "login-config-totp.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, isAppInitiatedAction, totp, mode, messagesPerField, message } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{msg("loginTotpTitle")}</h1>

                {message && !messagesPerField.existsError("totp", "userLabel") && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{msg("loginTotpStepInstall")}</p>
                    <div className="flex flex-wrap gap-1">
                        {totp.supportedApplications.map(app => (
                            <span key={app} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                {advancedMsg(app)}
                            </span>
                        ))}
                    </div>
                </div>

                {mode === "manual" ? (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">{msg("loginTotpManualStep2")}</p>
                        <div className="rounded-lg bg-muted py-3 text-center">
                            <code className="text-sm font-mono break-all select-all text-foreground">{totp.totpSecretEncoded}</code>
                        </div>
                        <Link href={totp.qrUrl} className="text-sm text-muted-foreground hover:text-foreground">
                            {msg("loginTotpScanBarcode")}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">{msg("loginTotpStep2")}</p>
                        <div className="flex justify-center rounded-lg bg-muted p-4">
                            <img src={`data:image/png;base64, ${totp.totpSecretQrCode}`} alt="QR Code" className="h-48 w-48" />
                        </div>
                        <Link href={totp.manualUrl} className="text-sm text-muted-foreground hover:text-foreground">
                            {msg("loginTotpUnableToScan")}
                        </Link>
                    </div>
                )}

                <form
                    id="kc-totp-settings-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Input
                            variant="secondary"
                            size="xl"
                            type="text"
                            id="totp"
                            name="totp"
                            autoComplete="off"
                            autoFocus
                            placeholder={msgStr("authenticatorCode")}
                            aria-invalid={messagesPerField.existsError("totp")}
                            className={cn(messagesPerField.existsError("totp") && "border border-destructive")}
                        />
                        {messagesPerField.existsError("totp") && <p className="text-sm text-destructive">{messagesPerField.get("totp")}</p>}
                    </div>

                    <div className="space-y-2">
                        <Input
                            variant="secondary"
                            size="xl"
                            type="text"
                            id="userLabel"
                            name="userLabel"
                            autoComplete="off"
                            placeholder={msgStr("loginTotpDeviceName")}
                            aria-invalid={messagesPerField.existsError("userLabel")}
                            className={cn(messagesPerField.existsError("userLabel") && "border border-destructive")}
                        />
                        {messagesPerField.existsError("userLabel") && <p className="text-sm text-destructive">{messagesPerField.get("userLabel")}</p>}
                    </div>

                    <input type="hidden" id="totpSecret" name="totpSecret" value={totp.totpSecret} />
                    {mode && <input type="hidden" id="mode" value={mode} />}

                    <div className="flex items-center gap-2">
                        <Checkbox id="logout-sessions" name="logout-sessions" value="on" defaultChecked />
                        <Label htmlFor="logout-sessions" className="text-sm text-muted-foreground cursor-pointer">
                            {msg("logoutOtherSessions")}
                        </Label>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <Button type="submit" disabled={isSubmitting} size="xl" className="w-full">
                            {msgStr("doSubmit")}
                        </Button>
                        {isAppInitiatedAction && (
                            <Button type="submit" name="cancel-aia" value="true" variant="secondary" size="xl" className="w-full">
                                {msgStr("doCancel")}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
