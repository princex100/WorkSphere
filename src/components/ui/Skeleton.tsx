interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border bg-surface-100 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonText lines={2} />
            <div className="flex gap-2 mt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const spinnerSize = { sm: "size-4", md: "size-6", lg: "size-8" };

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <span
            className={[
                "inline-block rounded-full border-2 border-surface-400 border-t-brand-500 animate-spin",
                spinnerSize[size],
                className,
            ].join(" ")}
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <Spinner size="lg" />
        </div>
    );
}
