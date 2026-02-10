import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@merge/ui/components/collapsible";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import { CaretDown, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";

export const ProviderInfo = () => {
    const { t } = useTranslation();
    const serverInfo = useServerInfo();
    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState<string[]>([]);

    const providerInfo = useMemo(
        () =>
            Object.entries(serverInfo.providers || []).filter(([key]) =>
                key.toLowerCase().includes(filter.toLowerCase())
            ),
        [filter]
    );

    return (
        <div className="bg-muted/30 p-4">
            <div className="mb-4 flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                <Input
                    data-testid="table-search-input"
                    placeholder={t("search")}
                    aria-label={t("search")}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
            </div>
                <Table className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[20%]">{t("spi")}</TableHead>
                            <TableHead>{t("providers")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providerInfo.map(([name, { providers }]) => (
                            <TableRow key={name}>
                                <TableCell>{name}</TableCell>
                                <TableCell>
                                    <ul className="list-none space-y-1">
                                        {Object.entries(providers).map(
                                            ([key, { operationalInfo }]) => (
                                                <li key={key}>
                                                    {key}
                                                    {operationalInfo ? (
                                                        <Collapsible
                                                            open={open.includes(key)}
                                                            onOpenChange={(isOpen) => {
                                                                if (isOpen) setOpen([...open, key]);
                                                                else setOpen(open.filter((x: string) => x !== key));
                                                            }}
                                                        >
                                                            <CollapsibleTrigger asChild>
                                                                <Button
                                                                    variant="link"
                                                                    className="h-auto p-0 text-xs"
                                                                >
                                                                    {open.includes(key) ? (
                                                                        <CaretDown className="mr-1 size-3" />
                                                                    ) : (
                                                                        <CaretRight className="mr-1 size-3" />
                                                                    )}
                                                                    {open.includes(key)
                                                                        ? t("showLess")
                                                                        : t("showMore")}
                                                                </Button>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <Table className="mt-2 border-0 text-sm">
                                                                    <TableBody>
                                                                        {Object.entries(
                                                                            operationalInfo
                                                                        ).map(
                                                                            ([
                                                                                k,
                                                                                value
                                                                            ]) => (
                                                                                <TableRow key={k}>
                                                                                    <TableCell className="border-0 py-0.5">
                                                                                        {k}
                                                                                    </TableCell>
                                                                                    <TableCell className="border-0 py-0.5">
                                                                                        {String(value)}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    ) : null}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
        </div>
    );
};
