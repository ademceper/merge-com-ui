import { ClientSelect } from "../../components/client/client-select";
import { ComponentProps } from "../../components/dynamic/components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} clientKey="id" />
);
