/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/scroll-form/ScrollForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Fragment, ReactNode, useMemo } from "react";
import { FormPanel } from "./FormPanel";
import { ScrollPanel } from "./ScrollPanel";

import style from "./scroll-form.module.css";

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
};

const spacesToHyphens = (string: string): string => {
    return string.replace(/\s+/g, "-");
};

export const ScrollForm = ({
    label,
    sections,
    borders = false,
    className
}: ScrollFormProps) => {
    const shownSections = useMemo(
        () => sections.filter(({ isHidden }) => !isHidden),
        [sections]
    );

    return (
        <div className={className ?? "grid grid-cols-1 gap-4 md:grid-cols-12"}>
            <div className="md:col-span-8">
                {shownSections.map(({ title, panel }) => {
                    const scrollId = spacesToHyphens(title.toLowerCase());

                    return (
                        <Fragment key={title}>
                            {borders ? (
                                <FormPanel
                                    scrollId={scrollId}
                                    title={title}
                                    className={style.panel}
                                >
                                    {panel}
                                </FormPanel>
                            ) : (
                                <ScrollPanel scrollId={scrollId} title={title}>
                                    {panel}
                                </ScrollPanel>
                            )}
                        </Fragment>
                    );
                })}
            </div>
            <div className={style.sticky + " md:order-1 md:col-span-4"}>
                <nav aria-label={label} className="flex flex-col gap-1">
                    {shownSections.map(({ title }) => {
                        const scrollId = spacesToHyphens(title.toLowerCase());

                        return (
                            <button
                                key={title}
                                type="button"
                                className="text-primary hover:underline text-left text-sm"
                                onClick={() => {
                                    const element = document.getElementById(scrollId);
                                    if (element) {
                                        element.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start"
                                        });
                                    }
                                }}
                                data-testid={`jump-link-${scrollId}`}
                            >
                                {title}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
