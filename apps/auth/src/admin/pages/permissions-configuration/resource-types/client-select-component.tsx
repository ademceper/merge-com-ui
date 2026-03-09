import { ClientSelect } from "@/admin/shared/ui/client/client-select";
import type { ComponentProps } from "@/admin/shared/ui/dynamic/components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} clientKey="id" />
);
