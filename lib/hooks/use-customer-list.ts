import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getCustomers, setCustomerActive, type Customer, type CustomerType, type CustomerStatus } from "@/lib/customers-store";
import { getCompanies, type Company } from "@/lib/companies-store";
import { ApiError } from "@/lib/api/client";

export const ALL_COMPANIES = "All Companies";
const PAGE_SIZE = 10;

/**
 * Owns all list-page state: filters, debounced search, pagination, and the customers
 * fetch itself — kept out of the page component so the page only has to render.
 */
export function useCustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load companies"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, companyFilter]);

  useEffect(() => {
    setLoading(true);
    const companyId = companyFilter === ALL_COMPANIES ? undefined : companies.find((c) => c.name === companyFilter)?.id;
    getCustomers({
      page: currentPage,
      limit: PAGE_SIZE,
      status: statusFilter === "All" ? undefined : (statusFilter.toLowerCase() as CustomerStatus),
      type: typeFilter === "All Types" ? undefined : (typeFilter.toLowerCase() as CustomerType),
      workspaceId: companyId,
      search: debouncedSearch || undefined,
    })
      .then((res) => { setCustomers(res.customers); setTotal(res.total); setTotalPages(res.totalPages); })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load customers"))
      .finally(() => setLoading(false));
    // `companies` deliberately excluded: companyFilter can only ever hold a name that came
    // from this same array (via the dropdown), so by the time it changes, companies is
    // already populated — depending on the array itself just double-fires this effect
    // the moment the initial getCompanies() call resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, typeFilter, companyFilter, debouncedSearch]);

  const toggleActive = (customer: Customer) => {
    const nextActive = customer.status !== "active";
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, status: nextActive ? "active" : "blocked" } : c)));
    setCustomerActive(customer.id, nextActive).catch((err) => {
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, status: customer.status } : c)));
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    });
  };

  return {
    customers, total, totalPages, loading, currentPage, setCurrentPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    companyFilter, setCompanyFilter,
    companyOptions: [ALL_COMPANIES, ...companies.map((c) => c.name)],
    totalCompanies: companies.length,
    toggleActive,
    pageSize: PAGE_SIZE,
  };
}
