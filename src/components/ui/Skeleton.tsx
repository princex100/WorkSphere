interface SkeletonProps { className?: string; }

export function Skeleton({ className = "" }: SkeletonProps) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-4 rounded-md ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-xl border border-ws-border bg-ws-surface p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonText lines={2} />
            <div className="flex gap-2 mt-1">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
            </div>
        </div>
    );
}

interface SpinnerProps { size?: "xs" | "sm" | "md" | "lg"; className?: string; }

const spinnerSize = { xs: "size-3", sm: "size-4", md: "size-5", lg: "size-7" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <span
            aria-label="Loading"
            className={[
                "inline-block rounded-full border-2 border-ws-border-strong border-t-ws-text animate-spin",
                spinnerSize[size],
                className,
            ].join(" ")}
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner size="lg" />
        </div>
    );
}
