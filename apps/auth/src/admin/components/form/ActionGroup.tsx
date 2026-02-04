import { ReactNode } from "react";

type ActionGroupProps = {
    children: ReactNode;
};

export const ActionGroup = ({ children }: ActionGroupProps) => (
    <div className="flex gap-2">{children}</div>
);
