import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge/ui/components/button";

export default function Terms(
    props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;
    const { url } = kcContext;
    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("termsTitle")}
                </h1>

                <div
                    id="kc-terms-text"
                    className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground max-h-[50vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline"
                >
                    {msg("termsText")}
                </div>

                <form
                    id="kc-terms-form"
                    action={url.loginAction}
                    method="post"
                    className="flex flex-col gap-3"
                >
                    <Button
                        type="submit"
                        name="accept"
                        id="kc-accept"
                        size="lg"
                        className="w-full"
                    >
                        {msgStr("doAccept")}
                    </Button>
                    <Button
                        type="submit"
                        name="cancel"
                        id="kc-decline"
                        variant="outline"
                        size="lg"
                        className="w-full"
                    >
                        {msgStr("doDecline")}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
