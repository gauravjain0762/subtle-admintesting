import { getCompanyIds } from "@/lib/companies-store";
import CompanyDetailPage from "./company-detail-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompanyIds().map((id) => ({ id }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CompanyDetailPage params={params} />;
}
