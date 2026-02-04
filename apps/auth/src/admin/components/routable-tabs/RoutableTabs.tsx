import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import {
    Children,
    JSXElementConstructor,
    ReactElement,
    isValidElement
} from "react";
import {
    Link,
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

type TabChildProps = { eventKey: string; title: React.ReactNode; children?: React.ReactNode; id?: string; "data-testid"?: string };
type ChildElement = ReactElement<TabChildProps, JSXElementConstructor<TabChildProps>>;
type Child = ChildElement | boolean | null | undefined;

type RoutableTabsProps = {
    children: Child | Child[];
    defaultLocation?: Partial<Path>;
    isBox?: boolean;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
    "data-testid"?: string;
};

export const RoutableTabs = ({
    children,
    defaultLocation,
    isBox = false,
    ...rest
}: RoutableTabsProps) => {
    const { pathname } = useLocation();
    const params = useParams();
    const { componentTypes } = useServerInfo();
    const tabs = componentTypes?.[TAB_PROVIDER] || [];
    const isFeatureEnabled = useIsFeatureEnabled();
    const { t } = useTranslation();

    const matchedTabs = tabs
        .filter(tab => matchPath({ path: tab.metadata.path }, pathname))
        .map(t => ({
            ...t,
            pathname: generatePath(t.metadata.path, {
                ...params,
                ...t.metadata.params
            })
        }));

    const tabChildren = Children.toArray(children).filter(
        (child): child is ChildElement => isValidElement(child) && typeof (child.props as TabChildProps).eventKey === "string"
    );
    const eventKeys = tabChildren.map(c => (c.props as TabChildProps).eventKey.toString());

    const exactMatch = eventKeys.find(eventKey => eventKey === decodeURI(pathname));
    const nearestMatch = eventKeys
        .filter(eventKey => pathname.includes(eventKey))
        .sort((a, b) => a.length - b.length)
        .pop();

    const activeValue = exactMatch ?? nearestMatch ?? defaultLocation?.pathname ?? pathname;

    return (
        <Tabs value={activeValue} className={isBox ? "w-full" : ""} {...rest}>
            <TabsList className={isBox ? "w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-0" : ""} variant={isBox ? "line" : "default"}>
                {tabChildren.map(child => {
                    const { eventKey, title, id, "data-testid": dataTestId } = child.props as TabChildProps;
                    return (
                        <TabTriggerLink key={eventKey} eventKey={eventKey} id={id} data-testid={dataTestId}>
                            {title}
                        </TabTriggerLink>
                    );
                })}
                {isFeatureEnabled(Feature.DeclarativeUI) &&
                    matchedTabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.pathname} asChild>
                            <Link to={tab.pathname}>{t(tab.id)}</Link>
                        </TabsTrigger>
                    ))}
            </TabsList>
            {tabChildren.map(child => {
                const { eventKey, children: tabContent } = child.props as TabChildProps;
                return (
                    <TabsContent key={eventKey} value={eventKey} className="mt-2 focus-visible:outline-none">
                        {tabContent}
                    </TabsContent>
                );
            })}
            {isFeatureEnabled(Feature.DeclarativeUI) &&
                matchedTabs.map(tab => (
                    <TabsContent key={tab.id} value={tab.pathname} className="mt-2 focus-visible:outline-none">
                        <PageHandler page={tab} providerType={TAB_PROVIDER} />
                    </TabsContent>
                ))}
        </Tabs>
    );
};

function TabTriggerLink({ eventKey, children, id, "data-testid": dataTestId }: { eventKey: string; children: React.ReactNode; id?: string; "data-testid"?: string }) {
    const href = useHref({ pathname: eventKey });
    return (
        <TabsTrigger value={eventKey} asChild id={id} data-testid={dataTestId}>
            <Link to={href}>{children}</Link>
        </TabsTrigger>
    );
}

export const useRoutableTab = (to: Partial<Path>) => ({
    eventKey: to.pathname ?? "",
    href: useHref(to)
});

/** Placeholder for RoutableTabs: pass eventKey, title, children. Content is rendered by RoutableTabs. */
export const Tab = (_props: TabChildProps & { children?: React.ReactNode }) => null;
