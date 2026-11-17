<div align="center">

# 🐾 ANIMORA

**Nền tảng Chăm sóc, Mua sắm & Nhận nuôi Thú cưng**

Đặt lịch dịch vụ & khám thú y · Mua sắm tại Shop · Nhận nuôi từ Trạm cứu hộ · Sổ sức khỏe thú cưng · Trợ lý AI

![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v24_LTS-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-ESM-000000?logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-EntitySchema-E83524)

*Dự án Mock OJT – **DN26_CPL – Group 14** · 3 Sprints, 5 tuần*

</div>

---

## 📑 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Các role trong hệ thống](#-các-role-trong-hệ-thống)
- [Quy tắc nghiệp vụ quan trọng](#-quy-tắc-nghiệp-vụ-quan-trọng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [Scripts](#-scripts)
- [Quy chuẩn Front-End](#-quy-chuẩn-front-end)
- [Quy chuẩn làm việc nhóm](#-quy-chuẩn-làm-việc-nhóm)
- [Deploy](#-deploy)
- [Nhóm thực hiện](#-nhóm-thực-hiện)
- [Tài liệu liên quan](#-tài-liệu-liên-quan)

---

## 📖 Giới thiệu

**Animora** là nền tảng giúp khách hàng:

- 🗓️ **Đặt lịch** dịch vụ chăm sóc / khám thú y
- 🛒 **Mua sắm** tại Shop nội bộ
- 🏠 **Nhận nuôi** thú cưng từ các Trạm cứu hộ
- 📒 **Theo dõi sổ sức khỏe** cho thú cưng của mình
- 🤖 **Hỏi nhanh trợ lý AI** để được tư vấn chăm sóc

Hệ thống phục vụ **7 role** (Khách hàng, Bác sĩ, Nhân viên chăm sóc, Quản lý nghiệp vụ chính, Admin, Supplier, Trạm cứu hộ), được phân quyền rõ ràng theo từng nghiệp vụ.

---

## ✨ Tính năng chính

| Nhóm tính năng | Mô tả |
| :--- | :--- |
| **Tài khoản & hồ sơ** | Đăng ký, đăng nhập (JWT), quên / đổi mật khẩu, cập nhật thông tin cá nhân |
| **Hồ sơ thú cưng & sổ sức khỏe** | Hồ sơ từng thú cưng (loài, giống, tuổi, cân nặng…), lịch sử khám, đơn thuốc, tiêm phòng |
| **Nhắc lịch** | Nhắc tiêm phòng, tẩy giun, tái khám, uống thuốc, lịch hẹn (cronjob + thông báo realtime) |
| **Đặt lịch dịch vụ** | Tìm bác sĩ theo đánh giá, chọn dịch vụ, chọn khung giờ; thanh toán trả trước / trả sau (cấu hình theo từng dịch vụ) |
| **Thanh toán** | VNPAY (online) và xác nhận tiền mặt |
| **Shop** | Danh mục sản phẩm, giỏ hàng, voucher, gợi ý sản phẩm, đặt hàng, theo dõi đơn |
| **Thuốc theo đơn** | Mua lại thuốc từ đơn bác sĩ kê (có giới hạn số lần mua lại với bệnh nhẹ) |
| **Kho & nhập hàng** | Đơn nhập hàng (PO) từ Supplier, nhập kho theo lô / hạn sử dụng (FEFO), cảnh báo tồn kho thấp |
| **Nhận nuôi** | Trạm cứu hộ đăng thú cưng, khách gửi yêu cầu và theo dõi tiến trình xét duyệt |
| **Đổi trả / hoàn tiền** | Gửi yêu cầu, theo dõi trạng thái hoàn tiền |
| **Trợ lý AI** | Chat tư vấn chăm sóc thú cưng (Google Gemini), có guardrails chặn kê thuốc / chẩn đoán |
| **Quản trị** | Quản lý nhân sự, lịch làm việc, nghỉ phép, dịch vụ, Shop; Admin quản lý user & phân quyền |

---

## 👥 Các role trong hệ thống

| Role | Vai trò chính |
| :--- | :--- |
| **Khách hàng** | Đặt lịch dịch vụ, mua sắm, nhận nuôi, xem sổ sức khỏe thú cưng, đánh giá, chat AI |
| **Bác sĩ** | Khám, chẩn đoán, kê đơn thuốc (chỉ bác sĩ được kê đơn), cập nhật sổ sức khỏe, quản lý lịch làm việc |
| **Nhân viên chăm sóc thú cưng** | Thực hiện dịch vụ chăm sóc (tắm, cắt tỉa, trông giữ…); gồm full-time và part-time |
| **Quản lý nghiệp vụ chính** | Điều phối toàn bộ vận hành: duyệt hồ sơ & lịch nhân sự, đặt lịch, dịch vụ, Shop, nhận nuôi, đổi trả / hoàn tiền, xác nhận trạng thái dịch vụ / đơn hàng |
| **Admin** | Cấu hình hệ thống, danh sách user, phân quyền, khóa / mở tài khoản, cấp tài khoản Supplier; dữ liệu vận hành chỉ **xem** |
| **Supplier** (Nhà cung cấp) | Nhận và xử lý đơn nhập hàng từ Shop, giao hàng; tài khoản do Admin cấp |
| **Trạm cứu hộ** | Đối tác liên kết: đăng thú cưng cần nhận nuôi, xét duyệt yêu cầu nhận nuôi |

---

## 📋 Quy tắc nghiệp vụ quan trọng

### Đặt lịch

- Hủy / đổi lịch phải báo trước tối thiểu **24 giờ**.
- Hủy / đổi trong vòng **dưới 3 giờ** bị tính phí **50%** giá dịch vụ.
- Đặt trước tối đa **60 ngày**; thời gian đặt trước tối thiểu phụ thuộc từng dịch vụ (xem [Quy tắc đặt lịch trên Front-End](#quy-tắc-đặt-lịch-dat-lich--lich-hen)).

### Kê đơn & mua lại thuốc

- Chỉ **bác sĩ** được kê đơn; thuốc được chọn từ danh mục của Shop.
- **Bệnh nhẹ:** đơn được mua lại (có giới hạn số lần); hết lượt thì nhắc đặt lịch khám mới.
- **Bệnh nặng:** bắt buộc khám lại và có đơn thuốc mới.

### Nghỉ phép nhân sự (bác sĩ & nhân viên chăm sóc)

- Tối đa **4 ngày / tháng**, không dồn sang tháng sau, reset vào đầu mỗi tháng.
- Nghỉ ốm và nghỉ không lương đều tính vào số ngày nghỉ tối đa; mỗi ca nghỉ là một ca vắng.
- Đơn nghỉ phép đã duyệt **không thể hủy**.
- Nhân viên part-time chỉ đăng ký ca làm thêm, không có yêu cầu tăng ca.

### Tăng ca

Tuân theo Bộ luật Lao động 2019 (Điều 107):

- Không quá **50%** giờ làm bình thường mỗi ngày
- Tối đa **40 giờ / tháng**, **200 giờ / năm** (một số trường hợp đặc biệt tối đa 300 giờ / năm)

### Shop

- Shop là **Shop nội bộ**: nhập hàng từ Supplier, không phải sàn thương mại điện tử.

> [!NOTE]
> Một số nghiệp vụ trong tài liệu được đánh dấu **(đề xuất)** (cấu hình hệ thống, theo dõi vắng mặt, công nợ Supplier, theo dõi sau nhận nuôi…) là phần suy ra từ luồng chung, **cần nhóm xác nhận lại**.

---

## 🛠 Công nghệ sử dụng

### Front-End

| Thành phần | Công nghệ |
| :--- | :--- |
| Framework | [Next.js](https://nextjs.org) `16.4.3` (App Router) |
| UI Library | React `19.3.0` + React Compiler (`babel-plugin-react-compiler`) |
| Ngôn ngữ | TypeScript `^5` (strict mode, path alias `@/*` → `src/*`) |
| Styling | Tailwind CSS `^4` (`@tailwindcss/turbopack`), `tw-animate-css` |
| Linting | ESLint `^9` (`eslint-config-next`) |
| Font | [Geist](https://vercel.com/font) qua [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) |
| Deploy | Vercel |

**Thư viện chính**

| Nhóm | Thư viện | Mục đích sử dụng |
| :--- | :--- | :--- |
| **UI & Components** | `@base-ui/react`, `shadcn`, `lucide-react`, `cmdk` | Component UI (Dialog, Select, Sheet, Tabs, Tooltip…), icon, command palette |
| **Styling & Theme** | `next-themes`, `clsx`, `tailwind-merge`, `class-variance-authority` | Quản lý Dark / Light mode và ghép class Tailwind động (`cn()`) |
| **Thông báo** | `sonner` | Toast notification đồng nhất toàn hệ thống |
| **State & Data** | `zustand`, `@tanstack/react-query`, `axios` | Quản lý state, cache / fetch API |
| **Form & Validation** | `react-hook-form`, `@hookform/resolvers`, `zod` | Quản lý form và validate dữ liệu theo schema |
| **Đa ngôn ngữ (i18n)** | `i18next`, `react-i18next` | Hỗ trợ song ngữ Việt / Anh (`vi` / `en`) |

### Back-End

| Thành phần | Công nghệ |
| :--- | :--- |
| Runtime & Framework | Node.js (v24 LTS) + Express.js, viết theo **ESM** (`"type": "module"`) |
| Cơ sở dữ liệu | Microsoft SQL Server 2022 (driver `mssql`, chạy bằng Docker ở local) |
| ORM | TypeORM (`EntitySchema` cho JavaScript) |
| Xác thực & bảo mật | `jsonwebtoken`, `bcryptjs`, `helmet`, `cors` |
| Validation | `joi` |
| Upload | `multer` + `cloudinary` |
| Tích hợp bên thứ 3 | `nodemailer`, Google Gemini (`@google/generative-ai`), VNPAY, `socket.io` |
| Tác vụ ngầm | `node-cron` |
| Test | `jest` + `supertest` |
| Deploy | Render.com (hoặc Railway) |

---

## 📁 Cấu trúc dự án

```text
animora/
├── animora-frontend/        # Next.js (App Router)
│   └── src/                 # Chi tiết bên dưới
└── animora-backend/         # Node.js + Express (Layered Architecture)
    ├── src/
    │   ├── config/          # environment.js, cors.js, data-source.js, ...
    │   ├── entities/        # EntitySchema TypeORM (ánh xạ bảng SQL Server)
    │   ├── repositories/    # Truy vấn CSDL
    │   ├── services/        # Nghiệp vụ, Transaction
    │   ├── providers/       # Gọi dịch vụ bên ngoài (email, Gemini, VNPAY, Cloudinary)
    │   ├── controllers/     # Điều phối request / response
    │   ├── validators/      # Schema Joi
    │   ├── middlewares/     # auth, role, validate, upload, error
    │   ├── routes/          # Định tuyến /api/v1
    │   ├── jobs/            # Cronjob (tồn kho thấp, nhắc lịch)
    │   ├── utils/           # ApiError, apiResponse, asyncHandler, ...
    │   ├── app.js
    │   └── server.js
    ├── tests/
    ├── docker-compose.yml
    ├── .env.example
    └── rules.md             # Quy chuẩn kỹ thuật Back-End
```

### Front-End (`animora-frontend/src/`)

```text
src/
├── actions/        # Server actions / form handlers
├── app/            # Next.js App Router pages & layouts
│   ├── (auth)/     # Đăng nhập, đăng ký
│   ├── (user)/     # Trang người dùng (đặt lịch, lịch hẹn, dịch vụ, cửa hàng, nhận nuôi, hồ sơ thú cưng)
│   ├── admin/      # Cổng Quản trị viên (/admin/*)
│   ├── expert/     # Cổng Bác sĩ / Chuyên viên (/expert/*)
│   ├── manager/    # Cổng Quản lý vận hành (/manager/*)
│   ├── 403/        # Trang từ chối truy cập (đồng bộ theme Animora)
│   └── api/        # Route handlers (API nội bộ / mock endpoints)
├── components/     # UI components theo domain (booking/, pet/, manager/, expert/, admin/, shared/, ui/)
├── constants/      # Hằng số cấu hình & ROUTES (config.constant.ts)
├── contexts/       # React Context providers
├── data/           # Dữ liệu chuẩn & seed data (servicesData.ts, serviceBookingData.ts, managerOpsData.ts, ...)
├── hooks/          # Custom hooks tách logic khỏi UI (booking/, pet/, animora/, expert/, ...)
├── lib/            # Tiện ích dùng chung (utils.ts – hàm cn)
├── locales/        # Từ điển ngôn ngữ VI / EN
├── schemas/        # Zod validation schemas
├── services/       # API clients & service wrappers (axios)
├── store/          # Zustand stores
├── types/          # TypeScript interfaces & types (animora.type.ts, expert.type.ts, ...)
└── utils/          # Pure helpers & unit tests (dateFormat.ts, bookingHistoryUtils.ts, petLogic.ts, ...)
```

### Luồng xử lý một request (Back-End)

```text
Route → Middleware (Auth → Role → Validate) → Controller → Service → Repository → Database
                                                              │
                                                              └──► Provider (email, Gemini, VNPAY, Cloudinary)
```

Chi tiết xem [`animora-backend/rules.md`](animora-backend/rules.md).

---

## 🚀 Bắt đầu nhanh

### Yêu cầu

| Công cụ | Ghi chú |
| :--- | :--- |
| [Node.js](https://nodejs.org) | v24 LTS |
| [Docker](https://www.docker.com) | Chạy SQL Server ở local |
| Git | Quản lý mã nguồn |
| Công cụ kết nối SQL Server | SSMS / Azure Data Studio / DBeaver |

### 1. Clone dự án

```bash
git clone <đường-dẫn-repo>
cd animora
```

### 2. Chạy Back-End

```bash
cd animora-backend

# Dựng SQL Server 2022 bằng Docker
docker compose up -d

# Tạo file biến môi trường rồi điền giá trị
cp .env.example .env

# Cài thư viện và chạy server
npm install
npm run dev
```

**Khởi tạo cơ sở dữ liệu:** sau khi `docker compose up -d`, kết nối vào `localhost,1433` (user `sa`, mật khẩu xem trong `.env.example`) và chạy file `animora-sqlserver-v0_1.sql` để tạo **54 bảng**.

API chạy tại [http://localhost:5000](http://localhost:5000), prefix `/api/v1`.

> [!IMPORTANT]
> `.env` **không** được commit lên Git. Khi thêm biến môi trường mới phải cập nhật `.env.example` và thông báo cho nhóm.

### 3. Chạy Front-End

```bash
cd animora-frontend
npm install
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Chạy development server:

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt. Trang sẽ tự cập nhật khi bạn chỉnh sửa file.

> [!TIP]
> Back-End dùng CORS whitelist. Hãy thêm `http://localhost:3000` vào `CORS_ORIGINS` trong `.env` của Back-End, nếu không trình duyệt sẽ bị chặn (403).

---

## 📜 Scripts

### Back-End (`animora-backend`)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy server môi trường dev (`nodemon`, hiện stack trace khi lỗi) |
| `npm start` | Chạy server môi trường production |
| `npm test` | Chạy Jest + Supertest |

### Front-End (`animora-frontend`)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy development server (port 3000) |
| `npx tsc --noEmit` | Kiểm tra TypeScript (**bắt buộc trước khi commit**) |
| `npx tsx --test src/data/serviceBookingData.test.ts src/utils/bookingHistoryUtils.test.ts src/utils/petLogic.test.ts` | Chạy unit tests |
| `npm run lint` | Kiểm tra ESLint |
| `npm run build` | Build bản production |
| `npm start` | Chạy bản đã build |

---

## 🎨 Quy chuẩn Front-End

### Quy ước code & UI

**1. Tách biệt Logic và UI**

- Logic tính toán thuần đặt trong `src/utils/`, kèm unit test (`*.test.ts`).
- State phức tạp và side-effects đặt trong custom hooks ở `src/hooks/`.
- Component trong `src/components/` chỉ tập trung render giao diện, nhận props / callbacks.

**2. Định dạng ngày giờ & đơn vị**

| Trường hợp | Quy định |
| :--- | :--- |
| Lưu trữ / state nội bộ | Luôn dùng chuẩn ISO `YYYY-MM-DD` |
| Hiển thị cho người dùng | Luôn dùng `dd-MM-yyyy` hoặc `dd-MM-yyyy HH:mm` thông qua `formatDateDdMmYyyy`, `formatDateTimeDdMmYyyy` (`src/utils/dateFormat.ts`) hoặc `formatIsoDateForDisplay` |
| Cân nặng thú cưng | Ô nhập chỉ nhận giá trị số, hiển thị hậu tố `kg` cố định bên phải và tự động gắn `kg` khi lưu |

**3. Theme & Responsive**

- Giao diện User dùng biến CSS (`--bg`, `--surface`, `--surface-2`, `--primary`, `--coral`, `--border`, `--text`, `--text-muted`) để tự động tương thích Dark / Light mode.
- Các cổng nội bộ (`/admin`, `/expert`, `/manager`) dùng chung `PortalSidebar` (`src/components/shared/portal/PortalSidebar.tsx`):
  - Mặc định thu gọn `72px` trên desktop (`md:w-[72px]`)
  - Mở rộng nổi `256px` khi hover (`md:w-64`)
  - Layout chừa lề `md:pl-[72px]`

**4. Base-UI `<Select>`**

Luôn truyền nhãn hiển thị tường minh bên trong `<SelectValue>` để tránh hiển thị raw value (`vet`, `postpaid`…) khi đóng dropdown:

```tsx
<SelectValue>{LABEL_MAP[value]}</SelectValue>
```

### Đồng bộ dữ liệu & nghiệp vụ trên Front-End

**Single Source of Truth cho Dịch vụ**

- `SERVICES_DATA` (`src/data/servicesData.ts`) là nguồn dữ liệu chuẩn duy nhất cho `/dich-vu`, `/dat-lich`, và được map trực tiếp sang `SEED_SERVICE_CONFIG` (`src/data/managerOpsData.ts`) của Manager.
- Quy định thanh toán (`prepaid` / `postpaid`) chỉnh sửa ở Manager (`ServiceConfigTab`) được đồng bộ qua `SERVICE_PAYMENT_SETTINGS_KEY`.

#### Quy tắc đặt lịch (`/dat-lich` & `/lich-hen`)

- **Đặt trước tối đa:** 60 ngày (`TIME_SLOT_CONFIG.maxAdvanceDays = 60`).
- **Đặt trước tối thiểu** (`minAdvanceHours`) theo dịch vụ:

  | Thời gian | Dịch vụ |
  | :--- | :--- |
  | `2h` | Khám tổng quát, Tiêm phòng vaccine, Tẩy giun định kỳ, Spa & tắm |
  | `12h` | Lưu trú, Huấn luyện |
  | `24h` | Nha khoa & Chăm sóc Thú nhỏ |

- **Chống đặt trùng lịch:** `getTimeSlotsForDate` tự động khóa slot nếu cùng thú cưng hoặc cùng bác sĩ đã có lịch chưa hủy ở ngày & giờ đó.
- **Nhắc lịch:** trang `/lich-hen` hiển thị `UpcomingReminderBanner` nhắc các lịch hẹn sắp tới trong vòng `24h` và `2h` (kèm nhắc nhịn ăn nếu là Nha khoa).

---

## 🤝 Quy chuẩn làm việc nhóm

### Quy chuẩn API

Mọi API trả về cùng một cấu trúc JSON:

```jsonc
// Thành công
{ "success": true, "message": "Đặt lịch dịch vụ thành công", "data": { "id": 105 } }

// Thất bại
{ "success": false, "message": "...", "errorCode": "PRESCRIPTION_REQUIRED", "errors": null }
```

- Danh sách có phân trang dùng `?page=1&limit=10&search=...&status=...` và trả thêm `meta` (`page`, `limit`, `totalItems`, `totalPages`).
- Lỗi validation trả **422**, vi phạm nghiệp vụ trả **400**.

### Quy trình Git (GitFlow rút gọn)

| Nhánh | Quy tắc |
| :--- | :--- |
| `main` | Code ổn định để chấm điểm cuối Sprint và deploy. **Cấm push thẳng.** |
| `develop` | Nhánh tích hợp chung. **Cấm push thẳng**, chỉ merge qua Pull Request. |
| `feature/<tên>-<mã-uc>-<mô-tả-ngắn>` | Nhánh phát triển tính năng |
| `fix/<tên>-<mã-uc>-<mô-tả-lỗi>` | Nhánh sửa lỗi |

**Commit:** theo [Conventional Commits](https://www.conventionalcommits.org), gắn mã Use Case:

```text
feat(BKG-01): hoàn thành API đặt lịch
```

**Pull Request:**

- Cần ít nhất **1 người review**.
- Back-End: `npm test` phải **pass**. Front-End: `npx tsc --noEmit`, `npm run lint` và `npm run build` phải **pass** trước khi merge.

**Nghiêm cấm:**

- ❌ Commit `.env`, `node_modules/`, `uploads/`
- ❌ Dùng `git push --force` lên `develop` hoặc `main`

---

## ☁️ Deploy

| Thành phần | Nền tảng | Ghi chú |
| :--- | :--- | :--- |
| Front-End | [Vercel](https://vercel.com/new) | Tự deploy khi merge vào `main`. Khai báo `NEXT_PUBLIC_API_BASE_URL` trỏ về Back-End |
| Back-End | Render.com / Railway | Chạy server Express 24/7 (cần cho cronjob và Socket.io, nên không dùng serverless) |
| Database | Azure SQL Database (Free) hoặc MonsterASP / SmarterASP.NET | Lưu connection string trong biến môi trường trên Render |
| Test VNPAY ở local | Ngrok | `ngrok http 5000` để lấy URL HTTPS công khai cho IPN |

Xem thêm: [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

## 👨‍💻 Nhóm thực hiện

**DN26_CPL – Group 14**

| Phần | Thành viên |
| :--- | :--- |
| **Back-End** | Toàn, Phương, Hoàng |
| **Front-End** | Thùy, Tuấn Anh |

Phân công file Back-End theo thành viên xem ở mục 4 của [`rules.md`](animora-backend/rules.md).

---

## 📚 Tài liệu liên quan

- [`animora-backend/rules.md`](animora-backend/rules.md) – Quy chuẩn kỹ thuật & tổ chức code Back-End
- `animora-sqlserver-v0_1.sql` – Script tạo CSDL (54 bảng)
- Tài liệu "Chi tiết nghiệp vụ theo role" – mô tả nghiệp vụ 7 role và bảng tóm tắt quyền hạn
- Next.js: [Documentation](https://nextjs.org/docs) · [Learn Next.js](https://nextjs.org/learn) · [GitHub repository](https://github.com/vercel/next.js)
