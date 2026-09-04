import { PackageSearch } from "lucide-react";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-line rounded-2xl overflow-hidden">
          <div className="aspect-square bg-mist animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-mist rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-mist rounded animate-pulse" />
            <div className="h-8 w-full bg-mist rounded-xl animate-pulse mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message = "محصولی برای نمایش وجود ندارد." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
      <PackageSearch size={36} className="mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "خطایی رخ داد. لطفاً دوباره تلاش کنید." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-red-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center px-5" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fadeUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold mb-2">{title}</h3>
        {description && <p className="text-sm text-neutral-500 mb-5">{description}</p>}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-xl hover:bg-red-700 transition-colors"
          >
            تأیید
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-line text-sm py-2.5 rounded-xl hover:bg-mist transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
