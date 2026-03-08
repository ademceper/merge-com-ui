import { Link } from "@merge-rd/ui/components/link";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import AuthLayout from "../components/auth-layout";
import type { I18n } from "../i18n";
import type { KcContext } from "../kc-context";

export default function LoginPageExpired(
    props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("pageExpiredTitle")}
                </h1>

                <p className="text-sm text-muted-foreground space-y-2">
                    {msg("pageExpiredMsg1")}
                    <br />
                    <Link
                        href={url.loginRestartFlowUrl}
                        className="text-foreground font-medium no-underline hover:text-foreground"
                    >
                        {msgStr("pageExpiredRestartLogin")}
                    </Link>
                    <br />
                    {msg("pageExpiredMsg2")}{" "}
                    <Link
                        href={url.loginAction}
                        className="text-foreground font-medium no-underline hover:text-foreground"
                    >
                        {msgStr("pageExpiredContinueToApp")}
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
