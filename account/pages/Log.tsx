import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Card, CardContent } from "@merge/ui/components/card";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Badge } from "@merge/ui/components/badge";

export default function Log(props: PageProps<Extract<KcContext, { pageId: "log.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { log, message } = kcContext;

    const { msg } = i18n;

    const formatDate = (timestamp: number | string | Date) => {
        return new Date(timestamp).toLocaleString();
    };

    const getEventVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
        if (eventType.includes("LOGIN")) return "default";
        if (eventType.includes("LOGOUT")) return "secondary";
        if (eventType.includes("ERROR") || eventType.includes("FAILED")) return "destructive";
        return "outline";
    };

    return (
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
                                            <Badge variant={getEventVariant(event.event)} className="text-xs">
                                                {event.event}
                                            </Badge>
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
    );
}
