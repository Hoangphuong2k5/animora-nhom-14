import { AppDataSource } from "../config/data-source.js";
import { UserEntity, CustomerProfileEntity } from "../entities/user.entity.js";
import { PetEntity } from "../entities/pet.entity.js";
import { BookingEntity } from "../entities/booking.entity.js";
import { ROLE_IDS, USER_STATUS } from "../utils/constants.js";

const getUserRepo = () => AppDataSource.getRepository(UserEntity);
const getCustomerProfileRepo = () =>
  AppDataSource.getRepository(CustomerProfileEntity);
const getPetRepo = () => AppDataSource.getRepository(PetEntity);
const getBookingRepo = () => AppDataSource.getRepository(BookingEntity);

/**
 * Tìm danh sách khách hàng phân trang kèm tìm kiếm và lọc trạng thái
 */
const findCustomersPaginated = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}) => {
  const userRepo = getUserRepo();

  // Khách hàng có RoleID = 1 trong dbo.Roles
  const customerRoleId = ROLE_IDS.Customer || 1;

  const qb = userRepo
    .createQueryBuilder("u")
    .leftJoinAndMapOne(
      "u.profile",
      CustomerProfileEntity,
      "cp",
      "cp.UserID = u.UserID",
    )
    .where("u.role_id = :roleId", { roleId: customerRoleId });

  // Lọc theo trạng thái tài khoản nếu không phải 'all'
  if (status && status !== "all") {
    const normalizedStatus =
      status.toLowerCase() === "active"
        ? USER_STATUS.ACTIVE
        : status.toLowerCase() === "locked"
          ? USER_STATUS.LOCKED
          : status;
    qb.andWhere("u.status = :status", { status: normalizedStatus });
  }

  // Tìm kiếm theo tên khách, email, số điện thoại
  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    qb.andWhere(
      "(LOWER(u.email) LIKE :q OR u.phone LIKE :q OR LOWER(cp.full_name) LIKE :q)",
      { q },
    );
  }

  qb.orderBy("u.created_at", "DESC");
  qb.skip((page - 1) * limit);
  qb.take(limit);

  const [users, totalItems] = await qb.getManyAndCount();

  // Lấy danh sách ID để tính toán đếm số Pet, số Booking và tổng chi tiêu
  const userIds = users.map((u) => u.id);

  // Map dữ liệu tổng hợp
  const items = await Promise.all(
    users.map(async (u) => {
      const profile = u.profile;
      const customerId = profile?.id || u.id;

      let petCount = 0;
      let bookingsCount = 0;
      let totalSpent = 0;

      // 1. Đếm số thú cưng sở hữu
      try {
        petCount = await getPetRepo().count({
          where: [{ owner_id: u.id }, { owner_id: customerId }],
        });
      } catch {
        petCount = 0;
      }

      // 2. Tính số lượng lịch hẹn và tổng chi tiêu
      try {
        const bookings = await getBookingRepo().find({
          where: [{ customer_id: u.id }, { customer_id: customerId }],
        });
        bookingsCount = bookings.length;
        totalSpent = bookings
          .filter((b) => b.status !== "cancelled")
          .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
      } catch {
        bookingsCount = 0;
        totalSpent = 0;
      }

      const registeredDate = u.created_at
        ? new Date(u.created_at).toISOString().slice(0, 10)
        : "";

      const isLocked =
        u.status === USER_STATUS.LOCKED ||
        u.status === "Locked" ||
        u.status === "banned";

      return {
        id: `cus-${u.id}`,
        rawId: u.id,
        customerId: customerId,
        fullName: profile?.full_name || u.full_name || "Khách hàng",
        avatar:
          profile?.avatar_url ||
          u.avatar ||
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        email: u.email,
        phone: u.phone || "Chưa cập nhật",
        registeredDate,
        petCount,
        bookingsCount,
        totalSpent,
        status: isLocked ? "locked" : "active",
        accountStatus: u.status,
      };
    }),
  );

  return { items, totalItems };
};

/**
 * Tìm chi tiết một khách hàng (kèm thú cưng, lịch sử khám, đơn hàng)
 */
