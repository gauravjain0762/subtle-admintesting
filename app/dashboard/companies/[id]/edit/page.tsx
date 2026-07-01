import { getCompanyIds } from "@/lib/companies-store";
import EditCompanyPage from "./company-edit-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCompanyIds().map((id) => ({ id }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditCompanyPage params={params} />;
}
