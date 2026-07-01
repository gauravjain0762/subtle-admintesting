import { getDishIds } from "@/lib/menu-store";
import EditDishPage from "./edit-dish-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDishIds().map((id) => ({ id: String(id) }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditDishPage params={params} />;
}
