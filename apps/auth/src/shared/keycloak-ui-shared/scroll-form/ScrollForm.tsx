import { ReactNode, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { FormPanel } from "./FormPanel";

export const mainPageContentId = "kc-main-content-page-container";

type ScrollSection = {
    title: string;
    panel: ReactNode;
    isHidden?: boolean;
};

type ScrollFormProps = {
    label: string;
    sections: ScrollSection[];
    borders?: boolean;
    className?: string;
    /** Her sekmeden erişilebilir, sayfanın altında sabit gösterilecek aksiyonlar (örn. Kaydet / Geri al) */
    actions?: ReactNode;
};

const spacesToHyphens = (string: string): string => {
    return string.replace(/\s+/g, "-");
};

export const ScrollForm = ({
    label,
    sections,
    borders = false,
    className,
    actions
}: ScrollFormProps) => {
    const shownSections = useMemo(
        () => sections.filter(({ isHidden }) => !isHidden),
        [sections]
    );

    const [activeTab, setActiveTab] = useState(shownSections[0]?.title ?? "");

    if (shownSections.length === 0) return null;

    return (
        <div className={className ?? "space-y-4"}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList
                    variant="line"
                    className="w-full flex-wrap justify-start gap-0 h-auto p-0 bg-transparent border-b border-border rounded-none"
                    aria-label={label}
                >
                    {shownSections.map(({ title }) => (
                        <TabsTrigger
                            key={title}
                            value={title}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                        >
                            {title}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {shownSections.map(({ title, panel }, index) => (
                    <TabsContent
                        key={title}
                        value={title}
                        className="mt-4 focus-visible:outline-none"
                    >
                        {borders ? (
                            <FormPanel
                                scrollId={spacesToHyphens(title.toLowerCase())}
                                title={title}
                                className={index === 0 ? "" : "mt-8"}
                            >
                                {panel}
                            </FormPanel>
                        ) : (
                            <section
                                id={spacesToHyphens(title.toLowerCase())}
                                className={index === 0 ? "" : "mt-6"}
                            >
                                {panel}
                            </section>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
            {actions && <div className="mt-6 flex shrink-0 justify-end">{actions}</div>}
        </div>
    );
};
