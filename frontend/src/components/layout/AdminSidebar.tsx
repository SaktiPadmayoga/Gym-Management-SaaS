// components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { adminSidebarData, type AdminSidebarItem } from "@/types/central-sidebar-menu";

interface AdminSidebarProps {
  isOpen: boolean;
  pathname: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, pathname }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const findActiveItem = (items: AdminSidebarItem[], currentPath: string): AdminSidebarItem | null => {
    for (const item of items) {
      if (item.isHeader) continue;

      if (item.path && (currentPath === item.path || currentPath.startsWith(item.path + '/'))) {
        return item;
      }
      if (item.children) {
        const found = findActiveItem(item.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const getParentPaths = (items: AdminSidebarItem[], targetId: string, currentPath: string[] = []): string[] => {
    for (const item of items) {
      if (item.isHeader) continue;

      const newPath = [...currentPath, item.id];

      if (item.id === targetId) {
        return newPath;
      }

      if (item.children) {
        const found = getParentPaths(item.children, targetId, newPath);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  useEffect(() => {
    const activeItem = findActiveItem(adminSidebarData, pathname);
    if (activeItem) {
      const pathsToExpand = getParentPaths(adminSidebarData, activeItem.id);
      const newExpanded: Record<string, boolean> = {};
      pathsToExpand.forEach(path => {
        newExpanded[path] = true;
      });
      setExpandedItems(prev => ({ ...prev, ...newExpanded }));
    }
  }, [pathname]);

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (item: AdminSidebarItem): boolean => {
    if (!item.path) return false;
    return pathname === item.path || pathname.startsWith(item.path + '/');
  };

  const isParentActive = (item: AdminSidebarItem): boolean => {
    if (isActive(item)) return true;
    if (item.children) {
      return item.children.some(child => isParentActive(child));
    }
    return false;
  };

  const renderChildren = (children: AdminSidebarItem[]) => {
    return children.map((child) => {
      const itemActive = isActive(child);
      const CurrentIcon = itemActive && child.IconSolid ? child.IconSolid : child.Icon;

      return (
        <div key={child.id} className="relative">
          {/* Branch lines */}
          {isOpen && (
            <div className="absolute left-0 top-0 bottom-0 flex items-start">
              <div className="w-px bg-zinc-200 ml-3 h-full" />
              <div className="w-4 h-px bg-zinc-200 mt-6" />
            </div>
          )}

          {/* Menu item */}
          <div className={`flex items-center ${isOpen ? 'ml-9' : ''}`}>
            <Link
              href={child.path || '#'}
              className={`w-full flex items-center py-2 px-3 mt-2 rounded-lg transition-all duration-200 group ${
                itemActive
                  ? 'bg-aksen-primary text-white border border-gray-500/20 shadow-sm font-semibold text-md' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {CurrentIcon && (
                <div className={`${isOpen ? 'w-4 h-4 mr-3' : 'w-5 h-5'} flex-shrink-0 flex items-center justify-center`}>
                  <CurrentIcon width={isOpen ? 16 : 20} height={isOpen ? 16 : 20} stroke={1.5} />
                </div>
              )}

              {isOpen && (
                <span className="text-sm truncate">{child.title}</span>
              )}
            </Link>
          </div>
        </div>
      );
    });
  };

  const renderMenuItem = (item: AdminSidebarItem) => {
    // Render header
    if (item.isHeader) {
      if (!isOpen) return null;

      return (
        <div key={item.id} className="mt-6 mb-2 px-2">
          <span className="text-sm text-zinc-400 uppercase tracking-wider">
            {item.title}
          </span>
        </div>
      );
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const itemActive = isActive(item);
    const parentActive = isParentActive(item);
    const CurrentIcon = (itemActive || parentActive) && item.IconSolid ? item.IconSolid : item.Icon;

    return (
      <div key={item.id} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 group ${
              itemActive || parentActive 
                ? 'bg-aksen-primary text-white border border-gray-500/20 shadow-sm font-semibold text-md' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center min-w-0">
              {CurrentIcon && (
                <CurrentIcon size={isOpen ? 20 : 24} className={`${isOpen ? 'mr-3' : ''} flex-shrink-0`} />
              )}
              
              {isOpen && (
                <span className="truncate">{item.title}</span>
              )}
            </div>

            {hasChildren && isOpen && (
              <div className="ml-2">
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </div>
            )}
          </button>
        ) : (
          <Link
            href={item.path || '#'}
            className={`w-full flex items-center py-2 px-3 rounded-lg transition-all duration-200 group ${
              itemActive 
                ? 'bg-aksen-primary/90 text-white border border-gray-500/20 shadow-sm font-semibold text-md' 
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            {CurrentIcon && (
              <CurrentIcon size={isOpen ? 20 : 24} className={`${isOpen ? 'mr-3' : ''} flex-shrink-0`} />
            )}
            
            {isOpen && (
              <span className="truncate">{item.title}</span>
            )}
          </Link>
        )}

        {/* Children with branch design */}
        {hasChildren && isOpen && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="relative ml-2 mt-1">
              {renderChildren(item.children!)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        ${isOpen ? "w-64" : "w-21 py-5"}
        relative
        sticky
        top-0
        z-20
        m-4
        h-[84vh]
        overflow-y-scroll
        rounded-lg
        border
        border-gray-200
        bg-white
        transition-all
        duration-500
        ease-in-out
      `}
    >
      {/* MENU ITEMS */}
      <div className="pb-4 px-4 font-figtree">
        {adminSidebarData.map(renderMenuItem)}
      </div>
    </aside>
  );
};

export default AdminSidebar;