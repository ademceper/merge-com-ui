import type { ComponentType } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import type { JSX } from "keycloakify/tools/JSX";
import { useState, useLayoutEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "./AuthLayout";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

type RegisterProps = PageProps<
    Extract<KcContext, { pageId: "register.ftl" }>,
    I18n
> & {
    UserProfileFormFields: LazyOrNot<
        (props: UserProfileFormFieldsProps<KcContext, I18n>) => JSX.Element
    >;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
    const {
        kcContext,
        i18n,
        doUseDefaultCss,
        classes,
        UserProfileFormFields,
        doMakeUserConfirmPassword,
    } = props;

    const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

    const {
        messageHeader,
        url,
        messagesPerField,
        recaptchaRequired,
        recaptchaVisible,
        recaptchaSiteKey,
        recaptchaAction,
        termsAcceptanceRequired,
    } = kcContext;

    const { msg, msgStr, advancedMsg } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);

    useLayoutEffect(() => {
        (window as Window & { onSubmitRecaptcha?: () => void })["onSubmitRecaptcha"] =
            () => {
                (document.getElementById("kc-register-form") as HTMLFormElement | null)?.requestSubmit();
            };
        return () => {
            delete (window as Window & { onSubmitRecaptcha?: () => void })["onSubmitRecaptcha"];
        };
    }, []);

    const headerTitle =
        messageHeader !== undefined ? advancedMsg(messageHeader) : msg("registerTitle");

    return (
        <AuthLayout
            title="Create Account"
            description="Sign up to get started with your account."
            features={[
                {
                    title: "Easy Setup",
                    description: "Get started in just a few steps",
                },
                {
                    title: "Full Access",
                    description: "Access all features after registration",
                },
            ]}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{headerTitle}</h1>
                    {messagesPerField.exists("global") && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertDescription
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(
                                        messagesPerField.get("global")
                                    ),
                                }}
                            />
                        </Alert>
                    )}
                </div>

                <form
                    id="kc-register-form"
                    className="space-y-4"
                    action={url.registrationAction}
                    method="post"
                >
                    {(function UserProfileFormFieldsWrapper() {
                        const C = UserProfileFormFields as ComponentType<
                            UserProfileFormFieldsProps<KcContext, I18n>
                        >;
                        return (
                            <C
                                kcContext={kcContext}
                                i18n={i18n}
                                kcClsx={kcClsx}
                                onIsFormSubmittableValueChange={setIsFormSubmittable}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                    })()}

                    {termsAcceptanceRequired && (
                        <TermsAcceptance
                            i18n={i18n}
                            messagesPerField={messagesPerField}
                            areTermsAccepted={areTermsAccepted}
                            onAreTermsAcceptedValueChange={setAreTermsAccepted}
                        />
                    )}

                    {recaptchaRequired &&
                        (recaptchaVisible || recaptchaAction === undefined) && (
                            <div className="flex justify-center">
                                <div
                                    className="g-recaptcha"
                                    data-size="compact"
                                    data-sitekey={recaptchaSiteKey}
                                    data-action={recaptchaAction}
                                />
                            </div>
                        )}

                    <div className="flex flex-col gap-4 pt-2">
                        <a
                            href={url.loginUrl}
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            {msg("backToLogin")}
                        </a>

                        {recaptchaRequired &&
                        !recaptchaVisible &&
                        recaptchaAction !== undefined ? (
                            <button
                                type="submit"
                                className={cn(
                                    "inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90",
                                    "g-recaptcha"
                                )}
                                data-sitekey={recaptchaSiteKey}
                                data-callback="onSubmitRecaptcha"
                                data-action={recaptchaAction}
                            >
                                {msgStr("doRegister")}
                            </button>
                        ) : (
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={
                                    !isFormSubmittable ||
                                    (termsAcceptanceRequired && !areTermsAccepted)
                                }
                            >
                                {msgStr("doRegister")}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}

function TermsAcceptance(props: {
    i18n: I18n;
    messagesPerField: Pick<
        KcContext["messagesPerField"],
        "existsError" | "get"
    >;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (value: boolean) => void;
}) {
    const {
        i18n,
        messagesPerField,
        areTermsAccepted,
        onAreTermsAcceptedValueChange,
    } = props;
    const { msg } = i18n;

    return (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div>
                <p className="text-sm font-medium">{msg("termsTitle")}</p>
                <div
                    id="kc-registration-terms-text"
                    className="mt-1 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-2"
                >
                    {msg("termsText")}
                </div>
            </div>
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={areTermsAccepted}
                    onChange={(e) =>
                        onAreTermsAcceptedValueChange(e.target.checked)
                    }
                    aria-invalid={messagesPerField.existsError("termsAccepted")}
                    className="mt-1.5 h-4 w-4 rounded border border-input"
                />
                <div className="space-y-1">
                    <Label
                        htmlFor="termsAccepted"
                        className="cursor-pointer text-sm font-medium"
                    >
                        {msg("acceptTerms")}
                    </Label>
                    {messagesPerField.existsError("termsAccepted") && (
                        <p
                            id="input-error-terms-accepted"
                            className="text-sm text-destructive"
                            aria-live="polite"
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(
                                    messagesPerField.get("termsAccepted")
                                ),
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
