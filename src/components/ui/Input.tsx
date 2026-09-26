import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?:      string;
    error?:      string;
    hint?:       string;
    leftIcon?:   ReactNode;
    rightIcon?:  ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    function Input({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-[13px] font-medium text-ws-text-2">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <span className="absolute left-3 text-ws-text-4 pointer-events-none flex items-center">
                            {leftIcon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={[
                            "w-full h-10 rounded-xl border bg-ws-surface px-3.5 py-2",
                            "text-sm text-ws-text placeholder:text-ws-text-disabled",
                            "transition-all duration-150 outline-none",
                            error
                                ? "border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100"
                                : "border-ws-border focus:border-ws-border-strong focus:ring-3 focus:ring-black/5",
                            leftIcon  ? "pl-9"  : "",
                            rightIcon ? "pr-9"  : "",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-ws-bg-alt",
                            className,
                        ].filter(Boolean).join(" ")}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 text-ws-text-4 flex items-center">
                            {rightIcon}
                        </span>
                    )}
                </div>
                {error && <p className="text-[12px] text-red-500">{error}</p>}
                {hint && !error && <p className="text-[12px] text-ws-text-4">{hint}</p>}
            </div>
        );
    }
);

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?:  string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    function Textarea({ label, error, hint, className = "", id, ...props }, ref) {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-[13px] font-medium text-ws-text-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={[
                        "w-full rounded-xl border bg-ws-surface px-3.5 py-2.5",
                        "text-sm text-ws-text placeholder:text-ws-text-disabled",
                        "transition-all duration-150 outline-none resize-none",
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100"
                            : "border-ws-border focus:border-ws-border-strong focus:ring-3 focus:ring-black/5",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        className,
                    ].filter(Boolean).join(" ")}
                    {...props}
                />
                {error && <p className="text-[12px] text-red-500">{error}</p>}
                {hint && !error && <p className="text-[12px] text-ws-text-4">{hint}</p>}
            </div>
        );
    }
);
