import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@merge-rd/ui/lib/utils";
import { Button } from "@merge-rd/ui/components/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@merge-rd/ui/components/pagination";

type PaginationLinkProps = {
  to: string;
  isActive?: boolean;
  isDisabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
};

export function PaginationLink({
  to,
  isActive,
  isDisabled,
  size = "icon",
  className,
  children,
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(isDisabled && "pointer-events-none opacity-50", className)}
    >
      <Link
        to={to}
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        tabIndex={isDisabled ? -1 : undefined}
      >
        {children}
      </Link>
    </Button>
  );
}

export function PaginationPrevious({
  className,
  isDisabled,
  ...props
}: Omit<PaginationLinkProps, "children">) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon"
      isDisabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  isDisabled,
  ...props
}: Omit<PaginationLinkProps, "children">) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon"
      isDisabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
}

export function PaginationStart({
  className,
  isDisabled,
  ...props
}: Omit<PaginationLinkProps, "children">) {
  return (
    <PaginationLink
      aria-label="Go to first page"
      size="icon"
      isDisabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      <ChevronsLeft className="size-4" />
    </PaginationLink>
  );
}

export function PaginationEnd({
  className,
  isDisabled,
  ...props
}: Omit<PaginationLinkProps, "children">) {
  return (
    <PaginationLink
      aria-label="Go to last page"
      size="icon"
      isDisabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      <ChevronsRight className="size-4" />
    </PaginationLink>
  );
}
