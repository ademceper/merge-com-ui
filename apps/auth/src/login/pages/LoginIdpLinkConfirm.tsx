import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";

export default function LoginIdpLinkConfirm(
    props: PageProps<Extract<KcContext, { pageId: "login-idp-link-confirm.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, idpAlias } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("confirmLinkIdpTitle")}
                </h1>

                <Alert variant="default" className="rounded-lg border-border bg-muted text-foreground">
                    <AlertDescription>
                        {msg("confirmLinkIdpReviewProfile")}
                    </AlertDescription>
                </Alert>

                <form id="kc-register-form" action={url.loginAction} method="post" className="pt-2">
                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            name="submitAction"
                            value="updateProfile"
                            size="lg"
                            variant="secondary"
                            className="w-full"
                        >
                            {msgStr("confirmLinkIdpReviewProfile")}
                        </Button>
                        <Button
                            type="submit"
                            name="submitAction"
                            value="linkAccount"
                            size="lg"
                            className="w-full"
                        >
                            {msg("confirmLinkIdpContinue", idpAlias)}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
