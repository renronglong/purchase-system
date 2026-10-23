"use client";

import { useParams } from "next/navigation";
import { quotationStore } from "@/lib/store";
import QuotationForm from "@/components/quotation-form";

export default function EditQuotationPage() {
  const params = useParams<{ id: string }>();
  const quotation = quotationStore.getById(params.id);

  if (!quotation) {
    return (
      <div className="p-6 text-center text-slate-400 py-24">
        未找到此报价单，可能已被删除。
      </div>
    );
  }

  return <QuotationForm quotation={quotation} />;
}