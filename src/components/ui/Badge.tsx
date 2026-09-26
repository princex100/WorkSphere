import { ReactNode } from "react";

type BadgeVariant = "default" | "brand" | "success" | "warning" | "error" | "planning" | "active" | "paused" | "completed" | "cancelled" | "low" | "medium" | "high";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    default:   "bg-surface-300 text-text-secondary",
    brand:     "bg-brand-500/15 text-brand-400 border border-brand-500/20",
    success:   "bg-green-500/15  text-green-400  border border-green-500/20",
    warning:   "bg-amber-500/15  text-amber-400  border border-amber-500/20",
    error:     "bg-red-500/15    text-red-400    border border-red-500/20",
    // Project statuses
    planning:  "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    active:    "bg-brand-500/15  text-brand-400  border border-brand-500/20",
    paused:    "bg-amber-500/15  text-amber-400  border border-amber-500/20",
    completed: "bg-green-500/15  text-green-400  border border-green-500/20",
    cancelled: "bg-red-500/15    text-red-400    border border-red-500/20",
    // Priorities
    low:       "bg-green-500/15  text-green-400  border border-green-500/20",
    medium:    "bg-amber-500/15  text-amber-400  border border-amber-500/20",
    high:      "bg-red-500/15    text-red-400    border border-red-500/20",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                variantClasses[variant],
                className,
            ].join(" ")}
        >
            {children}
        </span>
    );
}

// ── Helpers to map backend enums to badge variants ────────────────────────────

export function projectStatusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        PLANNING:    "planning",
        ACTIVE:      "active",
        IN_PROGRESS: "brand",
        PAUSED:      "paused",
        COMPLETED:   "completed",
        CANCELLED:   "cancelled",
    };
    return map[status] ?? "default";
}

export function taskStatusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        TODO:        "default",
        IN_PROGRESS: "brand",
        REVIEW:      "warning",
        COMPLETED:   "success",
        CANCELLED:   "error",
    };
    return map[status] ?? "default";
}

export function priorityVariant(priority: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        LOW:    "low",
        MEDIUM: "medium",
        HIGH:   "high",
    };
    return map[priority] ?? "default";
}
