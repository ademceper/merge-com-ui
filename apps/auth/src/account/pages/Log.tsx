import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AccountLayout from "../components/AccountLayout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, ShieldCheck, Key, UserCog, Globe } from "lucide-react";

export default function Log(props: PageProps<Extract<KcContext, { pageId: "log.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, log, message } = kcContext;

    const { msg } = i18n;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getEventIcon = (eventType: string) => {
        if (eventType.includes("LOGIN")) return <LogIn className="h-4 w-4" />;
        if (eventType.includes("LOGOUT")) return <LogOut className="h-4 w-4" />;
        if (eventType.includes("PASSWORD")) return <Key className="h-4 w-4" />;
        if (eventType.includes("UPDATE")) return <UserCog className="h-4 w-4" />;
        return <ShieldCheck className="h-4 w-4" />;
    };

    const getEventVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
        if (eventType.includes("LOGIN")) return "default";
        if (eventType.includes("LOGOUT")) return "secondary";
        if (eventType.includes("ERROR") || eventType.includes("FAILED")) return "destructive";
        return "outline";
    };

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="log.ftl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">{msg("logTitle")}</h3>
                    <p className="text-sm text-muted-foreground">{msg("logDescription")}</p>
                </div>
                <Separator />

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                {/* Activity Log */}
                {log?.events && log.events.length > 0 ? (
                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Event
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            {msg("date")}
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            {msg("client")}
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            <Globe className="inline h-3 w-3 mr-1" />
                                            IP Address
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            {msg("details")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.events.map((event, index) => (
                                        <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded bg-primary/10">
                                                        {getEventIcon(event.event)}
                                                    </div>
                                                    <Badge variant={getEventVariant(event.event)} className="text-xs">
                                                        {event.event}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-sm">{formatDate(event.date)}</div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-sm">{event.client || "-"}</div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-sm font-mono">{event.ipAddress || "-"}</div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {event.details && event.details.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {event.details.map((detail, detailIndex) => (
                                                            <span key={detailIndex} className="text-xs text-muted-foreground">
                                                                {detail.key}: {detail.value}
                                                                {detailIndex < event.details.length - 1 && ","}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No activity logs found
                        </CardContent>
                    </Card>
                )}
            </div>
        </AccountLayout>
    );
}

