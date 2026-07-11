import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message) => addToast(message, "success"), [addToast]);
    const error = useCallback((message) => addToast(message, "error"), [addToast]);
    const info = useCallback((message) => addToast(message, "info"), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            
            {/* Toast Container Overlay */}
            <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === "success";
                    const isError = toast.type === "error";

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 transform translate-x-0 animate-slideIn ${
                                isSuccess
                                    ? "bg-green-50/90 dark:bg-green-950/90 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200"
                                    : isError
                                    ? "bg-red-50/90 dark:bg-red-950/90 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200"
                                    : "bg-blue-50/90 dark:bg-blue-950/90 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200"
                            }`}
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <span className="flex-shrink-0 mt-0.5">
                                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                                    {isError && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                                    {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                                </span>
                                <p className="text-sm font-medium leading-5 break-words">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 ml-3 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-current opacity-70 hover:opacity-100"
                                aria-label="Dismiss notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
