import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  CustomerProfile,
  filterCustomers,
  INITIAL_CUSTOMERS,
} from "@/components/admin/customers/customersData";

const CUSTOMERS_STORAGE_KEY = "animora_customers_v2";

/** Manages customer directory state, localStorage persistence, filtering, and lock/unlock actions. */
export function useAdminCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "locked">(
    "all"
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProfile | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = safeGetStorage<CustomerProfile[]>(CUSTOMERS_STORAGE_KEY, []);
      if (Array.isArray(saved) && saved.length > 0) {
        setCustomers(saved);
      } else {
        setCustomers(INITIAL_CUSTOMERS);
        safeSetStorage(CUSTOMERS_STORAGE_KEY, INITIAL_CUSTOMERS);
      }
    });
  }, []);

  const saveCustomers = (updated: CustomerProfile[]) => {
    setCustomers(updated);
    safeSetStorage(CUSTOMERS_STORAGE_KEY, updated);
  };

  const handleToggleLock = (customerId: string) => {
    const current = customers.find((c) => c.id === customerId);
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        const nextStatus =
          c.status === "active" ? ("locked" as const) : ("active" as const);
        return { ...c, status: nextStatus };
      }
      return c;
    });

    saveCustomers(updated);
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updated.find((c) => c.id === customerId) || null);
    }

    if (current?.status === "active") {
      toast.warning(`Đã khóa tài khoản khách hàng: ${current.fullName}`);
    } else {
      toast.success(`Đã mở khóa tài khoản khách hàng: ${current?.fullName}`);
    }
  };

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, filterStatus, searchQuery),
    [customers, filterStatus, searchQuery]
  );

  return {
    customers,
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedCustomer,
    setSelectedCustomer,
    handleToggleLock,
  };
}
