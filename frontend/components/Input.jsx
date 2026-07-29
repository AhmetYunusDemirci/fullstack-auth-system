export default function Input({ className = "", icon, type, ...props }) {
    const renderDefaultIcon = () => {
        if (icon) return icon;
        if (type === "email") {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75 12 13.5l9-6.75" />
                </svg>
            );
        }

        if (type === "password") {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V9a3.75 3.75 0 10-7.5 0v1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 10.5h13.5v7.5a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-7.5z" />
                </svg>
            );
        }

        return null;
    };

    const iconNode = renderDefaultIcon();

    return (
        <div className={`input-wrapper`}> 
            {iconNode && <div className="input-icon">{iconNode}</div>}
            <input {...props} type={type} className={`input ${iconNode ? 'pl-11' : ''} ${className}`} />
        </div>
    );
}