import { Card, CardContent, CardHeader, CardTitle } from "@merge/ui/components/card";
import { PropsWithChildren, useId } from "react";
import { FormTitle } from "./FormTitle";

type FormPanelProps = {
    title: string;
    scrollId?: string;
    className?: string;
};

export const FormPanel = ({
    title,
    children,
    scrollId,
    className
}: PropsWithChildren<FormPanelProps>) => {
    const id = useId();

    return (
        <Card id={id} className={className}>
            <CardHeader>
                <CardTitle tabIndex={0}>
                    <FormTitle id={scrollId} title={title} />
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
};
