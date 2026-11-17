# Animora Frontend — Quy chuẩn & Kiến trúc Dự án (`rule.md`)

Tài liệu này mô tả công nghệ, cấu trúc thư mục, thư viện và các quy ước phát triển cho phần **Frontend** của hệ thống **Animora Pet Care**.

---

## 1. Công nghệ cốt lõi (Tech Stack)

- **Framework:** Next.js `16.4.3` (App Router)
- **UI Library:** React `19.3.0` + React Compiler (`babel-plugin-react-compiler`)
- **Ngôn ngữ:** TypeScript `^5` (strict mode, path alias `@/*` -> `src/*`)
- **Styling:** Tailwind CSS `^4` (`@tailwindcss/turbopack`), `tw-animate-css`
- **Linting:** ESLint `^9` (`eslint-config-next`)

---

## 2. Thư viện chính (Dependencies)

| Nhóm | Thư viện | Mục đích sử dụng |
|---|---|---|
| **UI & Components** | `@base-ui/react`, `shadcn`, `lucide-react`, `cmdk` | Component UI (Dialog, Select, Sheet, Tabs, Tooltip...), icon, command palette |
| **Styling & Theme** | `next-themes`, `clsx`, `tailwind-merge`, `class-variance-authority` | Quản lý Dark/Light mode và ghép class Tailwind động (`cn()`) |
| **Thông báo** | `sonner` | Toast notification đồng nhất toàn hệ thống |
| **State & Data** | `zustand`, `@tanstack/react-query`, `axios` | Quản lý state, cache/fetch API |
| **Form & Validation** | `react-hook-form`, `@hookform/resolvers`, `zod` | Quản lý form và validate dữ liệu theo schema |
| **Đa ngôn ngữ (i18n)** | `i18next`, `react-i18next` | Hỗ trợ song ngữ Việt / Anh (`vi` / `en`) |

---

## 3. Cấu trúc thư mục (`frontend/src/`)

```text
src/
├── actions/        # Server actions / form handlers
├── app/            # Next.js App Router pages & layouts
│   ├── (auth)/     # Đăng nhập, đăng ký
│   ├── (user)/     # Trang người dùng (đặt lịch, lịch hẹn, dịch vụ, cửa hàng, nhận nuôi, hồ sơ thú cưng)
│   ├── admin/      # Cổng Quản trị viên (/admin/*)
│   ├── expert/     # Cổng Bác sĩ / Chuyên viên (/expert/*)
│   ├── manager/    # Cổng Quản lý vận hành (/manager/*)
│   ├── 403/        # Trang từ chối truy cập (thân thiện, đồng bộ theme Animora)
│   └── api/        # Route handlers (API nội bộ / mock endpoints)
├── components/     # UI components chia theo domain (booking/, pet/, manager/, expert/, admin/, shared/, ui/)
├── constants/      # Hằng số cấu hình & ROUTES (`config.constant.ts`)
├── contexts/       # React Context providers
├── data/           # Dữ liệu chuẩn & seed data (`servicesData.ts`, `serviceBookingData.ts`, `managerOpsData.ts`, `petProfilesData.ts`, `doctorsDirectory.ts`...)
├── hooks/          # Custom React hooks tách logic khỏi UI (`booking/`, `pet/`, `animora/`, `expert/`...)
├── lib/            # Tiện ích dùng chung (`utils.ts` - hàm `cn`)
├── locales/        # File từ điển ngôn ngữ VI/EN
├── schemas/        # Zod validation schemas
├── services/       # API clients & service wrappers (axios)
├── store/          # Zustand stores
├── types/          # TypeScript interfaces & types (`animora.type.ts`, `expert.type.ts`...)
└── utils/          # Pure helpers & unit tests (`dateFormat.ts`, `bookingHistoryUtils.ts`, `petLogic.ts`, `clinicalSync.ts`, `cartLogic.ts`)
```

---

## 4. Quy ước Code & UI (Coding & UI Rules)

