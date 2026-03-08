import { ArrowSquareOut } from "@phosphor-icons/react";
import type { AnchorHTMLAttributes } from "react";

const linkStyle = {
    textDecoration: "underline",
    textDecorationColor: "transparent"
} as const;

type FormattedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    isInline?: boolean;
};

export const FormattedLink = ({ title, href, isInline, ...rest }: FormattedLinkProps) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            style={linkStyle}
            className={isInline ? "pf-m-link pf-m-inline" : ""}
            {...rest}
        >
            {title ? title : href}{" "}
            {href?.startsWith("http") && <ArrowSquareOut className="size-4 inline" />}
        </a>
    );
};
