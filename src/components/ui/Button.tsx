import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:   "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
    secondary: "bg-surface-200 text-text-primary hover:bg-surface-300",
    ghost:     "text-text-secondary hover:bg-surface-200 hover:text-text-primary",
    danger:    "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
    outline:   "border border-border-strong text-text-primary hover:bg-surface-200",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm:  "h-8  px-3  text-xs  gap-1.5",
    md:  "h-9  px-4  text-sm  gap-2",
    lg:  "h-11 px-6  text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        { variant = "primary", size = "md", isLoading, disabled, className = "", children, ...props },
        ref
    ) {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={[
                    "inline-flex items-center justify-center rounded-lg font-medium",
                    "transition-all duration-150 cursor-pointer select-none",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:outline-2 focus-visible:outline-brand-500",
                    variantClasses[variant],
                    sizeClasses[size],
                    className,
                ].join(" ")}
                {...props}
            >
                {isLoading ? (
                    <>
                        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {children}
                    </>
                ) : children}
            </button>
        );
    }
);
