import { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-surface-200 text-text-tertiary">
                    {icon}
                </div>
            )}
            <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-text-secondary max-w-xs">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} size="sm" className="mt-5">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    description = "An error occurred while loading data.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary max-w-xs mb-5">{description}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}
