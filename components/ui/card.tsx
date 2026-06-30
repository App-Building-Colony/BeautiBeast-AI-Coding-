import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs:any[]){ return twMerge(clsx(inputs)); }

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-obsidian shadow-hazard", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-3 border-b border-border/70", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[13px] uppercase tracking-widest text-muted font-mono", className)} {...props} />
}
