import { cn } from "@merge/ui/lib/utils";

type FormTitleProps = {
    id?: string;
    title: string;
    headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    size?: "lg" | "xl" | "2xl" | "3xl";
    className?: string;
};

const sizeClass: Record<string, string> = {
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
};

export const FormTitle = ({
    id,
    title,
    headingLevel = "h2",
    size = "lg",
    className,
    ...rest
}: FormTitleProps) => {
    const Tag = headingLevel;
    return (
        <Tag
            className={cn("font-semibold text-foreground", sizeClass[size] || sizeClass.lg, className)}
            id={id}
            tabIndex={0}
            {...rest}
        >
            {title}
        </Tag>
    );
};
