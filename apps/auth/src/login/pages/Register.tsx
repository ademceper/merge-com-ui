import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Link } from "@merge/ui/components/link";
import { SocialLoginButtons, getFallbackSocialProviders } from "../components/SocialLoginButtons";
import { Input } from "@merge/ui/components/input";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { cn } from "@merge/ui/lib/utils";

const inputClassName =
    "h-12 rounded-lg bg-gray-100 border-0 text-black placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/20";
const primaryButtonClassName =
    "w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50";

type RegisterWithSocial = Extract<KcContext, { pageId: "register.ftl" }> & {
    social?: { providers?: { loginUrl: string; alias: string; providerId: string; displayName: string; iconClasses?: string }[] };
};

export default function Register(props: PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;
    const kc = kcContext as RegisterWithSocial;

    const {
        url,
        messagesPerField,
        realm,
        passwordRequired,
        recaptchaRequired,
        recaptchaSiteKey,
        message
    } = kc;
    const socialProviders = kc.social?.providers;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("registerTitle")}
                </h1>

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                {messagesPerField.exists("global") && (
                    <Alert variant="destructive" className="rounded-lg">
                        <AlertDescription>{messagesPerField.get("global")}</AlertDescription>
                    </Alert>
                )}

                <form
                    id="kc-register-form"
                    action={url.registrationAction}
                    method="post"
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="firstName"
                                name="firstName"
                                placeholder={msgStr("firstName")}
                                aria-invalid={messagesPerField.existsError("firstName")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("firstName") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("firstName") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("firstName")}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="lastName"
                                name="lastName"
                                placeholder={msgStr("lastName")}
                                aria-invalid={messagesPerField.existsError("lastName")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("lastName") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("lastName") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("lastName")}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder={msgStr("email")}
                            autoComplete="email"
                            aria-invalid={messagesPerField.existsError("email")}
                            className={cn(
                                inputClassName,
                                messagesPerField.existsError("email") && "border border-red-500"
                            )}
                        />
                        {messagesPerField.existsError("email") && (
                            <p className="text-sm text-red-600">{messagesPerField.get("email")}</p>
                        )}
                    </div>

                    {!realm.registrationEmailAsUsername && (
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                placeholder={msgStr("username")}
                                autoComplete="username"
                                aria-invalid={messagesPerField.existsError("username")}
                                className={cn(
                                    inputClassName,
                                    messagesPerField.existsError("username") && "border border-red-500"
                                )}
                            />
                            {messagesPerField.existsError("username") && (
                                <p className="text-sm text-red-600">{messagesPerField.get("username")}</p>
                            )}
                        </div>
                    )}

                    {passwordRequired && (
                        <>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder={msgStr("password")}
                                    autoComplete="new-password"
                                    aria-invalid={messagesPerField.existsError("password")}
                                    className={cn(
                                        inputClassName,
                                        messagesPerField.existsError("password") && "border border-red-500"
                                    )}
                                />
                                {messagesPerField.existsError("password") && (
                                    <p className="text-sm text-red-600">{messagesPerField.get("password")}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    id="password-confirm"
                                    name="password-confirm"
                                    placeholder={msgStr("passwordConfirm")}
                                    autoComplete="new-password"
                                    aria-invalid={messagesPerField.existsError("password-confirm")}
                                    className={cn(
                                        inputClassName,
                                        messagesPerField.existsError("password-confirm") && "border border-red-500"
                                    )}
                                />
                                {messagesPerField.existsError("password-confirm") && (
                                    <p className="text-sm text-red-600">{messagesPerField.get("password-confirm")}</p>
                                )}
                            </div>
                        </>
                    )}

                    {recaptchaRequired && (
                        <div className="flex justify-center">
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} />
                        </div>
                    )}

                    <button type="submit" className={primaryButtonClassName}>
                        {msgStr("doRegister")}
                    </button>
                </form>

                {(() => {
                    const providers = socialProviders?.length
                        ? socialProviders
                        : getFallbackSocialProviders();
                    return providers.length > 0 ? (
                        <SocialLoginButtons
                            providers={providers}
                            dividerLabel={msgStr("orSeparator") || "Veya"}
                            getButtonLabel={(displayName) =>
                                msgStr("continueWithProvider")?.replace("{{provider}}", displayName) || `${displayName} ile devam edin`
                            }
                        />
                    ) : null;
                })()}

                <p className="text-center text-sm text-gray-500 pt-2">
                    {msg("backToLogin")}{" "}
                    <Link href={url.loginUrl} className="text-black font-medium">
                        {msg("doLogIn")}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}

