import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCustomer, setCustomerActive, type Customer } from "@/lib/customers-store";
import { getAllOrders, type Order } from "@/lib/orders-store";
import { ApiError } from "@/lib/api/client";

/** Owns the profile-page state: loads the customer + their order history, and the block/activate action. */
export function useCustomerDetail(id: string) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) { router.replace("/dashboard/customers"); return; }
    let cancelled = false;

    getCustomer(id)
      .then((found) => { if (!cancelled) setCustomer(found); })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "Failed to load customer");
        router.replace("/dashboard/customers");
      })
      .finally(() => { if (!cancelled) setCustomerLoading(false); });

    getAllOrders({ customerId: id })
      .then((list) => { if (!cancelled) setOrders(list); })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load order history"))
      .finally(() => { if (!cancelled) setOrdersLoading(false); });

    return () => { cancelled = true; };
  }, [id, router]);

  const toggleActive = () => {
    if (!customer) return;
    const nextActive = customer.status !== "active";
    setUpdating(true);
    setCustomerActive(customer.id, nextActive)
      .then((updated) => {
        setCustomer(updated);
        toast.success(`${customer.name} marked as ${nextActive ? "Active" : "Blocked"}`);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to update status"))
      .finally(() => setUpdating(false));
  };

  return { customer, customerLoading, orders, ordersLoading, updating, toggleActive };
}
