import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge/ui/components/button";

export default function LoginIdpLinkConfirmOverride(
    props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm-override.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, idpDisplayName } = kcContext;

    const { msg } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("confirmOverrideIdpTitle")}
                </h1>

                <div className="text-sm text-muted-foreground">
                    <p>
                        {msg("pageExpiredMsg1")}{" "}
                        <a href={url.loginRestartFlowUrl} className="text-primary hover:underline font-medium">
                            {msg("doClickHere")}
                        </a>
                    </p>
                </div>

                <form id="kc-register-form" action={url.loginAction} method="post" className="pt-2">
                    <Button
                        type="submit"
                        name="submitAction"
                        value="confirmOverride"
                        size="lg"
                        className="w-full"
                    >
                        {msg("confirmOverrideIdpContinue", idpDisplayName)}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
