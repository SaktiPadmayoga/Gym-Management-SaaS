"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  to?: string;
  href?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, to, href, ...props }, ref) => {
    const pathname = usePathname();
    const resolvedHref = (to ?? href) as string;
    const isActive = pathname === resolvedHref;

    return (
      <Link
        ref={ref}
        href={resolvedHref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
