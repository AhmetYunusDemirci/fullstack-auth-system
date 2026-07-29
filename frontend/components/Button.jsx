export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
    const base = variant === "accent" ? "btn btn-accent" : "btn btn-primary";

    const sizeClass = size === 'sm' ? 'py-2 text-sm' : size === 'lg' ? 'py-4 text-lg' : 'py-3';

    return (
        <button
            {...props}
            className={`${base} ${sizeClass} ${className} transform transition hover:-translate-y-0.5 active:translate-y-0`}
        >
            {children}
        </button>
    );
}