const findCustomerDetailById = async (idOrCusId) => {
  const numericId = Number(String(idOrCusId).replace(/^cus-/, ""));
  if (isNaN(numericId)) return null;

  const userRepo = getUserRepo();
  const profileRepo = getCustomerProfileRepo();

  // Tìm User
  let user = await userRepo.findOne({ where: { id: numericId } });
  let profile = null;

  if (user) {
    profile = await profileRepo.findOne({ where: { user_id: user.id } });
  } else {
    // Thử tìm theo CustomerProfile ID
    profile = await profileRepo.findOne({ where: { id: numericId } });
    if (profile) {
      user = await userRepo.findOne({ where: { id: profile.user_id } });
    }
  }

  if (!user) return null;

  const customerId = profile?.id || user.id;

  // 1. Danh sách thú cưng
  let pets = [];
  try {
    const petRecords = await getPetRepo().find({
      where: [{ owner_id: user.id }, { owner_id: customerId }],
    });
    pets = petRecords.map((p) => ({
      id: String(p.id),
      name: p.name || "Bé cưng",
      species: p.species || "Chó",
      breed: p.breed || "Chưa rõ",
      age: p.birth_date
        ? `${new Date().getFullYear() - new Date(p.birth_date).getFullYear()} tuổi`
        : "1 tuổi",
      weight: p.weight ? `${p.weight} kg` : null,
      avatar: p.avatar || null,
    }));
  } catch {
    pets = [];
  }

  // 2. Lịch sử đặt lịch hẹn
  let bookingHistory = [];
  let totalSpent = 0;
  try {
    const bookingRecords = await getBookingRepo().find({
      where: [{ customer_id: user.id }, { customer_id: customerId }],
      order: { created_at: "DESC" },
    });
    bookingHistory = bookingRecords.map((b) => {
      const amount = Number(b.total_amount || 0);
      if (b.status !== "cancelled") {
        totalSpent += amount;
      }
      return {
        id: String(b.id),
        code: b.code || `BK-${b.id}`,
        service: b.notes || "Dịch vụ thú cưng",
        date: b.scheduled_at
          ? new Date(b.scheduled_at).toISOString().slice(0, 10)
          : "",
        total: amount,
        status:
          b.status === "completed"
            ? "Hoàn thành"
            : b.status === "cancelled"
              ? "Đã hủy"
              : "Đang xử lý",
      };
    });
  } catch {
    bookingHistory = [];
  }

  const isLocked =
    user.status === USER_STATUS.LOCKED ||
    user.status === "Locked" ||
    user.status === "banned";

  return {
    id: `cus-${user.id}`,
    rawId: user.id,
    customerId: customerId,
    fullName: profile?.full_name || user.full_name || "Khách hàng",
    avatar:
      profile?.avatar_url ||
      user.avatar ||
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: user.email,
    phone: user.phone || "Chưa cập nhật",
    registeredDate: user.created_at
      ? new Date(user.created_at).toISOString().slice(0, 10)
      : "",
    petCount: pets.length,
    bookingsCount: bookingHistory.length,
    totalSpent,
    status: isLocked ? "locked" : "active",
    accountStatus: user.status,
    pets,
    bookingHistory,
    orderHistory: [], // Tích hợp với Shop Orders
    reviews: [],
  };
};

/**
 * Cập nhật trạng thái khóa/mở khóa tài khoản khách hàng
 */
const updateCustomerAccountStatus = async (idOrCusId, newStatus) => {
  const numericId = Number(String(idOrCusId).replace(/^cus-/, ""));
  if (isNaN(numericId)) return null;

  const userRepo = getUserRepo();
  const normalizedStatus =
    newStatus.toLowerCase() === "locked" || newStatus.toLowerCase() === "banned"
      ? USER_STATUS.LOCKED
      : USER_STATUS.ACTIVE;

  await userRepo.update({ id: numericId }, { status: normalizedStatus });
  return await findCustomerDetailById(numericId);
};

export {
  findCustomersPaginated,
  findCustomerDetailById,
  updateCustomerAccountStatus,
};
export default {
  findCustomersPaginated,
  findCustomerDetailById,
  updateCustomerAccountStatus,
};
