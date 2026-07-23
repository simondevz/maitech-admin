"use client";

import { isValidElement } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCanAny } from "@/components/providers/permissions-provider";
import type { VariantProps } from "class-variance-authority";

type PermissionButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    /** A single permission, or a list — any one of which is sufficient. */
    permission: string | string[];
  };

/**
 * Drop-in replacement for Button that disables itself (with an explanatory
 * tooltip) when the current user lacks `permission`, instead of silently
 * letting them click into a request the backend will 403. See
 * admin/PERMISSIONS.md for when to use this vs. hiding entirely.
 */
export function PermissionButton({
  permission,
  disabled,
  loading,
  asChild,
  children,
  ...props
}: PermissionButtonProps) {
  const allowed = useCanAny(Array.isArray(permission) ? permission : [permission]);

  if (allowed) {
    return (
      <Button disabled={disabled} loading={loading} asChild={asChild} {...props}>
        {children}
      </Button>
    );
  }

  // A disabled asChild button (e.g. wrapping a <Link>) wouldn't actually
  // block navigation — <a disabled> is not a real HTML disabled state.
  // Fall back to the child's own inner content in a real disabled <button>
  // instead of rendering the link itself.
  const content =
    asChild && isValidElement<{ children?: React.ReactNode }>(children)
      ? children.props.children
      : children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>
          <Button disabled {...props}>
            {content}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>You don&apos;t have permission to do this.</TooltipContent>
    </Tooltip>
  );
}
