import { ClientSelect } from "../../../shared/ui/client/client-select";
import type { ComponentProps } from "../../../shared/ui/dynamic/components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} clientKey="id" />
);