1. **Tách biệt Logic và UI:**
   - Logic tính toán thuần đặt trong `src/utils/` kèm unit test (`*.test.ts`).
   - State phức tạp và side-effects đặt trong custom hooks ở `src/hooks/`.
   - Component trong `src/components/` chỉ tập trung render giao diện và nhận props/callbacks.

2. **Định dạng ngày giờ & đơn vị:**
   - **Lưu trữ / state nội bộ:** luôn dùng chuẩn ISO `YYYY-MM-DD`.
   - **Hiển thị cho người dùng:** luôn dùng `dd-MM-yyyy` hoặc `dd-MM-yyyy HH:mm` thông qua `formatDateDdMmYyyy`, `formatDateTimeDdMmYyyy` (`src/utils/dateFormat.ts`) hoặc `formatIsoDateForDisplay`.
   - **Cân nặng thú cưng:** ô nhập chỉ nhận giá trị số, hiển thị hậu tố `kg` cố định bên phải và tự động gắn `kg` khi lưu.

3. **Theme & Responsive:**
   - Giao diện User dùng biến CSS (`--bg`, `--surface`, `--surface-2`, `--primary`, `--coral`, `--border`, `--text`, `--text-muted`) để tự động tương thích Dark/Light mode.
   - Các cổng nội bộ (`/admin`, `/expert`, `/manager`) dùng chung `PortalSidebar` (`src/components/shared/portal/PortalSidebar.tsx`): mặc định thu gọn `72px` trên desktop (`md:w-[72px]`), mở rộng nổi `256px` khi hover (`md:w-64`), và layout chừa lề `md:pl-[72px]`.

4. **Base-UI `<Select>`:**
   - Luôn truyền nhãn hiển thị tiếng Việt/Anh tường minh bên trong `<SelectValue>{LABEL_MAP[value]}</SelectValue>` để tránh hiển thị raw value (`vet`, `postpaid`...) khi đóng dropdown.

---

## 5. Quy tắc Nghiệp vụ & Đồng bộ Dữ liệu

1. **Single Source of Truth cho Dịch vụ:**
   - `SERVICES_DATA` (`src/data/servicesData.ts`) là nguồn dữ liệu chuẩn duy nhất cho `/dich-vu`, `/dat-lich` và được map trực tiếp sang `SEED_SERVICE_CONFIG` (`src/data/managerOpsData.ts`) của Manager.
   - Quy định thanh toán (`prepaid` / `postpaid`) chỉnh sửa ở Manager (`ServiceConfigTab`) được đồng bộ qua `SERVICE_PAYMENT_SETTINGS_KEY`.

2. **Quy tắc Đặt lịch (`/dat-lich` & `/lich-hen`):**
   - Giới hạn đặt trước tối đa: **60 ngày** (`TIME_SLOT_CONFIG.maxAdvanceDays = 60`).
   - Thời gian đặt trước tối thiểu (`minAdvanceHours`) theo dịch vụ: `2h` (Khám tổng quát, Tiêm phòng vaccine, Tẩy giun định kỳ, Spa & tắm), `12h` (Lưu trú, Huấn luyện), `24h` (Nha khoa & Chăm sóc Thú nhỏ).
   - Chống đặt trùng lịch: `getTimeSlotsForDate` tự động khóa slot nếu cùng thú cưng hoặc cùng bác sĩ đã có lịch chưa hủy ở ngày & giờ đó.
   - Trang `/lich-hen` hiển thị `UpcomingReminderBanner` nhắc các lịch hẹn sắp tới trong vòng `24h` và `2h` (kèm nhắc nhịn ăn nếu là Nha khoa).

---

## 6. Lệnh kiểm tra (Scripts & Verification)

Chạy tại thư mục `frontend/`:

```bash
# Chạy môi trường dev
npm run dev

# Kiểm tra TypeScript (bắt buộc trước khi commit)
npx tsc --noEmit

# Chạy unit tests
npx tsx --test src/data/serviceBookingData.test.ts src/utils/bookingHistoryUtils.test.ts src/utils/petLogic.test.ts

# Kiểm tra ESLint & Build production
npm run lint
npm run build
```
