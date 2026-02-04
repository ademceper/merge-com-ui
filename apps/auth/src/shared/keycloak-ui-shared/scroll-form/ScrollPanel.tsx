// See: https://github.com/i18next/react-i18next/issues/1543
import { HTMLProps } from "react";
import { cn } from "@merge/ui/lib/utils";
import { FormTitle } from "./FormTitle";

type ScrollPanelProps = Omit<HTMLProps<HTMLFormElement>, "children"> & {
    title: string;
    scrollId: string;
    children?: React.ReactNode;
};

export const ScrollPanel = (props: ScrollPanelProps) => {
    const { title, children, scrollId, className, ...rest } = props;
    return (
        <section {...rest} className={cn("mt-8", className)}>
            <FormTitle id={scrollId} title={title} className="mb-4" />
            {children}
        </section>
    );
};
