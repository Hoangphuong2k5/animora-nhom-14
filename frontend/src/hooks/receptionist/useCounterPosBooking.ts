"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getDoctorsWithLiveRatings } from "@/data/doctorsDirectory";
import { useSyncedActiveServices } from "@/hooks/booking/useSyncedActiveServices";
import {
  estimateServicePrice,
  getTimeSlotsForDate,
  getTodayLocalIso,
  mapWeightStringToRangeId,
  validateBookingDate,
} from "@/data/serviceBookingData";
import { syncCustomerBookingToExpertStore } from "@/utils/clinicalSync";
import type { ExtendedBooking } from "@/components/shared/operations/bookings/bookingsTypesAndData";
import {
  type AllowedV14Species,
  appendReceptionistAuditLog,
  appendServiceInvoice,
  buildCounterPosBookingAndInvoice,
  type CounterPosPaymentOption,
  createWalkInPetProfile,
  dispatchReceptionistSync,
  evaluateCustomerViolationStatus,
  findCustomerByPhone,
  findOrCreateWalkInCustomer,
  getActivePetsForBooking,
  getAvailableStaffForPosSlot,
  INITIAL_WALK_IN_CUSTOMERS,
  INITIAL_WALK_IN_PETS,
  loadReceptionistBookings,
  loadWalkInCustomers,
  loadWalkInPets,
  normalizeVietnamPhone,
  saveReceptionistBookings,
  saveWalkInCustomers,
  saveWalkInPets,
  syncWalkInPetToExpertRegistry,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "@/data/receptionistOpsData";
import { useReceptionistActor } from "./useReceptionistActor";

export function useCounterPosBooking() {
  const searchParams = useSearchParams();
  const { actorId, actorName } = useReceptionistActor();
  const services = useSyncedActiveServices();
  const todayIso = useMemo(() => getTodayLocalIso(), []);

  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [customers, setCustomers] = useState<WalkInCustomerRecord[]>(
    INITIAL_WALK_IN_CUSTOMERS
  );
  const [walkInPets, setWalkInPets] = useState<WalkInPetRecord[]>(
    INITIAL_WALK_IN_PETS
  );

  // Customer & Pet state
  const [phoneSearch, setPhoneSearch] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<WalkInCustomerRecord | null>(INITIAL_WALK_IN_CUSTOMERS[2]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  const [showQuickPetForm, setShowQuickPetForm] = useState(false);
  const [quickPetName, setQuickPetName] = useState("");
  const [quickPetSpecies, setQuickPetSpecies] =
    useState<AllowedV14Species>("Chó");
  const [quickPetWeight, setQuickPetWeight] = useState("4.5");
  const [quickPetAllergies, setQuickPetAllergies] = useState("");

  // Service, Schedule & Payment POS state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    "checkup",
  ]);
  const [bookingMode, setBookingMode] = useState<"walk_in_now" | "scheduled">(
    "walk_in_now"
  );
  const [date, setDate] = useState<string>(todayIso);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [paymentOption, setPaymentOption] =
    useState<CounterPosPaymentOption>("postpaid_cash");
  const [note, setNote] = useState<string>("");
  const [lastCreatedBooking, setLastCreatedBooking] =
    useState<ExtendedBooking | null>(null);

  useEffect(() => {
    setBookings(loadReceptionistBookings());
    const savedCustomers = loadWalkInCustomers();
    setCustomers(savedCustomers);
    setWalkInPets(loadWalkInPets());

    const urlPhone = searchParams?.get("phone");
    if (urlPhone) {
      const matched = findCustomerByPhone(urlPhone, savedCustomers);
      if (matched) {
        setSelectedCustomer(matched);
        setPhoneSearch(matched.phone);
      } else {
        setPhoneSearch(normalizeVietnamPhone(urlPhone));
      }
    }
  }, [searchParams]);

  // Customer active pets (hides soft-deleted pets)
  const customerPets = useMemo(() => {
    if (!selectedCustomer) return [];
    const targetPhone = normalizeVietnamPhone(selectedCustomer.phone);
    return getActivePetsForBooking(walkInPets).filter(
      (p) =>
        p.customerId === selectedCustomer.id ||
        normalizeVietnamPhone(p.ownerPhone) === targetPhone
    );
  }, [walkInPets, selectedCustomer]);

  useEffect(() => {
    if (customerPets.length === 0) {
      setSelectedPetId("");
      return;
    }
    if (!customerPets.some((p) => p.id === selectedPetId)) {
      setSelectedPetId(customerPets[0].id);
    }
  }, [customerPets, selectedPetId]);

  const selectedPet = useMemo(
    () => customerPets.find((p) => p.id === selectedPetId) || null,
    [customerPets, selectedPetId]
  );

  const weightRange = useMemo(
    () =>
      selectedPet
        ? mapWeightStringToRangeId(`${selectedPet.weightKg}kg`)
        : "under_5",
    [selectedPet]
  );

  const violationAssessment = useMemo(() => {
    if (!selectedCustomer) return null;
    return evaluateCustomerViolationStatus(selectedCustomer.phone, bookings);
  }, [selectedCustomer, bookings]);

  useEffect(() => {
    if (
      violationAssessment?.isPostpaidLocked &&
      paymentOption === "postpaid_cash"
    ) {
      setPaymentOption("prepaid_cash");
    }
  }, [violationAssessment?.isPostpaidLocked, paymentOption]);

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds]
  );

  const totalDurationMinutes = useMemo(
    () =>
      selectedServices.reduce((sum, s) => sum + (s.durationMinutes || 45), 0),
    [selectedServices]
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (sum, s) => sum + estimateServicePrice(s, weightRange),
        0
      ),
    [selectedServices, weightRange]
  );

  useEffect(() => {
    if (bookingMode === "walk_in_now" && date !== todayIso) {
      setDate(todayIso);
    }
  }, [bookingMode, date, todayIso]);

  const dateValidationError = useMemo(() => {
    const check = validateBookingDate(date, todayIso);
    if (!check.valid) {
      if (check.reason === "past") return "Không thể đặt lịch cho ngày đã qua.";
      if (check.reason === "closed")
        return "Ngày này phòng khám đóng cửa / khử khuẩn định kỳ.";
      if (check.reason === "too_far")
        return "Ngày đặt vượt quá giới hạn cho phép.";
      return "Vui lòng chọn ngày hợp lệ.";
    }
    const dow = new Date(`${date}T00:00:00`).getDay();
    if (dow === 0) {
      return "Phòng khám nghỉ Chủ Nhật (chỉ làm Thứ 2 – Thứ 7, 08:00–17:00).";
    }
    return null;
  }, [date, todayIso]);

  const primaryCategory = selectedServices[0]?.category || "vet";
  const allDoctors = useMemo(
    () => getDoctorsWithLiveRatings(bookings),
    [bookings]
  );

  const eligibleStaff = useMemo(() => {
    const matched = allDoctors.filter((d) =>
      d.serviceCategories.includes(primaryCategory)
    );
    return matched.length > 0 ? matched : allDoctors;
  }, [allDoctors, primaryCategory]);

  // Reset stale selectedStaffId when service category changes
  useEffect(() => {
    if (
      selectedStaffId &&
      !eligibleStaff.some((s) => s.id === selectedStaffId)
    ) {
      setSelectedStaffId("");
    }
  }, [eligibleStaff, selectedStaffId]);

  const timeSlots = useMemo(
    () =>
      getTimeSlotsForDate(date, bookings, undefined, undefined, {
        isCounterChannel: true,
        isWalkInImmediate: bookingMode === "walk_in_now",
        durationMinutes: totalDurationMinutes || 45,
        petName: selectedPet?.name,
        doctorId: selectedStaffId || undefined,
      }),
    [
      date,
      bookings,
      bookingMode,
      totalDurationMinutes,
      selectedPet?.name,
      selectedStaffId,
    ]
  );

  useEffect(() => {
    const validSlots = timeSlots.filter((s) => {
      const hr = parseInt(s.time.split(":")[0], 10);
      return hr >= 8 && hr <= 17 && !s.disabled;
    });
    if (validSlots.length === 0) {
      setSelectedTimeSlot("");
      return;
    }
    if (!validSlots.some((s) => s.time === selectedTimeSlot)) {
      setSelectedTimeSlot(validSlots[0].time);
    }
  }, [timeSlots, selectedTimeSlot]);

  // Real conflict-checked available staff for the selected time slot
  const availableStaffForSlot = useMemo(
    () =>
      getAvailableStaffForPosSlot({
        eligibleStaff,
        bookings,
        date,
        startTime: selectedTimeSlot,
        durationMinutes: totalDurationMinutes || 45,
      }),
    [eligibleStaff, bookings, date, selectedTimeSlot, totalDurationMinutes]
  );

  const autoAssignedStaff = availableStaffForSlot[0] || null;

  const resolvedStaff = useMemo(() => {
    if (selectedStaffId) {
      return (
        availableStaffForSlot.find((s) => s.id === selectedStaffId) || null
      );
    }
    return autoAssignedStaff;
  }, [selectedStaffId, availableStaffForSlot, autoAssignedStaff]);

  const handleLookupPhone = () => {
    const normalized = normalizeVietnamPhone(phoneSearch);
    if (!normalized) {
      toast.error("Vui lòng nhập số điện thoại khách hàng để tìm kiếm.");
      return;
    }
    const matched = findCustomerByPhone(normalized, customers);
    if (matched) {
      setSelectedCustomer(matched);
      toast.success(`Đã chọn khách: ${matched.fullName} (${matched.phone})`);
    } else {
      toast.info(
        "Chưa có SĐT này — nhập tên khách ở ô bên cạnh rồi bấm 'Tạo vãng lai'."
      );
    }
  };

  const handleCreateWalkInCustomer = () => {
    try {
      const res = findOrCreateWalkInCustomer({
        fullName: newCustomerName,
        phone: phoneSearch,
        existingCustomers: customers,
        actorId,
        actorName,
      });
      setCustomers(res.customers);
      saveWalkInCustomers(res.customers);
      setSelectedCustomer(res.customer);
      setNewCustomerName("");
      if (res.auditLog) appendReceptionistAuditLog(res.auditLog);
      dispatchReceptionistSync();
      toast.success(
        res.created
          ? `Đã tạo khách vãng lai: ${res.customer.fullName} (${res.customer.phone})`
          : `SĐT đã tồn tại — đã chọn khách ${res.customer.fullName}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo khách vãng lai."
      );
    }
  };

  const handleCreateQuickPet = () => {
    if (!selectedCustomer) {
      toast.error("Vui lòng chọn hoặc tạo khách hàng trước khi thêm thú cưng.");
      return;
    }
    try {
      const res = createWalkInPetProfile({
        customerId: selectedCustomer.id,
        ownerName: selectedCustomer.fullName,
        ownerPhone: selectedCustomer.phone,
        name: quickPetName,
        species: quickPetSpecies,
        weightKg: parseFloat(quickPetWeight) || 4.0,
        allergies:
          quickPetAllergies.trim() || "Không có dị ứng (Do khách khai)",
        existingPets: walkInPets,
        actorId,
        actorName,
      });
      setWalkInPets(res.pets);
      saveWalkInPets(res.pets);
      syncWalkInPetToExpertRegistry(res.pet);
      appendReceptionistAuditLog(res.auditLog);
      dispatchReceptionistSync();
      setSelectedPetId(res.pet.id);
      setQuickPetName("");
      setQuickPetAllergies("");
      setShowQuickPetForm(false);
      toast.success(
        `Đã thêm bé ${res.pet.name} (${res.pet.species} • ${res.pet.weightKg}kg)!`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể tạo hồ sơ thú cưng."
      );
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const canSubmit = Boolean(
    selectedCustomer &&
      selectedPet &&
      selectedServices.length > 0 &&
      !dateValidationError &&
      selectedTimeSlot &&
      resolvedStaff
  );

  const handleSubmitCounterBooking = () => {
    if (!canSubmit || !selectedCustomer || !selectedPet || !resolvedStaff) {
      toast.error(
        "Vui lòng kiểm tra đủ Khách hàng, Thú cưng, Dịch vụ, Khung giờ và Nhân sự rảnh."
      );
      return;
    }

    const { booking, auditLog, invoice } = buildCounterPosBookingAndInvoice({
      existingBookingsCount: bookings.length,
      customer: selectedCustomer,
      pet: selectedPet,
      weightRange,
      selectedServices,
      totalDurationMinutes,
      totalPrice,
      bookingMode,
      date,
      startTime: selectedTimeSlot,
      assignedStaff: resolvedStaff,
      paymentOption,
      note,
      actorId,
      actorName,
    });

    const nextBookings = saveReceptionistBookings([booking, ...bookings]);
    setBookings(nextBookings);
    appendReceptionistAuditLog(auditLog);
    if (invoice) {
      appendServiceInvoice(invoice);
    }
    syncCustomerBookingToExpertStore(booking, actorName);
    dispatchReceptionistSync();

    setLastCreatedBooking(booking);
    setNote("");
    toast.success(
      invoice
        ? `Đã tạo phiếu ${booking.code} & xuất hóa đơn ${invoice.invoiceCode} (${booking.status})!`
        : `Đã tạo phiếu ${booking.code} cho khách ${selectedCustomer.fullName} (${booking.status})!`
    );
  };

  return {
    todayIso,
    services,
    customers,
    selectedCustomer,
    customerPets,
    selectedPet,
    selectedPetId,
    weightRange,
    violationAssessment,
    phoneSearch,
    newCustomerName,
    showQuickPetForm,
    quickPetName,
    quickPetSpecies,
    quickPetWeight,
    quickPetAllergies,
    selectedServiceIds,
    selectedServices,
    totalDurationMinutes,
    totalPrice,
    bookingMode,
    date,
    dateValidationError,
    timeSlots,
    selectedTimeSlot,
    availableStaffForSlot,
    selectedStaffId,
    autoAssignedStaff,
    resolvedStaff,
    paymentOption,
    note,
    canSubmit,
    lastCreatedBooking,
    setPhoneSearch,
    setNewCustomerName,
    setSelectedCustomer,
    setSelectedPetId,
    setShowQuickPetForm,
    setQuickPetName,
    setQuickPetSpecies,
    setQuickPetWeight,
    setQuickPetAllergies,
    setBookingMode,
    setDate,
    setSelectedTimeSlot,
    setSelectedStaffId,
    setPaymentOption,
    setNote,
    setLastCreatedBooking,
    handleLookupPhone,
    handleCreateWalkInCustomer,
    handleCreateQuickPet,
    handleToggleService,
    handleSubmitCounterBooking,
  };
}

