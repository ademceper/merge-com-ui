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

import { Fragment, ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@merge/ui/lib/utils";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { FormPanel } from "./FormPanel";
import { ScrollPanel } from "./ScrollPanel";

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

    const [activeSection, setActiveSection] = useState<string>("");
    const [activeIndex, setActiveIndex] = useState(0);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tocNavRef = useRef<HTMLDivElement>(null);
    const [svgHeight, setSvgHeight] = useState(200);

    // Measure TOC nav height for SVG
    useEffect(() => {
        if (tocNavRef.current) {
            const height = tocNavRef.current.offsetHeight;
            setSvgHeight(height > 0 ? height : 200);
        }
    }, [shownSections]);

    // Scroll progress for tracing beam animation
    const { scrollYProgress } = useScroll({
        container: scrollContainerRef,
    });

    const y1 = useSpring(
        useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
        { stiffness: 500, damping: 90 }
    );
    const y2 = useSpring(
        useTransform(scrollYProgress, [0, 1], [50, svgHeight - 50]),
        { stiffness: 500, damping: 90 }
    );

    useEffect(() => {
        const sectionIds = shownSections.map(({ title }) =>
            spacesToHyphens(title.toLowerCase())
        );

        // Always set first section as default
        if (sectionIds.length > 0) {
            setActiveSection(sectionIds[0]);
            setActiveIndex(0);
        }

        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    // Find the first intersecting entry from top
                    const visibleEntries = entries
                        .filter(entry => entry.isIntersecting)
                        .sort((a, b) => {
                            const aTop = a.boundingClientRect.top;
                            const bTop = b.boundingClientRect.top;
                            return aTop - bTop;
                        });

                    if (visibleEntries.length > 0) {
                        const topEntry = visibleEntries[0];
                        setActiveSection(topEntry.target.id);
                        const idx = sectionIds.indexOf(topEntry.target.id);
                        if (idx !== -1) setActiveIndex(idx);
                    }
                },
                {
                    root: scrollContainer,
                    rootMargin: "0px 0px -70% 0px",
                    threshold: 0.1
                }
            );

            sectionIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    observerRef.current?.observe(element);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            observerRef.current?.disconnect();
        };
    }, [shownSections]);

    const handleNavClick = (scrollId: string) => {
        const element = document.getElementById(scrollId);
        const scrollContainer = scrollContainerRef.current;
        if (element && scrollContainer) {
            const elementTop = element.offsetTop - scrollContainer.offsetTop;
            scrollContainer.scrollTo({
                top: elementTop - 20,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className={className ?? "flex gap-10 h-[calc(100vh-20rem)] min-h-[400px]"}>
            {/* Scrollable Content */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            >
                {shownSections.map(({ title, panel }, index) => {
                    const scrollId = spacesToHyphens(title.toLowerCase());

                    return (
                        <Fragment key={title}>
                            {borders ? (
                                <FormPanel
                                    scrollId={scrollId}
                                    title={title}
                                    className={index === 0 ? "" : "mt-8"}
                                >
                                    {panel}
                                </FormPanel>
                            ) : (
                                <ScrollPanel
                                    scrollId={scrollId}
                                    title={title}
                                    className={index === 0 ? "mt-0" : undefined}
                                >
                                    {panel}
                                </ScrollPanel>
                            )}
                        </Fragment>
                    );
                })}
                {/* Bottom padding for scroll */}
                <div className="h-32" />
            </div>

            {/* Fixed TOC Sidebar with Tracing Beam */}
            <div className="hidden md:block w-64 shrink-0">
                <div className="sticky top-0">
                    <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4 ml-10">
                        {label}
                    </span>

                    <div className="relative" ref={tocNavRef}>
                        {/* Tracing Beam - Start Dot */}
                        <div className="absolute left-0 -top-1">
                            <motion.div
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background shadow-sm"
                                animate={{
                                    boxShadow: activeIndex === 0
                                        ? "0 0 0 4px hsl(var(--primary) / 0.15)"
                                        : "none"
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    className="h-2.5 w-2.5 rounded-full border"
                                    animate={{
                                        backgroundColor: activeIndex === 0 ? "hsl(var(--primary))" : "transparent",
                                        borderColor: activeIndex === 0 ? "hsl(var(--primary))" : "hsl(var(--border))"
                                    }}
                                    transition={{ duration: 0.2 }}
                                />
                            </motion.div>
                        </div>

                        {/* Tracing Beam - SVG Line */}
                        <svg
                            viewBox={`0 0 20 ${svgHeight}`}
                            width="20"
                            height={svgHeight}
                            className="absolute left-0 top-4"
                            aria-hidden="true"
                        >
                            {/* Background path */}
                            <path
                                d={`M 10 0 V ${svgHeight}`}
                                fill="none"
                                stroke="hsl(var(--border))"
                                strokeWidth="2"
                                strokeOpacity="0.3"
                            />
                            {/* Animated gradient path */}
                            <motion.path
                                d={`M 10 0 V ${svgHeight}`}
                                fill="none"
                                stroke="url(#tocBeamGradient)"
                                strokeWidth="2"
                            />
                            <defs>
                                <motion.linearGradient
                                    id="tocBeamGradient"
                                    gradientUnits="userSpaceOnUse"
                                    x1="0"
                                    x2="0"
                                    y1={y1}
                                    y2={y2}
                                >
                                    <stop stopColor="#18CCFC" stopOpacity="0" />
                                    <stop stopColor="#18CCFC" />
                                    <stop offset="0.325" stopColor="#6344F5" />
                                    <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
                                </motion.linearGradient>
                            </defs>
                        </svg>

                        {/* Navigation items */}
                        <nav aria-label={label} className="relative ml-7 space-y-0.5">
                            {shownSections.map(({ title }) => {
                                const scrollId = spacesToHyphens(title.toLowerCase());
                                const isActive = activeSection === scrollId;

                                return (
                                    <motion.button
                                        key={title}
                                        type="button"
                                        className={cn(
                                            "relative flex items-center w-full text-left text-sm py-2 px-3 rounded-lg transition-all",
                                            isActive
                                                ? "text-foreground font-medium bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                        onClick={() => handleNavClick(scrollId)}
                                        data-testid={`jump-link-${scrollId}`}
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {title}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};
