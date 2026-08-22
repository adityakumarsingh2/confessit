import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Toast({ toasts, remove }) {
    return createPortal(
        <div className="toast-wrap">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} remove={remove} />
            ))}
        </div>,
        document.body
    );
}

const ICONS = {
    success: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    error: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    ),
    default: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    ),
};

function ToastItem({ toast, remove }) {
    const [exiting, setExiting] = useState(false);
    const type = toast.type || 'default';

    useEffect(() => {
        const hide = setTimeout(() => setExiting(true), 2800);
        const remove_ = setTimeout(() => remove(toast.id), 3200);
        return () => { clearTimeout(hide); clearTimeout(remove_); };
    }, [toast.id, remove]);

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => remove(toast.id), 300);
    };

    return (
        <div
            className={`toast ${type} ${exiting ? 'toast-exit' : ''}`}
            onClick={handleDismiss}
            role="alert"
            title="Click to dismiss"
        >
            <span className="toast-icon">{ICONS[type] || ICONS.default}</span>
            <span className="toast-message">{toast.message}</span>
            <div className="toast-progress" />
        </div>
    );
}
