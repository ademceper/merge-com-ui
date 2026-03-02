import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge/ui/components/button";

export default function LoginIdpLinkEmail(
    props: PageProps<Extract<KcContext, { pageId: "login-idp-link-email.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, brokerContext, idpAlias } = kcContext;

    const { msg } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("emailLinkIdpTitle", idpAlias)}
                </h1>

                <div className="space-y-3 text-sm text-muted-foreground">
                    <p id="instruction1">
                        {msg("emailLinkIdp1", idpAlias, brokerContext.username ?? "")}
                    </p>
                    <p id="instruction2">
                        {msg("emailLinkIdp2")}{" "}
                        <a href={url.loginAction} className="text-primary hover:underline font-medium">
                            {msg("doClickHere")}
                        </a>{" "}
                        {msg("emailLinkIdp3")}
                    </p>
                    <p id="instruction3">
                        {msg("emailLinkIdp4")}{" "}
                        <a href={url.loginAction} className="text-primary hover:underline font-medium">
                            {msg("doClickHere")}
                        </a>{" "}
                        {msg("emailLinkIdp5")}
                    </p>
                </div>

                <div className="pt-2">
                    <Button variant="secondary" size="lg" className="w-full" asChild>
                        <a href={url.loginRestartFlowUrl}>{msg("backToLogin")}</a>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
