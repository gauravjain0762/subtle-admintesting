import { getEnquiryIds } from "@/lib/enquiries-store";
import RequestDetailPage from "./request-detail-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEnquiryIds().map((id) => ({ id }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RequestDetailPage params={params} />;
}
