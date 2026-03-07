import { ClientSelect } from "../../../shared/ui/client/client-select";
import { ComponentProps } from "../../../shared/ui/dynamic/components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} clientKey="id" />
);
