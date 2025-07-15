"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HomeIcon, HrIcon, AiIcon, ArroTabIcon,Rightarrow, Leftarrow } from "../../chat-ui/components/icons"; // Import icons used in Sidebar
import clsx from "clsx"
type HeaderProps = {
  sidebarOpen: boolean
}

export default function Breadcrumbs({ sidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href: string; icon?: any }[]>([]);
  useEffect(() => {
    const pathSegments = pathname.split("/").filter((segment) => segment);
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Map specific paths to their sidebar labels and icons
      const pathMap: { [key: string]: { label: string; icon: any } } = {
        "human-resources": { label: "HR Compensation & Benefits", icon: HrIcon },
        "talent-acquisition": { label: "Talent Acquisition", icon: ArroTabIcon },
      };
      const mapped = pathMap[segment] || { label, icon: null };
      label = mapped.label;
      const icon = mapped.icon;

      return { label, href, icon };
    });

    // Add homepage as the first breadcrumb with HomeIcon
    setBreadcrumbs([{ label: "AI Search", href: "/", icon: HomeIcon }, ...breadcrumbItems]);
  }, [pathname]);

  return (
    <div className={clsx(
                "header-widthfix w-full mt-12 mx-auto bradcurame-section", 
                sidebarOpen
                  ? "pl-[280px]"
                  : pathname === "/" || pathname === "/aiops" || pathname === "/talent-acquisition" || pathname === "/human-resources"
                  ? "pl-[80px]"
                  : "w-full"
              )}
    >
      <nav className="flex py-2 px-4 mt-8 w-[100%]">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center text-sm">
            <Link href={crumb.href} className="text-blue-600">
              {crumb.label}
            </Link>
            {index < breadcrumbs.length - 1 && (
              <span className="mx-2">
                <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.739665 10.2996C0.436132 10.0177 0.418556 9.54319 0.700408 9.23966L4.22652 5.5L0.700408 1.76033C0.418556 1.4568 0.436131 0.982254 0.739664 0.700401C1.0432 0.41855 1.51775 0.436125 1.7996 0.739658L5.7996 4.98966C6.0668 5.27742 6.0668 5.72257 5.7996 6.01033L1.7996 10.2603C1.51775 10.5639 1.0432 10.5814 0.739665 10.2996Z" fill="#4088F4"/>
                </svg>
              </span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};