import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@merge/ui/components/button";

export default function LinkIdpAction(
    props: PageProps<Extract<KcContext, { pageId: "link-idp-action.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, idpDisplayName } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("linkIdpActionTitle", idpDisplayName)}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {msg("linkIdpActionMessage", idpDisplayName)}
                </p>

                <form action={url.loginAction} method="post" className="pt-2">
                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            name="continue"
                            id="kc-continue"
                            size="lg"
                            className="w-full"
                        >
                            {msgStr("doContinue")}
                        </Button>
                        <Button
                            type="submit"
                            name="cancel-aia"
                            id="kc-cancel"
                            value="true"
                            variant="secondary"
                            size="lg"
                            className="w-full"
                        >
                            {msgStr("doCancel")}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
