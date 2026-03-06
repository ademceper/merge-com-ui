import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kc-context";
import type { I18n } from "../i18n";
import AuthLayout from "../components/auth-layout";
import { Link } from "@merge-rd/ui/components/link";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { message, client, skipLink } = kcContext;

    const { msg } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{msg("errorTitle")}</h1>

                <Alert variant={message.type === "error" ? "destructive" : "default"} className="rounded-lg">
                    <AlertDescription dangerouslySetInnerHTML={{ __html: message.summary }} />
                </Alert>

                {!skipLink && client?.baseUrl && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                        <Link href={client.baseUrl} className="text-foreground font-medium">
                            {msg("backToApplication")}
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
