import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Card, CardContent } from "@merge/ui/components/card";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Badge } from "@merge/ui/components/badge";
import { LinkIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export default function FederatedIdentity(props: PageProps<Extract<KcContext, { pageId: "federatedIdentity.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, federatedIdentity, message } = kcContext;

    const { msg } = i18n;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{msg("federatedIdentityTitle")}</h3>
                <p className="text-sm text-muted-foreground">{msg("federatedIdentityDescription")}</p>
            </div>
            <Separator />

            {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.summary}</AlertDescription>
                </Alert>
            )}

            {/* Identity Providers List */}
            {federatedIdentity?.identities && Object.keys(federatedIdentity.identities).length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(federatedIdentity.identities).map(([providerId, identity]) => {
                        const isConnected = identity.connected;
                        const providerDisplayName = identity.displayName || providerId;

                        return (
                            <div key={providerId} className="rounded-md border p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded shrink-0 ${isConnected ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                                            <LinkIcon className={`h-5 w-5 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <div className="text-base font-medium flex items-center gap-2 flex-wrap">
                                                {providerDisplayName}
                                                {isConnected ? (
                                                    <Badge variant="default" className="bg-green-600 text-xs">
                                                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                        Connected
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <XCircleIcon className="h-3 w-3 mr-1" />
                                                        {msg("notLinked")}
                                                    </Badge>
                                                )}
                                            </div>
                                            {isConnected && identity.userName && (
                                                <div className="text-sm text-muted-foreground">
                                                    Connected as: {identity.userName}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <form action={url.socialUrl} method="post" className="shrink-0">
                                        <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                        <input type="hidden" name="providerId" value={providerId} />
                                        {isConnected ? (
                                            <>
                                                <input type="hidden" name="action" value="remove" />
                                                <Button type="submit" variant="outline" size="sm">
                                                    {msg("removeProvider")}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <input type="hidden" name="action" value="add" />
                                                <Button type="submit" variant="default" size="sm">
                                                    {msg("addProvider")}
                                                </Button>
                                            </>
                                        )}
                                    </form>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No social providers configured
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
