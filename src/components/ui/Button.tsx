import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:  ButtonVariant;
    size?:     ButtonSize;
    isLoading?: boolean;
    leftIcon?:  ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:   "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] active:scale-[0.98]",
    secondary: "bg-ws-bg-alt text-ws-text-2 border border-ws-border hover:bg-ws-bg hover:border-ws-border-strong",
    ghost:     "text-ws-text-3 hover:bg-ws-bg-alt hover:text-ws-text",
    danger:    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    outline:   "border border-ws-border-strong text-ws-text hover:bg-ws-bg-alt",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm:  "h-8  px-3.5 text-[13px] gap-1.5 rounded-lg",
    md:  "h-10 px-4   text-sm     gap-2   rounded-xl",
    lg:  "h-11 px-5   text-[15px] gap-2   rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        { variant = "primary", size = "md", isLoading, disabled, leftIcon, className = "", children, ...props },
        ref
    ) {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={[
                    "inline-flex items-center justify-center font-medium select-none",
                    "transition-all duration-150 cursor-pointer",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus-visible:outline-2 focus-visible:outline-ws-accent",
                    variantClasses[variant],
                    sizeClasses[size],
                    className,
                ].filter(Boolean).join(" ")}
                {...props}
            >
                {isLoading ? (
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : leftIcon ? (
                    <span className="flex items-center">{leftIcon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);
