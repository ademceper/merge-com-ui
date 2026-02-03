import * as React from "react";
import { cn } from "../lib/utils";

/** Link: alt çizgi animasyonu + ok ikonu (mobilde her zaman, masaüstünde hover'da). */
export function Link({
    children,
    href,
    className,
    tabIndex,
    target,
    rel,
}: {
    children: React.ReactNode;
    href: string;
    className?: string;
    tabIndex?: number;
    target?: string;
    rel?: string;
}) {
    return (
        <a
            href={href}
            tabIndex={tabIndex}
            target={target}
            rel={rel}
            className={cn(
                "group relative inline-flex items-center text-current",
                "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
                "before:origin-left before:scale-x-100 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
                "sm:before:origin-right sm:before:scale-x-0 sm:hover:before:origin-left sm:hover:before:scale-x-100",
                className
            )}
        >
            {children}
            <svg
                className="ml-[0.3em] mt-[0em] size-[0.55em] translate-y-0 opacity-100 transition-all duration-300 [motion-reduce:transition-none] sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 motion-reduce:transition-none"
                fill="none"
                viewBox="0 0 10 10"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </a>
    );
}
