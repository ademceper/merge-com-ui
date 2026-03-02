import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Link } from "@merge/ui/components/link";
import { Alert, AlertDescription } from "@merge/ui/components/alert";

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { advancedMsgStr, msg } = i18n;

    const { messageHeader, message, requiredActions, skipLink, pageRedirectUri, actionUri, client } = kcContext;

    const headerText = messageHeader ? advancedMsgStr(messageHeader) : message.summary;

    const bodyHtml = (() => {
        let html = message.summary?.trim() ?? "";
        if (requiredActions) {
            html += " <b>" + requiredActions.map(ra => advancedMsgStr(`requiredAction.${ra}`)).join(", ") + "</b>";
        }
        return html;
    })();

    const linkHref = pageRedirectUri ?? actionUri ?? client.baseUrl;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1
                    className="text-xl font-semibold text-foreground tracking-tight"
                    dangerouslySetInnerHTML={{ __html: headerText }}
                />

                <Alert variant="default" className="rounded-lg">
                    <AlertDescription dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                </Alert>

                {!skipLink && linkHref && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                        <Link href={linkHref} className="text-foreground font-medium">
                            {msg("backToApplication")}
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
