import { useEffect, useState } from "react";
import { fetchFeedbackAdmin, updateFeedbackStatus } from "@/services/feedback";
import { formatDate } from "@/utils/format";
import type { Feedback } from "@/types";

const STATUS_LABEL: Record<Feedback["status"], string> = {
  new: "جدید",
  read: "خوانده شده",
  resolved: "رسیدگی شده",
};
const STATUS_COLOR: Record<Feedback["status"], string> = {
  new: "bg-blue-50 text-blue-600",
  read: "bg-yellow-50 text-yellow-600",
  resolved: "bg-green-50 text-green-600",
};

export default function AdminFeedback() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetchFeedbackAdmin()
      .then(setItems)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function setStatus(f: Feedback, status: Feedback["status"]) {
    setItems((prev) => prev.map((x) => (x.id === f.id ? { ...x, status } : x)));
    await updateFeedbackStatus(f.id, status);
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">انتقادات و پیشنهادات</h1>
      {loading ? (
        <p className="text-sm text-neutral-400">در حال بارگذاری...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-neutral-400">پیامی دریافت نشده است.</p>
      ) : (
        <div className="space-y-4">
          {items.map((f) => (
            <div key={f.id} className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{f.subject}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {f.name} · {f.email} {f.phone ? `· ${f.phone}` : ""}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[f.status]}`}>
                  {STATUS_LABEL[f.status]}
                </span>
              </div>
              <p className="text-sm text-neutral-600 leading-6 mb-3 whitespace-pre-line">{f.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{formatDate(f.created_at)}</span>
                <div className="flex gap-2">
                  {(["new", "read", "resolved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(f, s)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        f.status === s ? "border-ink bg-ink text-white" : "border-line text-neutral-500 hover:bg-mist"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
