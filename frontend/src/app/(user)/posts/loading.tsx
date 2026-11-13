import { Spinner } from "@/components/ui/spinner";

export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Spinner className="w-5 h-5" />
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>
  );
}
