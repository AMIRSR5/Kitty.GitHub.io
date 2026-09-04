import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface Ctx {
  push: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<Ctx>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  const icon = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icon[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2 bg-ink text-white text-sm px-4 py-2.5 rounded-full shadow-lg animate-fadeUp"
            >
              <Icon size={16} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
