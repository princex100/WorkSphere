import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    function Input({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <span className="absolute left-3 text-text-tertiary pointer-events-none flex items-center">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={[
                            "w-full h-10 rounded-lg border bg-surface-100 px-3 py-2",
                            "text-sm text-text-primary placeholder:text-text-disabled",
                            "transition-colors duration-150",
                            error
                                ? "border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                                : "border-border focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/20",
                            "outline-none",
                            leftIcon  ? "pl-9"  : "",
                            rightIcon ? "pr-9"  : "",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            className,
                        ].join(" ")}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 text-text-tertiary flex items-center">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
            </div>
        );
    }
);
