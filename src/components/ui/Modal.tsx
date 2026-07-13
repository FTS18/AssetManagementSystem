"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
  rawCard?: boolean; // Set to true if children includes custom card container
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  full: "max-w-5xl",
};

export function Modal({
  isOpen = true,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  className = "",
  rawCard = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/65 backdrop-blur-md z-[500] flex items-center justify-center p-4 sm:p-6 animate-fade-in ${className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {rawCard ? (
        children
      ) : (
        <div
          className={`erp-card bg-(--surface) border border-(--border) text-(--foreground) w-full ${sizeClasses[size]} max-h-[88vh] flex flex-col rounded-xl shadow-2xl animate-scale-in overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || onClose) && (
            <div className="flex justify-between items-start border-b border-(--border) px-6 py-4 shrink-0">
              <div>
                {title && <h3 className="text-base font-bold text-(--fg) tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs text-(--muted) mt-0.5">{subtitle}</p>}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-(--muted) hover:text-(--fg) hover:bg-(--surface-2) transition-colors"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">{children}</div>
        </div>
      )}
    </div>,
    document.body
  );
}
