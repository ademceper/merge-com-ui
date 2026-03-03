import * as React from "react";
import { Badge as MergeBadge, badgeVariants } from "@merge/ui/components/badge";
import type { VariantProps } from "class-variance-authority";

export { badgeVariants };

export type BadgeRootProps = React.ComponentProps<typeof MergeBadge>;

export function Badge({
  children,
  ...props
}: BadgeRootProps) {
  return <MergeBadge {...props}>{children}</MergeBadge>;
}

export function BadgeIcon({
  as: Icon,
  className,
  ...props
}: {
  as: React.ComponentType<{ className?: string } & Record<string, unknown>>;
  className?: string;
} & Record<string, unknown>) {
  return <Icon data-icon="inline-start" className={className} {...props} />;
}
