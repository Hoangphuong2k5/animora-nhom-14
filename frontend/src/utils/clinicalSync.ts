/**
 * Barrel re-export cho toàn bộ hệ thống đồng bộ liên cổng (Expert ↔ Customer ↔ Receptionist ↔ Manager).
 * Các module con được tách theo miền trách nhiệm trong `./clinicalSync/*` để dễ bảo trì mà không gây breaking change.
 */
export * from "./clinicalSync/expertStorage";
export * from "./clinicalSync/bookingSync";
export * from "./clinicalSync/leaveAndStaffSync";
export * from "./clinicalSync/customerClinicalBridge";
export * from "./clinicalSync/managerNotifications";
