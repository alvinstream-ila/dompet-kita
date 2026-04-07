'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

/**
 * BRIDGE COMPONENT: Link
 * Maps 'to' prop from React Router to 'href' prop in Next.js.
 */
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const LinkCompat = ({ to, children, ...props }: LinkProps) => {
  return (
    <Link href={to} {...props}>
      {children}
    </Link>
  );
};

export { LinkCompat as Link };

/**
 * BRIDGE HOOK: useNavigate
 * Maps navigation calls to Next.js useRouter.
 */
export const useNavigate = () => {
  const router = useRouter();
  
  return (path: string | number, options?: { replace?: boolean }) => {
    if (typeof path === 'number') {
      if (path === -1) {
        globalThis.history.back();
      } else if (path === 1) {
        globalThis.history.forward();
      }
      return;
    }
    
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
};

/**
 * BRIDGE HOOK: useLocation
 * Simplified representation of the current location state.
 */
export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  
  return {
    pathname,
    search: searchString,
    hash: '',
    state: null,
    key: 'next-compat',
  };
};

/**
 * BRIDGE HOOK: useParams
 * Wraps Next.js params into a plain object.
 */
export const useParams = () => {
  const params = useNextParams();
  return params || {};
};

/**
 * BRIDGE COMPONENT: NavLink
 * Simplifies NavLink with basic active state support if needed (can be extended).
 */
interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  to: string;
  children: React.ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink = ({ to, children, className, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === to;
  
  const resolvedClassName = typeof className === 'function' 
    ? className({ isActive }) 
    : className;

  return (
    <Link href={to} className={resolvedClassName} {...props}>
      {children}
    </Link>
  );
};

/**
 * BRIDGE COMPONENT: Outlet
 * In Next.js, children are passed via the layout/page structure, 
 * so Outlet simply acts as a passthrough for nested compositions.
 */
export const Outlet = ({ children }: { children?: React.ReactNode }) => {
  return <>{children}</>;
};

// Default export to support various import styles
const reactRouterDom = {
  Link: LinkCompat,
  useNavigate,
  useLocation,
  useParams,
  NavLink,
  Outlet
};

export default reactRouterDom;
