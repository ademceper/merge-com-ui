import { Fragment, useRef, useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge-rd/ui/components/button";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@merge-rd/ui/components/input-otp";
import { cn } from "@merge-rd/ui/lib/utils";

export default function LoginOtp(props: PageProps<Extract<KcContext, { pageId: "login-otp.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { otpLogin, url, messagesPerField, message } = kcContext;

    const { msg, msgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{msg("loginOtpTitle")}</h1>

                {message && !messagesPerField.existsError("totp") && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-otp-login-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                    className="space-y-4"
                >
                    {otpLogin.userOtpCredentials.length > 1 && (
                        <div className="space-y-2">
                            {otpLogin.userOtpCredentials.map((otpCredential, index) => (
                                <Fragment key={index}>
                                    <label
                                        htmlFor={`kc-otp-credential-${index}`}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg bg-muted px-3 py-3 cursor-pointer",
                                            "has-checked:ring-2 has-checked:ring-ring"
                                        )}
                                    >
                                        <input
                                            id={`kc-otp-credential-${index}`}
                                            type="radio"
                                            name="selectedCredentialId"
                                            value={otpCredential.id}
                                            defaultChecked={otpCredential.id === otpLogin.selectedCredentialId}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm text-foreground">{otpCredential.userLabel}</span>
                                    </label>
                                </Fragment>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{msg("loginOtpOneTime")}</p>
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={otpValue}
                                onChange={value => {
                                    setOtpValue(value);
                                    if (hiddenInputRef.current) {
                                        hiddenInputRef.current.value = value;
                                    }
                                }}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <input type="hidden" id="otp" name="otp" ref={hiddenInputRef} value={otpValue} />
                        {messagesPerField.existsError("totp") && (
                            <p className="text-sm text-destructive text-center">{messagesPerField.get("totp")}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting || otpValue.length < 6} size="xl" className="w-full">
                        {msgStr("doLogIn")}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
