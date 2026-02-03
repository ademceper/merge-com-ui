/**
 * Sayfa seviyesinde tablar yerine açılır/kapanır sidebar kullanır.
 * RoutableTabs ile aynı API: Tab children (eventKey, title, children).
 */

/* eslint-disable */
// @ts-nocheck

import { Tabs, TabsContent } from "@merge/ui/components/tabs";
import { Button } from "@merge/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@merge/ui/components/sheet";
import {
    Children,
    JSXElementConstructor,
    ReactElement,
    isValidElement,
    useState
} from "react";
import {
    NavLink,
    Path,
    generatePath,
    matchPath,
    useHref,
    useLocation,
    useParams
} from "react-router-dom";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { PageHandler } from "../../page/PageHandler";
import { TAB_PROVIDER } from "../../page/constants";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { useTranslation } from "react-i18next";
import { ListIcon } from "@phosphor-icons/react";
import { cn } from "@merge/ui/lib/utils";

type TabChildProps = {
    eventKey: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    id?: string;
    isHidden?: boolean;
    "data-testid"?: string;
};
type ChildElement = ReactElement<TabChildProps, JSXElementConstructor<TabChildProps>>;
type Child = ChildElement | boolean | null | undefined;

type RoutableSidebarProps = {
    children: Child | Child[];
    defaultLocation?: Partial<Path>;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
    "data-testid"?: string;
    /** Sidebar varsayılan açık mı (desktop) */
    defaultSidebarOpen?: boolean;
};

const SIDEBAR_WIDTH = "14rem";

export const RoutableSidebar = ({
    children,
    defaultLocation,
    defaultSidebarOpen = true,
    ...rest
}: RoutableSidebarProps) => {
    const { pathname } = useLocation();
    const params = useParams();
    const { componentTypes } = useServerInfo();
    const tabs = componentTypes?.[TAB_PROVIDER] || [];
    const isFeatureEnabled = useIsFeatureEnabled();
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
    const [sheetOpen, setSheetOpen] = useState(false);

    const matchedTabs = tabs
        .filter((tab) => matchPath({ path: tab.metadata.path }, pathname))
        .map((t) => ({
            ...t,
            pathname: generatePath(t.metadata.path, {
                ...params,
                ...t.metadata.params
            })
        }));

    const tabChildren = Children.toArray(children).filter(
        (child): child is ChildElement =>
            isValidElement(child) && typeof (child.props as TabChildProps).eventKey === "string"
    );
    const visibleTabChildren = tabChildren.filter(
        (c) => !(c.props as TabChildProps).isHidden
    );
    const eventKeys = tabChildren.map((c) => (c.props as TabChildProps).eventKey.toString());

    const exactMatch = eventKeys.find((eventKey) => eventKey === decodeURI(pathname));
    const nearestMatch = eventKeys
        .filter((eventKey) => pathname.includes(eventKey))
        .sort((a, b) => a.length - b.length)
        .pop();

    const activeValue = exactMatch ?? nearestMatch ?? defaultLocation?.pathname ?? pathname;

    const navLinks = (
        <>
            {visibleTabChildren.map((child) => {
                const { eventKey, title, id, "data-testid": dataTestId } = child.props as TabChildProps;
                const isActive = activeValue === eventKey;
                return (
                    <li key={eventKey}>
                        <NavLink
                            to={eventKey}
                            id={id}
                            data-testid={dataTestId}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                                "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                        >
                            {title}
                        </NavLink>
                    </li>
                );
            })}
            {isFeatureEnabled(Feature.DeclarativeUI) &&
                matchedTabs.map((tab) => (
                    <li key={tab.id}>
                        <NavLink
                            to={tab.pathname}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                                "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                                activeValue === tab.pathname
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                        >
                            {t(tab.id)}
                        </NavLink>
                    </li>
                ))}
        </>
    );

    return (
        <div className="flex w-full flex-1 gap-0" data-testid={rest["data-testid"]}>
            {/* Mobil: Sheet ile açılan menü */}
            <div className="flex md:hidden shrink-0">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Menüyü aç">
                            <ListIcon className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[var(--sidebar-width)] p-0" style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}>
                        <nav className="flex flex-col gap-1 p-3">
                            <ul className="flex flex-col gap-0.5">{navLinks}</ul>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop: Toggle + Açılır/kapanır sidebar panel */}
            <div className="hidden md:flex shrink-0 items-stretch border-r bg-sidebar">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen((o) => !o)}
                    aria-label={sidebarOpen ? "Sidebarı kapat" : "Sidebarı aç"}
                    className="h-auto rounded-none border-r shrink-0"
                >
                    <ListIcon className={cn("size-5 transition-transform", !sidebarOpen && "rotate-180")} />
                </Button>
                <aside
                    className={cn(
                        "flex flex-col text-sidebar-foreground transition-[width] duration-200 overflow-hidden",
                        sidebarOpen ? "w-[var(--page-sidebar-width)]" : "w-0 min-w-0 overflow-hidden"
                    )}
                    style={{ "--page-sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
                >
                    {sidebarOpen && (
                        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto p-3">
                            <ul className="flex flex-col gap-0.5">{navLinks}</ul>
                        </nav>
                    )}
                </aside>
            </div>

            {/* İçerik alanı */}
            <div className="min-w-0 flex-1">
                <Tabs value={activeValue} className="h-full w-full">
                    {tabChildren.map((child) => {
                        const { eventKey, children: tabContent } = child.props as TabChildProps;
                        return (
                            <TabsContent
                                key={eventKey}
                                value={eventKey}
                                className="mt-0 h-full focus-visible:outline-none"
                            >
                                {tabContent}
                            </TabsContent>
                        );
                    })}
                    {isFeatureEnabled(Feature.DeclarativeUI) &&
                        matchedTabs.map((tab) => (
                            <TabsContent
                                key={tab.id}
                                value={tab.pathname}
                                className="mt-0 h-full focus-visible:outline-none"
                            >
                                <PageHandler page={tab} providerType={TAB_PROVIDER} />
                            </TabsContent>
                        ))}
                </Tabs>
            </div>
        </div>
    );
};

export const useRoutableTab = (to: Partial<Path>) => ({
    eventKey: to.pathname ?? "",
    href: useHref(to)
});

/** RoutableSidebar ile kullanılır: eventKey, title, children (isHidden opsiyonel). */
export const Tab = (_props: TabChildProps & { children?: React.ReactNode }) => null;
