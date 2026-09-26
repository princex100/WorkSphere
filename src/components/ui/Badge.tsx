import { ReactNode } from "react";

type BadgeVariant =
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "planning"
    | "active"
    | "in_progress"
    | "paused"
    | "completed"
    | "cancelled"
    | "low"
    | "medium"
    | "high";

interface BadgeProps {
    children: ReactNode;
    variant?:  BadgeVariant;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    default:     "bg-ws-bg-alt text-ws-text-3 border border-ws-border",
    accent:      "bg-indigo-50  text-indigo-600 border border-indigo-100",
    success:     "bg-green-50   text-green-700  border border-green-100",
    warning:     "bg-amber-50   text-amber-700  border border-amber-100",
    error:       "bg-red-50     text-red-600    border border-red-100",
    planning:    "bg-purple-50  text-purple-700 border border-purple-100",
    active:      "bg-indigo-50  text-indigo-600 border border-indigo-100",
    in_progress: "bg-blue-50    text-blue-700   border border-blue-100",
    paused:      "bg-amber-50   text-amber-700  border border-amber-100",
    completed:   "bg-green-50   text-green-700  border border-green-100",
    cancelled:   "bg-red-50     text-red-600    border border-red-100",
    low:         "bg-green-50   text-green-700  border border-green-100",
    medium:      "bg-amber-50   text-amber-700  border border-amber-100",
    high:        "bg-red-50     text-red-600    border border-red-100",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
    return (
        <span
            className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
                "text-[11px] font-medium tracking-wide",
                variantClasses[variant],
                className,
            ].join(" ")}
        >
            {children}
        </span>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function projectStatusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        PLANNING: "planning", ACTIVE: "active", IN_PROGRESS: "in_progress",
        PAUSED: "paused", COMPLETED: "completed", CANCELLED: "cancelled",
    };
    return map[status] ?? "default";
}

export function taskStatusVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        TODO: "default", IN_PROGRESS: "in_progress", REVIEW: "warning",
        COMPLETED: "success", CANCELLED: "error",
    };
    return map[status] ?? "default";
}

export function priorityVariant(priority: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        LOW: "low", MEDIUM: "medium", HIGH: "high",
    };
    return map[priority] ?? "default";
}
