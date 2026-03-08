import { Card, CardHeader } from "@merge-rd/ui/components/card";
import type React from "react";
import { type KeyboardEvent, useId } from "react";

type ClickableCardProps = React.HTMLAttributes<HTMLDivElement> & {
    onClick: () => void;
};

export const ClickableCard = ({ onClick, children, ...rest }: ClickableCardProps) => {
    const id = useId();
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " || e.key === "Enter" || e.key === "Spacebar") {
            onClick();
        }
    };
    return (
        <Card
            id={id}
            className="cursor-pointer"
            onKeyDown={onKeyDown}
            onClick={onClick}
            {...rest}
        >
            <CardHeader>{children}</CardHeader>
        </Card>
    );
};
