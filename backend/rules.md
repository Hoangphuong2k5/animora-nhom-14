# 📘 QUY CHUẨN KỸ THUẬT & TỔ CHỨC CODE BACK-END (RULES & CONVENTIONS)
**Dự án:** ANIMORA – Nền tảng Chăm sóc, Mua sắm và Nhận nuôi Thú cưng  
**Nhóm thực hiện:** DN26_CPL – Group 14 (Team Back-End: **Toàn, Phương, Hoàng**)  
**Mục đích:** Thống nhất 100% cách tổ chức thư mục, đặt tên file, luồng xử lý giữa các tầng, chuẩn API và cách viết code để 3 thành viên BE code đồng nhất như một người viết, tránh xung đột (merge conflict) khi ghép code.

---

## 📑 MỤC LỤC

- [1. CÔNG NGHỆ SỬ DỤNG (TECH STACK)](#1-công-nghệ-sử-dụng-tech-stack)
- [2. CẤU TRÚC THƯ MỤC CHUẨN (LAYERED ARCHITECTURE)](#2-cấu-trúc-thư-mục-chuẩn-layered-architecture)
- [3. PHÂN ĐỊNH TRÁCH NHIỆM TỪNG TẦNG (LUỒNG ĐI CỦA 1 REQUEST)](#3-phân-định-trách-nhiệm-từng-tầng-luồng-đi-của-1-request)
- [4. PHÂN CÔNG FILE THEO THÀNH VIÊN (TRÁNH XUNG ĐỘT GIT)](#4-phân-công-file-theo-thành-viên-tránh-xung-đột-git)
- [5. QUY ƯỚC ĐẶT TÊN (NAMING CONVENTIONS)](#5-quy-ước-đặt-tên-naming-conventions)
- [6. QUY CHUẨN PHẢN HỒI API (API RESPONSE & ERROR CONTRACT)](#6-quy-chuẩn-phản-hồi-api-api-response--error-contract)
- [7. CODE MẪU CHUẨN (TEMPLATES ĐỂ COPY & DÙNG THỐNG NHẤT)](#7-code-mẫu-chuẩn-templates-để-copy--dùng-thống-nhất)
- [8. CÁC QUY TẮC CƠ SỞ DỮ LIỆU & NGHIỆP VỤ BẮT BUỘC NHỚ](#8-các-quy-tắc-cơ-sở-dữ-liệu--nghiệp-vụ-bắt-buộc-nhớ)
- [9. QUY TRÌNH LÀM VIỆC VỚI GIT & GITHUB (MÔ HÌNH GITFLOW RÚT GỌN)](#9-quy-trình-làm-việc-với-git--github-mô-hình-gitflow-rút-gọn)
- [10. QUY CHUẨN DOCKER, TÊN MIỀN & TRIỂN KHAI (DEPLOYMENT - 100% FREE)](#10-quy-chuẩn-docker-tên-miền--triển-khai-deployment---100-free)

**📎 PHẦN BỔ SUNG (MỤC 11 → 19)**

- [11. BỔ SUNG THƯ VIỆN, SCRIPTS & CHUẨN ESM ("type": "module")](#11-bổ-sung-thư-viện-scripts--chuẩn-esm-type-module)
- [12. QUẢN LÝ BIẾN MÔI TRƯỜNG TẬP TRUNG (config/environment.js)](#12-quản-lý-biến-môi-trường-tập-trung-configenvironmentjs)
- [13. CẤU HÌNH CORS (WHITELIST ORIGIN)](#13-cấu-hình-cors-whitelist-origin)
- [14. BỔ SUNG QUY TẮC VALIDATION (JOI)](#14-bổ-sung-quy-tắc-validation-joi)
- [15. BỔ SUNG XỬ LÝ LỖI TẬP TRUNG (ERROR HANDLING)](#15-bổ-sung-xử-lý-lỗi-tập-trung-error-handling)
- [16. KIỂM THỬ (TESTING) VỚI JEST + SUPERTEST](#16-kiểm-thử-testing-với-jest--supertest)
- [17. TẦNG ENTITY (THAY CHO TẦNG "MODEL")](#17-tầng-entity-thay-cho-tầng-model)
- [18. THƯ MỤC providers/ (GỌI DỊCH VỤ BÊN NGOÀI)](#18-thư-mục-providers-gọi-dịch-vụ-bên-ngoài)
- [19. PHỤ LỤC: CÁC FILE / DÒNG CẦN THÊM VÀO DỰ ÁN](#19-phụ-lục-các-file--dòng-cần-thêm-vào-dự-án)

---

## 1. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

Toàn bộ thành viên Back-End thống nhất sử dụng bộ công nghệ và thư viện dưới đây (không tự ý cài thêm thư viện trùng chức năng khi chưa thống nhất nhóm):

| Thành phần | Công nghệ / Thư viện | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Runtime & Framework** | **Node.js** (v24 LTS) + **Express.js** (`.js`) | Xây dựng RESTful API Server |
| **Cơ sở dữ liệu** | **Microsoft SQL Server** (`mssql` driver) | Hệ quản trị CSDL (`animora-sqlserver-v0_1.sql` - 54 bảng) |
| **ORM** | **TypeORM** (dùng `EntitySchema` cho JavaScript) | Mapping bảng CSDL, Query Builder, Quản lý Transaction |
| **Xác thực & Bảo mật** | `jsonwebtoken` (JWT), `bcryptjs`, `helmet`, `cors` | Đăng nhập Bearer Token, mã hóa mật khẩu, bảo mật HTTP |
| **Validation (Kiểm tra đầu vào)** | `joi` hoặc `express-validator` (khuyến nghị **Joi**) | Kiểm tra dữ liệu `req.body`, `req.query`, `req.params` |
| **Upload File / Ảnh** | `multer` + `cloudinary` (hoặc lưu local `/uploads`) | Upload avatar, ảnh thú cưng, chứng chỉ, sản phẩm |
| **Tích hợp bên thứ 3** | `nodemailer` (Email), `@google/generative-ai` (Gemini AI), **VNPAY** (`crypto` HMAC-SHA512), `socket.io` (Thông báo) | Quên mật khẩu, Chatbot AI, Thanh toán online, Realtime Notification |
| **Tác vụ ngầm (Cronjob)** | `node-cron` | Cảnh báo tồn kho thấp (`INV-04`), nhắc lịch hẹn (`NTF-01`) |
| **Tiện ích chung** | `dotenv` (biến môi trường), `dayjs` (xử lý thời gian UTC), `morgan` (log HTTP) | Quản lý config và xử lý ngày giờ chuẩn UTC |

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN (LAYERED ARCHITECTURE)

Dự án tổ chức theo **Kiến trúc Phân tầng truyền thống (Layered Architecture)**. Để tránh việc sửa chung 1 file gây conflict Git giữa **Toàn, Phương và Hoàng**, mỗi phân hệ (domain) sẽ được tách thành **1 file riêng biệt** bên trong từng thư mục tầng.

```text
animora-backend/
├── src/
│   ├── config/                     # Cấu hình hệ thống & kết nối bên ngoài
│   │   ├── environment.js          # Load .env vào process.env, export object env dùng chung
│   │   ├── cors.js                 # Cấu hình CORS (whitelist origin)
│   │   ├── data-source.js          # Cấu hình kết nối TypeORM với SQL Server
│   │   ├── vnpay.config.js         # Cấu hình thông số VNPAY
│   │   ├── gemini.config.js        # Cấu hình Google Gemini AI & System Prompt
│   │   └── mailer.config.js        # Cấu hình SMTP gửi email
│   │
│   ├── entities/                   # Định nghĩa EntitySchema của TypeORM (ánh xạ bảng SQL Server)
│   │   ├── user.entity.js          # Bảng users, password_reset_tokens, addresses
│   │   ├── pet.entity.js           # Bảng pets, pet_vaccinations, pet_care_logs
│   │   ├── service.entity.js       # Bảng services, expert_services
│   │   ├── expert.entity.js        # Bảng experts, expert_certificates, expert_schedules, expert_schedule_slots, expert_reviews
│   │   ├── booking.entity.js       # Bảng bookings, payments
│   │   ├── product.entity.js       # Bảng products, product_categories
│   │   ├── inventory.entity.js     # Bảng suppliers, purchase_orders, goods_receipts, inventory_batches, stock_movements
│   │   ├── order.entity.js         # Bảng carts, cart_items, orders, order_items, order_status_logs
│   │   ├── medical.entity.js       # Bảng medical_records, prescriptions, prescription_items
│   │   ├── ai.entity.js            # Bảng ai_conversations, ai_messages
│   │   └── notification.entity.js  # Bảng notifications, audit_logs
│   │
│   ├── repositories/               # Tầng truy vấn CSDL (Chỉ làm việc với TypeORM DataSource)
│   │   ├── auth.repository.js
│   │   ├── user.repository.js
│   │   ├── pet.repository.js
│   │   ├── service.repository.js
│   │   ├── expert.repository.js
│   │   ├── booking.repository.js
│   │   ├── payment.repository.js
│   │   ├── product.repository.js
│   │   ├── inventory.repository.js
│   │   ├── cart.repository.js
│   │   ├── order.repository.js
│   │   ├── medical.repository.js
│   │   ├── ai.repository.js
│   │   └── notification.repository.js
│   │
│   ├── services/                   # Tầng xử lý Logic Nghiệp vụ (Business Rules, Transaction)
│   │   ├── auth.service.js         # Xử lý đăng ký, đăng nhập, cấp JWT, quên mật khẩu
│   │   ├── user.service.js         # Xử lý thông tin cá nhân, sổ địa chỉ, phân quyền nhân sự
│   │   ├── pet.service.js          # Xử lý hồ sơ thú cưng, sổ tiêm chủng
│   │   ├── service.service.js      # Xử lý danh mục dịch vụ, tính phí dịch vụ
│   │   ├── expert.service.js       # Xử lý duyệt chuyên viên, sinh slot lịch làm việc
│   │   ├── booking.service.js      # Đặt lịch, khóa slot, hủy lịch (phạt <3h), từ chối lịch
│   │   ├── payment.service.js      # Tạo URL VNPAY, xử lý IPN callback, xác nhận tiền mặt
│   │   ├── product.service.js      # Quản lý sản phẩm, danh mục, cờ thuốc kê đơn
│   │   ├── inventory.service.js    # Đơn nhập PO, kiểm nhận hàng, nhập kho theo lô/HSD (FEFO)
│   │   ├── cart.service.js         # Thêm/sửa/xóa giỏ hàng, kiểm tra tồn kho
│   │   ├── order.service.js        # Checkout đơn hàng, trừ kho, cập nhật vận đơn
│   │   ├── medical.service.js      # Bệnh án thú y, kê đơn thuốc, validate đơn thuốc khi mua
│   │   ├── ai.service.js           # Chat AI tư vấn, Guardrails chặn kê thuốc, gợi ý dịch vụ
│   │   └── notification.service.js # Bắn thông báo cho người dùng
│   │
│   ├── controllers/                # Tầng điều phối Request / Response (Không viết SQL ở đây)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── pet.controller.js
│   │   ├── service.controller.js
│   │   ├── expert.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   ├── product.controller.js
│   │   ├── inventory.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── medical.controller.js
│   │   ├── ai.controller.js
│   │   └── notification.controller.js
│   │
│   ├── validators/                 # Định nghĩa Schema kiểm tra dữ liệu đầu vào (DTO / Validation)
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── pet.validator.js
│   │   ├── booking.validator.js
│   │   ├── product.validator.js
│   │   ├── inventory.validator.js
│   │   ├── order.validator.js
│   │   └── medical.validator.js
│   │
│   ├── middlewares/                # Các Middleware dùng chung toàn hệ thống
│   │   ├── auth.middleware.js      # Verify JWT Bearer Token & gắn vào req.user
│   │   ├── role.middleware.js      # Kiểm tra phân quyền RBAC (authorizeRoles('admin', 'expert'...))
│   │   ├── validate.middleware.js  # Middleware chạy hàm kiểm tra từ thư mục validators/
│   │   ├── upload.middleware.js    # Cấu hình Multer kiểm tra định dạng & dung lượng ảnh
│   │   └── error.middleware.js     # Bắt lỗi tập trung (Global Error Handler)
│   │
│   ├── routes/                     # Định tuyến API (Gắn Middleware + Validator + Controller)
│   │   ├── index.js                # Gộp tất cả route vào tiền tố /api/v1
│   │   ├── auth.route.js           # /api/v1/auth/...
│   │   ├── user.route.js           # /api/v1/users/... & /api/v1/admin/users/...
│   │   ├── pet.route.js            # /api/v1/pets/...
│   │   ├── service.route.js        # /api/v1/services/...
│   │   ├── expert.route.js         # /api/v1/experts/... & /api/v1/admin/experts/...
│   │   ├── booking.route.js        # /api/v1/bookings/...
│   │   ├── payment.route.js        # /api/v1/payments/...
│   │   ├── product.route.js        # /api/v1/products/... & /api/v1/categories/...
│   │   ├── inventory.route.js      # /api/v1/suppliers/... & /api/v1/admin/inventory/...
│   │   ├── cart.route.js           # /api/v1/cart/...
│   │   ├── order.route.js          # /api/v1/orders/... & /api/v1/admin/orders/...
│   │   ├── medical.route.js        # /api/v1/vet/... & /api/v1/prescriptions/...
│   │   ├── ai.route.js             # /api/v1/ai/...
│   │   └── notification.route.js   # /api/v1/notifications/...
│   │
│   ├── jobs/                       # Các tiến trình chạy ngầm tự động (Actor: HT)
│   │   ├── low-stock.job.js        # Quét cảnh báo tồn kho thấp mỗi ngày (INV-04)
│   │   └── reminder.job.js         # Nhắc lịch hẹn trước 2h, cảnh báo đơn thuốc sắp hết hạn (NTF-01)
│   │
│   ├── utils/                      # Các hàm tiện ích dùng chung (Helper functions)
│   │   ├── ApiError.js             # Class tạo lỗi chuẩn có gắn HTTP Status Code
│   │   ├── apiResponse.js          # Hàm format JSON trả về chuẩn (successResponse, paginatedResponse)
│   │   ├── asyncHandler.js         # Hàm bọc async/await tự động đẩy lỗi sang error.middleware.js
│   │   ├── codeGenerator.js        # Sinh mã tự động: BKG-yyyyMMdd-xxx, ORD-yyyyMMdd-xxx, PO-yyyyMMdd-xxx
│   │   └── constants.js            # Khai báo hằng số: ROLES, BOOKING_STATUS, ORDER_STATUS...
│   │
│   ├── app.js                      # Khởi tạo Express app, gắn CORS, JSON parser, Routes, Error Middleware
│   └── server.js                   # Kết nối TypeORM SQL Server, khởi chạy HTTP Server & Cron Jobs
│
├── uploads/                        # Thư mục lưu file tạm (thêm vào .gitignore)
├── docker-compose.yml              # Cấu hình Docker chạy SQL Server 2022 đồng nhất ở Local
├── Dockerfile                      # Đóng gói ứng dụng Node.js 24 Backend (base image `node:24-alpine`, nếu cần deploy container)
├── .env.example                    # File mẫu biến môi trường (commit lên Git)
├── .env                            # File biến môi trường thật (KHÔNG commit lên Git)
├── .gitignore
├── package.json
└── rules.md                        # Tài liệu quy chuẩn kỹ thuật này
```

---

## 3. PHÂN ĐỊNH TRÁCH NHIỆM TỪNG TẦNG (LUỒNG ĐI CỦA 1 REQUEST)

Mọi API bắt buộc phải đi theo đúng chiều mũi tên sau, **không được nhảy cóc** (ví dụ: Controller không được gọi thẳng `AppDataSource` hay `Repository`, mà phải gọi qua `Service`):

```
Client Request 
  ──► Route (Định tuyến) 
    ──► Middleware (Auth JWT -> Check Role -> Validate Input) 
      ──► Controller (Lấy dữ liệu từ req, gọi Service, trả res) 
        ──► Service (Xử lý nghiệp vụ, tính toán, quản lý Transaction, ném ApiError) 
          ──► Repository (Truy vấn SQL Server qua TypeORM) 
            ──► Database (SQL Server)
```

### Quy tắc cụ thể cho từng tầng:
1. **`routes/*.route.js`**:
   - Chỉ khai báo đường dẫn URL, phương thức HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), gắn các middleware (`verifyToken`, `authorizeRoles`, `validate`) và trỏ tới hàm trong `Controller`.
   - Tuyệt đối không viết hàm xử lý `(req, res) => { ... }` trực tiếp trong file route.
2. **`validators/*.validator.js`**:
   - Kiểm tra kiểu dữ liệu đầu vào: bắt buộc nhập (`required`), định dạng email, SĐT Việt Nam, số dương (`price > 0`, `weight > 0`), enum hợp lệ.
3. **`controllers/*.controller.js`**:
   - Chỉ làm 3 việc:
     1. Trích xuất dữ liệu từ `req.body`, `req.params`, `req.query`, `req.user`.
     2. Gọi hàm tương ứng ở `Service`.
     3. Trả kết quả về cho Client bằng hàm chuẩn `successResponse(res, data, message, statusCode)`.
   - Luôn bọc hàm controller bằng `asyncHandler` để không phải viết `try / catch` lặp đi lặp lại.
4. **`services/*.service.js`**:
   - Là "trái tim" của ứng dụng, chứa toàn bộ **Business Rules (Quy tắc nghiệp vụ)**.
   - Kiểm tra điều kiện nghiệp vụ (VD: khách hủy lịch trước `< 3h` thì tính phí phạt 50%; sản phẩm có `is_prescription_required = true` thì phải có đơn thuốc hợp lệ; kiểm tra quyền sở hữu thú cưng `pet.owner_id !== userId`).
   - Nếu vi phạm nghiệp vụ, ném lỗi bằng `throw new ApiError(statusCode, 'Thông báo lỗi tiếng Việt rõ ràng')`.
   - Quản lý **Database Transaction** (`AppDataSource.transaction(...)`) khi một thao tác cần ghi/cập nhật nhiều bảng cùng lúc (VD: Đặt lịch = tạo `bookings` + khóa `expert_schedule_slots`; Checkout = tạo `orders` + tạo `order_items` + trừ tồn `inventory_batches` + xóa `cart_items`).
5. **`repositories/*.repository.js`**:
   - Chỉ chứa các câu lệnh thao tác với TypeORM (`findOne`, `find`, `save`, `update`, `createQueryBuilder`).
   - Hỗ trợ nhận `entityManager` (từ Transaction của Service truyền xuống) khi cần chạy trong Transaction.

---

## 4. PHÂN CÔNG FILE THEO THÀNH VIÊN (TRÁNH XUNG ĐỘT GIT)

Dựa trên bảng phân chia 64 Use Cases MVP, mỗi người chịu trách nhiệm chính trên các cụm file sau:

| Thành viên | Phụ trách các file (`controllers`, `services`, `repositories`, `routes`, `validators`) |
| :--- | :--- |
| **Toàn** | • `auth.*` (Đăng ký, đăng nhập, đăng xuất, quên/đổi mật khẩu)<br>• `user.*` (Profile cá nhân, sổ địa chỉ `addresses`, Admin quản lý nhân sự & phân quyền)<br>• `service.*` (CRUD danh mục dịch vụ `SVC-01`, xem biểu phí `SPAY-01`)<br>• `booking.*` (Khách đặt lịch `BKG-01`, xem chi tiết `BKG-02`, khách hủy lịch `BKG-03`)<br>• `payment.*` (Thanh toán VNPAY & IPN Callback `SPAY-02`, `ORD-02`)<br>• `cart.*` & `order.*` (Giỏ hàng `CRT-01..02`, Checkout, hủy đơn, Admin duyệt & cập nhật đơn `ORD-01..07`) |
| **Phương** | • `pet.*` (Thêm/sửa/xem thú cưng `PET-01..03`, sổ tiêm chủng `PET-05`, lịch sử bệnh án `PET-07`)<br>• `product.*` (Xem/lọc sản phẩm `PRD-01..02`, Admin quản lý danh mục & sản phẩm `PRD-03..05`)<br>• `medical.*` (Bác sĩ xem bệnh sử, tạo bệnh án, kê đơn thuốc `MED-01..04`, kiểm tra điều kiện mua thuốc `MED-07`, mua lại đơn thuốc nhẹ `MED-08`)<br>• Đánh giá chuyên viên (`RVW-01`, `RVW-02`) & Xác nhận thu tiền mặt (`SPAY-05`) |
| **Hoàng** | • `expert.*` (Onboarding chuyên viên `EXP-01`, Admin duyệt chuyên viên `EXP-02`, gán dịch vụ `SVC-02`, lịch làm việc & sinh slot `EXP-03`, tìm kiếm/xem chuyên viên `EXP-04..05`, chuyên viên xử lý lịch hẹn `BKG-05..09`)<br>• `inventory.*` (Nhà cung cấp `SUP-01`, Đơn nhập hàng PO `PUR-01`, Nhận hàng `PUR-04`, Tồn kho lô/HSD & Nhập kho `INV-01..02`, Cảnh báo tồn kho thấp `INV-04`)<br>• `ai.*` (Mở hội thoại, hỏi đáp chăm sóc, Guardrails triệu chứng, gợi ý dịch vụ `AI-01..05`)<br>• `notification.*` (Hệ thống thông báo `NTF-01`) |

> [!IMPORTANT]
> Khi 2 người cần làm việc trên cùng 1 domain (ví dụ: **Toàn** làm khách đặt lịch trong `booking.service.js`, còn **Hoàng** làm chuyên viên nhận/từ chối lịch; hoặc **Phương** làm đánh giá chuyên viên trong `expert`), hãy trao đổi trước trên nhóm hoặc tách hàm rõ ràng ở cuối file để tránh conflict.

---

## 5. QUY ƯỚC ĐẶT TÊN (NAMING CONVENTIONS)

| Đối tượng | Quy ước kiểu chữ | Ví dụ chuẩn | Ví dụ SAI (Cấm dùng) |
| :--- | :--- | :--- | :--- |
| **Tên file** | `kebab-case.<type>.js` | `booking.controller.js`, `low-stock.job.js` | `BookingController.js`, `booking_controller.js` |
| **Biến & Hàm (JS)** | `camelCase` | `const bookingSlot = ...`, `async function createBooking()` | `const booking_slot`, `function CreateBooking()` |
| **Class** | `PascalCase` | `class ApiError`, `class BookingService` | `class apiError` |
| **Hằng số (Constants)** | `UPPER_SNAKE_CASE` | `const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;` | `const maxUploadSize = ...` |
| **URL Endpoint (API)** | `kebab-case`, danh từ số nhiều | `/api/v1/purchase-orders`, `/api/v1/medical-records` | `/api/v1/getPurchaseOrders`, `/api/v1/medical_record` |
| **Tên bảng & cột DB** | `snake_case` (theo đúng file SQL) | `is_prescription_required`, `scheduled_at` | Không tự ý đổi tên cột trong file SQL |

---

## 6. QUY CHUẨN PHẢN HỒI API (API RESPONSE & ERROR CONTRACT)

Tất cả các API trả về cho Front-End (**Thùy** & **Tuấn Anh**) **bắt buộc** phải dùng chung 1 cấu trúc JSON duy nhất:

### 6.1. Khi thành công (`200 OK` hoặc `201 Created`)
- **Dữ liệu đơn lẻ hoặc danh sách không phân trang:**
```json
{
  "success": true,
  "message": "Đặt lịch dịch vụ thành công",
  "data": {
    "id": 105,
    "booking_code": "BKG-20261028-001",
    "status": "pending"
  }
}
```

- **Dữ liệu danh sách có phân trang (Pagination):**
  - Query params truyền lên thống nhất là: `?page=1&limit=10&search=...&status=...`
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    { "id": 1, "name": "Hạt Royal Canin", "price": 250000 }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  }
}
```

### 6.2. Khi thất bại (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```json
{
  "success": false,
  "message": "Sản phẩm này là thuốc kê đơn, vui lòng chọn đơn thuốc hợp lệ của bác sĩ thú y",
  "errorCode": "PRESCRIPTION_REQUIRED",
  "errors": null
}
```

### 6.3. Bảng mã HTTP Status Code chuẩn
- `200 OK`: Lấy dữ liệu (`GET`), cập nhật (`PUT`/`PATCH`), xóa (`DELETE`) thành công.
- `201 Created`: Tạo mới bản ghi (`POST`) thành công.
- `400 Bad Request`: Dữ liệu gửi lên sai định dạng hoặc vi phạm quy tắc nghiệp vụ (VD: hủy đơn khi đã giao hàng, số lượng vượt quá tồn kho).
- `401 Unauthorized`: Chưa đăng nhập, thiếu token hoặc token hết hạn.
- `403 Forbidden`: Đã đăng nhập nhưng không đủ quyền (VD: `customer` gọi API của `admin`, hoặc sửa thú cưng của người khác).
- `404 Not Found`: Không tìm thấy bản ghi theo `id`.
- `409 Conflict`: Trùng dữ liệu duy nhất (VD: trùng `email`, trùng `sku`, hoặc slot giờ vừa có người khác đặt).
- `500 Internal Server Error`: Lỗi hệ thống / lỗi CSDL không mong muốn.

---

## 7. CODE MẪU CHUẨN (TEMPLATES ĐỂ COPY & DÙNG THỐNG NHẤT)

### 7.1. Bộ 3 file tiện ích lõi (`src/utils/`)

**`src/utils/ApiError.js`**
```javascript
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'BAD_REQUEST', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

export default ApiError;
```

**`src/utils/apiResponse.js`**
```javascript
export const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const paginatedResponse = (res, data, page, limit, totalItems, message = 'Thành công') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages: Math.ceil(totalItems / limit),
    },
  });
};

```

**`src/utils/asyncHandler.js`**
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
```

---

### 7.2. Mẫu viết 1 luồng tính năng từ A-Z (Ví dụ: Quản lý Thú cưng - `pet`)

#### Bước 1: Định nghĩa Entity (`src/entities/pet.entity.js`)
```javascript
import { EntitySchema } from 'typeorm';

export const PetEntity = new EntitySchema({
  name: 'Pet',
  tableName: 'pets',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    owner_id: { type: 'bigint', nullable: false },
    name: { type: 'nvarchar', length: 100, nullable: false },
    species: { type: 'nvarchar', length: 20, nullable: false }, // dog, cat, bird, rabbit, other
    breed: { type: 'nvarchar', length: 100, nullable: true },
    gender: { type: 'nvarchar', length: 10, default: 'unknown' },
    birth_date: { type: 'date', nullable: true },
    weight_kg: { type: 'decimal', precision: 5, scale: 2, nullable: true },
    avatar: { type: 'nvarchar', length: 255, nullable: true },
    allergies: { type: 'nvarchar', length: 500, nullable: true },
    status: { type: 'nvarchar', length: 20, default: 'active' },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

```

#### Bước 2: Viết Repository (`src/repositories/pet.repository.js`)
```javascript
import { AppDataSource } from '../config/data-source.js';
import { PetEntity } from '../entities/pet.entity.js';

const getRepo = (manager) => (manager ? manager.getRepository(PetEntity) : AppDataSource.getRepository(PetEntity));

export const findByOwnerId = async (ownerId) => {
  return await getRepo().find({
    where: { owner_id: ownerId, status: 'active' },
    order: { created_at: 'DESC' },
  });
};

export const findById = async (id) => {
  return await getRepo().findOne({
    where: { id, status: 'active' },
  });
};

export const createPet = async (petData, manager = null) => {
  const repo = getRepo(manager);
  const newPet = repo.create(petData);
  return await repo.save(newPet);
};

```

#### Bước 3: Viết Service xử lý nghiệp vụ (`src/services/pet.service.js`)
```javascript
import * as petRepository from '../repositories/pet.repository.js';
import ApiError from '../utils/ApiError.js';

export const createNewPet = async (userId, payload) => {
  if (payload.weight_kg !== undefined && Number(payload.weight_kg) <= 0) {
    throw new ApiError(400, 'Cân nặng của thú cưng phải lớn hơn 0 kg');
  }

  const petData = {
    ...payload,
    owner_id: userId,
    status: 'active',
  };

  return await petRepository.createPet(petData);
};

export const getPetDetail = async (userId, petId) => {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng');
  }

  // Kiểm tra quyền sở hữu: chỉ chủ nuôi mới được xem (trừ bác sĩ có lịch khám xử lý ở API riêng)
  if (Number(pet.owner_id) !== Number(userId)) {
    throw new ApiError(403, 'Bạn không có quyền truy cập hồ sơ thú cưng này');
  }

  return pet;
};

```

#### Bước 4: Viết Controller (`src/controllers/pet.controller.js`)
```javascript
import * as petService from '../services/pet.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

export const createPet = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Lấy từ auth.middleware.js
  const result = await petService.createNewPet(userId, req.body);
  return successResponse(res, result, 'Thêm hồ sơ thú cưng thành công', 201);
});

export const getPetById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const petId = req.params.id;
  const result = await petService.getPetDetail(userId, petId);
  return successResponse(res, result, 'Lấy thông tin thú cưng thành công');
});

```

#### Bước 5: Khai báo Route (`src/routes/pet.route.js`)
```javascript
import express from 'express';
import * as petController from '../controllers/pet.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken); // Toàn bộ route bên dưới đều yêu cầu đăng nhập

router.post('/', authorizeRoles('customer'), petController.createPet);
router.get('/:id', authorizeRoles('customer'), petController.getPetById);

export default router;
```

---

## 8. CÁC QUY TẮC CƠ SỞ DỮ LIỆU & NGHIỆP VỤ BẮT BUỘC NHỚ

Khi làm việc với database `Animora` trên SQL Server (`animora-sqlserver-v0_1.sql`), toàn bộ thành viên phải tuân thủ:

1. **Xóa mềm (Soft Delete):**
   - Tuyệt đối **KHÔNG** dùng lệnh `DELETE FROM` với các bảng danh mục và nghiệp vụ chính (`users`, `pets`, `products`, `experts`, `services`...).
   - Luôn xóa mềm bằng cách cập nhật cột `status = 'deleted'` hoặc `status = 'inactive'`.
2. **Kiểu dữ liệu `BIGINT` trong TypeORM + SQL Server:**
   - Driver `mssql` trong Node.js thường trả cột `BIGINT` về dưới dạng chuỗi (`string`, ví dụ `"12"`). Khi so sánh ID trong JavaScript (ví dụ kiểm tra `pet.owner_id === req.user.id`), **luôn ép kiểu `Number(id)` hoặc `String(id)`** ở cả 2 vế để tránh lỗi so sánh `12 === "12"` ra `false`.
3. **Múi giờ và Tiền tệ:**
   - Mọi cột thời gian trong CSDL đều lưu theo chuẩn **UTC** (`SYSUTCDATETIME()`).
   - Mọi cột tiền tệ lưu kiểu `DECIMAL(15, 2)` theo đơn vị **VNĐ** (không làm tròn sai lệch khi tính phần trăm hoàn tiền VNPAY hay hoa hồng chuyên viên).
4. **Sử dụng Transaction cho các luồng nhạy cảm:**
   - Bắt buộc dùng `await AppDataSource.transaction(async (transactionalEntityManager) => { ... })` cho các Use Case:
     - **Đặt lịch & Hủy lịch (`BKG-01`, `BKG-03`, `BKG-07`):** Cập nhật đồng thời `bookings`, `expert_schedule_slots`, `payments`.
     - **Nhập kho (`INV-02`):** Tạo `inventory_batches` và ghi log `stock_movements`.
     - **Đặt hàng & Hủy đơn (`ORD-01`, `ORD-05`, `ORD-07`):** Tạo `orders`, `order_items`, trừ/hoàn tồn kho theo lô hạn sử dụng gần nhất (**FEFO** - First Expired, First Out) trong `inventory_batches`, xóa `cart_items`.

---

## 9. QUY TRÌNH LÀM VIỆC VỚI GIT & GITHUB (MÔ HÌNH GITFLOW RÚT GỌN)

Nhóm áp dụng **GitFlow rút gọn (Simplified GitFlow)** – phù hợp nhất với dự án OJT chia theo 3 Sprints và 3 thành viên Back-End (**Toàn, Phương, Hoàng**) cùng code song song.

### 9.1. Cấu trúc các nhánh (Branching Strategy)

```text
main (Code sạch, ổn định để chấm điểm cuối Sprint 1, 2, 3 & Deploy)
  ▲
  └── develop (Nhánh tích hợp chung hàng ngày của cả nhóm BE)
        ▲
        ├── feature/toan-acc01-auth          (Nhánh làm tính năng mới của Toàn)
        ├── feature/phuong-pet01-pets        (Nhánh làm tính năng mới của Phương)
        ├── feature/hoang-exp01-experts      (Nhánh làm tính năng mới của Hoàng)
        └── fix/toan-bkg03-cancel-fee        (Nhánh sửa lỗi bug phát sinh)
```

| Loại nhánh | Tên nhánh / Cú pháp | Mục đích & Quy tắc bảo vệ |
| :--- | :--- | :--- |
| **Nhánh chính** | `main` | Chứa code chạy ổn định 100%, dùng để deploy và demo cuối mỗi Sprint. **CẤM push thẳng lên `main`**. Chỉ nhận merge từ `develop` khi chốt Sprint. |
| **Nhánh phát triển** | `develop` | Nhánh ghép code chung của Toàn, Phương, Hoàng. Mọi nhánh `feature/*` và `fix/*` đều được tách ra từ `develop` và merge ngược về `develop` qua **Pull Request (PR)**. **CẤM push thẳng lên `develop`**. |
| **Nhánh tính năng** | `feature/<tên>-<mã-uc>-<mô-tả-ngắn>` | Dùng khi code Use Case mới (tách ra từ `develop`). Chữ thường toàn bộ, nối bằng dấu gạch ngang `-`. |
| **Nhánh sửa lỗi** | `fix/<tên>-<mã-uc>-<mô-tả-lỗi>` | Dùng khi sửa bug sau khi đã merge vào `develop` hoặc khi FE báo lỗi API. |

### 9.2. Quy tắc đặt tên nhánh cụ thể cho từng thành viên
- **Toàn:**
  - `feature/toan-acc01-auth-jwt` (Làm cụm Đăng ký, Đăng nhập, Đổi/Quên mật khẩu)
  - `feature/toan-bkg01-booking-engine` (Làm Đặt lịch, Khóa slot, Hủy lịch)
  - `feature/toan-ord01-cart-checkout` (Làm Giỏ hàng & Đặt hàng)
- **Phương:**
  - `feature/phuong-pet01-pet-profile` (Làm Hồ sơ thú cưng & Sổ tiêm chủng)
  - `feature/phuong-prd01-products-categories` (Làm Danh mục & Sản phẩm Shop)
  - `feature/phuong-med01-medical-prescriptions` (Làm Bệnh án thú y & Đơn thuốc)
- **Hoàng:**
  - `feature/hoang-exp01-expert-schedules` (Làm Hồ sơ chuyên viên & Sinh slot giờ rảnh)
  - `feature/hoang-inv01-po-inventory-batches` (Làm Đơn nhập PO, Nhận hàng & Tồn kho theo lô)
  - `feature/hoang-ai01-gemini-chatbot` (Làm Trợ lý AI & Thông báo)

### 9.3. Quy trình 6 bước chuẩn khi code và Push lên GitHub

1. **Bước 1: Lấy code mới nhất từ `develop` và tạo nhánh mới**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/toan-bkg01-booking-engine
   ```
2. **Bước 2: Viết code và Commit theo chuẩn Conventional Commits (Gắn mã UC)**
   - Cú pháp: `<loại>(<Mã-UC>): <mô tả ngắn gọn bằng tiếng Việt>`
   - Trong đó `<loại>` gồm: `feat` (tính năng mới), `fix` (sửa lỗi), `refactor` (tối ưu code), `chore` (cấu hình, cài thư viện), `docs` (tài liệu).
   - Ví dụ:
     ```bash
     git add .
     git commit -m "feat(BKG-01, BKG-03): hoàn thành API đặt lịch và tính phí phạt hủy lịch <3h"
     ```
3. **Bước 3: Đồng bộ code mới nhất từ `develop` trước khi Push (Tránh conflict trên GitHub)**
   ```bash
   git pull origin develop
   # Nếu có conflict, xử lý ngay trên VS Code ở máy cá nhân, chạy thử npm run dev xem có lỗi không
   ```
4. **Bước 4: Push nhánh cá nhân lên GitHub**
   ```bash
   git push -u origin feature/toan-bkg01-booking-engine
   ```
5. **Bước 5: Tạo Pull Request (PR) trên GitHub**
   - Chọn nhánh đích (base): `develop` ← nhánh nguồn (compare): `feature/toan-bkg01-booking-engine`.
   - Ghi rõ trong phần mô tả PR: Danh sách các API vừa làm xong để **Thùy / Tuấn Anh (FE)** biết và ghép API.
   - Nhờ ít nhất **1 bạn BE khác review nhanh** rồi bấm **Merge Pull Request**.
6. **Bước 6: Xóa nhánh cũ sau khi đã Merge xong**
   - Sau khi PR đã merge vào `develop`, quay lại bước 1 để tạo nhánh mới cho task tiếp theo.

> [!CAUTION]
> **3 ĐIỀU TUYỆT ĐỐI CẤM KHI PUSH GITHUB:**
> 1. **Không bao giờ commit file `.env`**, thư mục `node_modules/` hoặc `uploads/` chứa ảnh test lên GitHub (bắt buộc phải khai báo trong `.gitignore`). Khi thêm biến môi trường mới vào `.env`, phải cập nhật tên biến (bỏ trống giá trị nhạy cảm) vào file `.env.example` và nhắn lên nhóm.
> 2. **Không dùng lệnh `git push --force`** lên nhánh `develop` hoặc `main`.
> 3. Nếu ai cài thêm thư viện bằng `npm install <tên-gói>`, phải commit cả `package.json` và `package-lock.json`, đồng thời nhắn vào nhóm chat: *"Mọi người pull develop về nhớ chạy `npm install` nhé!"*.

---

## 10. QUY CHUẨN DOCKER, TÊN MIỀN & TRIỂN KHAI (DEPLOYMENT - 100% FREE)

Vì đây là dự án Mock OJT (5 tuần - 3 Sprints), nhóm thống nhất phương án **Tối ưu kỹ thuật – Chi phí 0đ (Không mua tên miền, không thuê VPS tốn phí)** như sau:

### 10.1. Có dùng Docker không? → **CÓ (Dùng Docker Compose ở Local cho SQL Server)**
- **Lý do:** Nếu mỗi thành viên tự cài SQL Server bản Windows (Developer/Express) trên máy cá nhân thì rất nặng máy, dễ lệch phiên bản (2016/2019/2022), lệch Collation tiếng Việt (`Vietnamese_100_CI_AS`) hoặc lỗi bật cổng TCP `1433`.
- **Giải pháp:** Cả nhóm dùng chung 1 file `docker-compose.yml` để dựng **SQL Server 2022** chỉ bằng 1 câu lệnh `docker compose up -d`.
- **Mẫu file `docker-compose.yml` chuẩn đặt ở thư mục gốc:**
  ```yaml
  version: '3.8'
  services:
    animora-sqlserver:
      image: mcr.microsoft.com/mssql/server:2022-latest
      container_name: animora_sqlserver
      environment:
        - ACCEPT_EULA=Y
        - MSSQL_SA_PASSWORD=Animora@2026StrongPass!
        - MSSQL_PID=Developer
        - TZ=UTC
      ports:
        - "1433:1433"
      volumes:
        - sqlserver_data:/var/opt/mssql
      restart: unless-stopped

  volumes:
    sqlserver_data:
  ```
- Sau khi chạy `docker compose up -d`, mở **SSMS / Azure Data Studio / DBeaver** kết nối vào `localhost,1433` (user: `sa`, pass: `Animora@2026StrongPass!`) và chạy file `animora-sqlserver-v0_1.sql` là có ngay 54 bảng đồng nhất 100% giữa mọi thành viên.

### 10.2. Có mua tên miền không & Deploy lên đâu? → **KHÔNG MUA TÊN MIỀN – DÙNG GÓI FREE**

Nhóm sử dụng hoàn toàn các nền tảng Cloud miễn phí và tên miền phụ (subdomain) mặc định do nền tảng cấp:

| Thành phần | Nền tảng Deploy (Free 100%) | Tên miền sử dụng (Miễn phí) | Lưu ý kỹ thuật quan trọng |
| :--- | :--- | :--- | :--- |
| **Front-End** (Thùy, Tuấn Anh) | **Vercel** (hoặc Netlify) | `https://animora-group14.vercel.app` | Tự động build và deploy mỗi khi FE merge code vào nhánh `main`. Cấu hình biến môi trường `VITE_API_BASE_URL` trỏ về link Back-End. |
| **Back-End** (Toàn, Phương, Hoàng) | **Render.com** (Web Service Free) hoặc **Railway** | `https://animora-api.onrender.com` | **Vì sao ưu tiên Render/Railway hơn Vercel cho BE?**<br>Vì Vercel biến Node.js thành *Serverless Functions* (bị ngắt sau 10 giây, không chạy được **Cronjob** `node-cron` cho `INV-04`, không giữ được kết nối **Socket.io** `NTF-01` và dễ nghẽn kết nối SQL Server). Render.com chạy server Express truyền thống 24/7. |
| **Database** (SQL Server) | **Azure SQL Database** (Free Tier / Student) hoặc **MonsterASP / SmarterASP.NET** (Free SQL Server) | Host connection string lưu trong biến `.env` trên Render | Nếu chỉ demo trực tiếp trên lớp/buổi bảo vệ OJT, có thể chạy SQL Server trên Docker máy laptop chính và dùng **Cloudflare Tunnel / Ngrok** nếu cần public. |
| **Test VNPAY Webhook ở Local** | **Ngrok** (Free) | `https://xxxx.ngrok-free.app` | Khi **Toàn** test cổng thanh toán VNPAY (`SPAY-02`, `ORD-02`) ở máy local, dùng lệnh `ngrok http 5000` để lấy link HTTPS public điền vào `vnp_ReturnUrl` / IPN URL của VNPAY Sandbox. |

### 10.3. Mẫu file `.env.example` chuẩn (Commit lên Git để cả nhóm đối chiếu)

```env
# 1. Server Config
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# 2. SQL Server Database (Khớp với docker-compose.yml)
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=Animora@2026StrongPass!
DB_NAME=Animora
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true

# 3. JWT Authentication
JWT_ACCESS_SECRET=animora_access_secret_key_group14
JWT_REFRESH_SECRET=animora_refresh_secret_key_group14
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# 4. VNPAY Sandbox Config (Toàn phụ trách)
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/payment-result

# 5. Google Gemini AI (Hoàng phụ trách)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# 6. SMTP Email - Quên mật khẩu (Toàn phụ trách)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

# 📎 PHẦN BỔ SUNG (MỤC 11 → 19)

> Các mục dưới đây **chỉ bổ sung**, không thay đổi nội dung mục 1 → 10. Nếu có điểm nào lệch với các mục trên thì ghi rõ ngay tại mục đó.

---

## 11. BỔ SUNG THƯ VIỆN, SCRIPTS & CHUẨN ESM (`"type": "module"`)

### 11.1. Thư viện cài thêm

```bash
npm i http-status-codes
npm i -D jest supertest cross-env nodemon
```

| Thư viện | Mục đích sử dụng |
| :--- | :--- |
| `http-status-codes` | Dùng `StatusCodes.OK`, `StatusCodes.NOT_FOUND`... và `getReasonPhrase(code)` thay cho số status "chay" |
| `cross-env` | Set biến môi trường (`NODE_ENV`) chạy được trên cả Windows / macOS / Linux |
| `jest` + `supertest` | Unit test và test API (xem mục 16) |
| `nodemon` | Tự restart server khi sửa code ở môi trường dev |

(`cors` và `dotenv` đã có sẵn ở mục 1.)

### 11.2. `package.json`

```json
{
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon src/server.js",
    "start": "cross-env NODE_ENV=production node src/server.js",
    "test": "cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": {}
  }
}
```

### 11.3. Chuẩn ESM cho toàn bộ code mới

> **Quy tắc bắt buộc:** khai báo `"type": "module"` trong `package.json` để cả nhóm dùng `import / export` thống nhất (code gọn, dễ đọc, cùng cú pháp với FE, không cần Babel hay cấu hình thêm, dùng được `await` ở cấp cao nhất của file). Không viết lẫn `require` / `module.exports` trong cùng dự án.
>
> **Thay cho thư mục `models/`:** dùng `src/entities/` (cấu trúc bảng) kết hợp `src/repositories/` (thao tác CSDL), xem mục 17.

> [!IMPORTANT]
> Dự án đã khai báo `"type": "module"` nên **toàn bộ code (kể cả mẫu ở mục 7) viết theo ESM**: dùng `import` / `export`, **không** dùng `require` / `module.exports` (dùng sẽ báo lỗi `module is not defined in ES module scope`). Bảng dưới là cách chuyển đổi nếu gặp code CommonJS cũ.

| CommonJS (mục 7) | ESM (chuẩn mới) |
| :--- | :--- |
| `const express = require('express');` | `import express from 'express';` |
| `const { EntitySchema } = require('typeorm');` | `import { EntitySchema } from 'typeorm';` |
| `const ApiError = require('../utils/ApiError');` | `import ApiError from '../utils/ApiError.js';` |
| `const petRepository = require('../repositories/pet.repository');` | `import * as petRepository from '../repositories/pet.repository.js';` |
| `module.exports = ApiError;` | `export default ApiError;` |
| `module.exports = { findById, createPet };` | `export const findById = ...;` `export const createPet = ...;` |

Lưu ý khi dùng ESM:
1. **Import file nội bộ bắt buộc ghi đuôi `.js`** (`'../utils/ApiError.js'`), thiếu đuôi sẽ báo lỗi `ERR_MODULE_NOT_FOUND`.
2. Không có `__dirname`, `__filename` → dùng `import.meta.url` nếu cần đường dẫn (VD: thư mục `uploads/`).
3. Không dùng lẫn `require` và `import` trong cùng 1 file.
4. Jest chạy ESM cần `NODE_OPTIONS=--experimental-vm-modules` và `"transform": {}` (đã có trong script ở 11.2).

---

## 12. QUẢN LÝ BIẾN MÔI TRƯỜNG TẬP TRUNG (`config/environment.js`)

- Thông tin nhạy cảm (secret key, token, mật khẩu DB, key VNPAY/Gemini...) chỉ để trong `.env`.
- **Vì sao phải có `environment.js`:** nếu chỉ `import 'dotenv/config'` ở `server.js` thì các file khác không dùng chung được, mỗi file lại phải import `dotenv` và đọc `process.env` lại → khó quản lý. Gom vào 1 object `env` thì file nào cũng `import { env }` là dùng được.
- Tên file trong `config/` đặt theo chức năng (`environment.js`, `cors.js`, `data-source.js`), là ngoại lệ so với quy ước `<tên>.<type>.js` ở mục 5.
- **Chỉ có 1 file duy nhất `src/config/environment.js` được `import 'dotenv/config'` và đọc `process.env`.** Các file khác (`data-source.js`, `vnpay.config.js`, `cors.js`, `auth.service.js`...) chỉ việc `import { env } from '../config/environment.js'`. Tuyệt đối **không** gọi `process.env.XXX` rải rác ở các tầng khác.
- Mọi giá trị trong `.env` đều là **chuỗi**, phải ép kiểu tại đây (số, boolean) để các nơi khác dùng luôn đúng kiểu.

```javascript
// src/config/environment.js
import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL,
  CORS_ORIGINS: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT) || 1433,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_ENCRYPT: process.env.DB_ENCRYPT === 'true',
  DB_TRUST_SERVER_CERT: process.env.DB_TRUST_SERVER_CERT === 'true',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // VNP_*, GEMINI_*, SMTP_* khai báo theo cùng cách (ép kiểu nếu cần)
};
```

- Thêm biến mới vào `.env` → **bắt buộc** thêm tên biến (bỏ trống giá trị nhạy cảm) vào `.env.example`, thêm vào object `env` ở trên, rồi nhắn lên nhóm (như quy định ở mục 9).
- Dòng cần thêm vào `.env.example` (mục 10.3) cho phần CORS:

```env
# 7. CORS (nhiều origin cách nhau bằng dấu phẩy)
CORS_ORIGINS=http://localhost:5173,https://animora-group14.vercel.app
```

> **Về biến môi trường dev/production:** dự án dùng `NODE_ENV` (đã có ở `.env.example`) thay cho một biến riêng. `development` = đang dev, các giá trị khác = không phải dev.

---

## 13. CẤU HÌNH CORS (WHITELIST ORIGIN)

- Dùng thư viện `cors`, **chỉ cho phép các origin nằm trong whitelist** `CORS_ORIGINS` (local FE + domain Vercel). Không dùng `cors()` mở toàn bộ ở môi trường deploy.
- Request **không có header `Origin`** (Postman, VNPAY IPN gọi từ server, ngrok callback) được cho qua, vì CORS chỉ áp dụng cho trình duyệt.
- Origin lạ → trả `403 Forbidden` thông qua `ApiError` để đi vào `error.middleware.js`.
- Bật `credentials: true` nếu FE gửi cookie. Khi đó **không** được dùng origin `*`.

```javascript
// src/config/cors.js
import { StatusCodes } from 'http-status-codes';
import { env } from './environment.js';
import ApiError from '../utils/ApiError.js';

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new ApiError(StatusCodes.FORBIDDEN, `${origin} không được phép truy cập (CORS)`, 'CORS_NOT_ALLOWED')
    );
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
```

Thứ tự middleware trong `src/app.js` (**`error.middleware` luôn đặt cuối cùng**):

```javascript
// src/app.js
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());        // parse JSON body FE gửi lên (req.body)
app.use('/api/v1', apiRoutes);
app.use(errorMiddleware);       // bắt lỗi tập trung, đặt CUỐI CÙNG

export default app;
```

- `app.js` **chỉ khởi tạo và export `app`**, không `listen`, không kết nối DB, không chạy cronjob. Việc đó thuộc `server.js` (để Jest/Supertest import `app` được mà không mở cổng).

---

## 14. BỔ SUNG QUY TẮC VALIDATION (JOI)

### 14.1. Quy tắc bắt buộc

1. **Validate ở cả FE và BE.** FE để trải nghiệm người dùng (hiển thị lỗi, toast); BE là **chốt chặn cuối trước khi dữ liệu vào CSDL** nên bắt buộc phải validate để đảm bảo bảo mật và chính xác dữ liệu.
2. Luôn đặt `abortEarly: false` để trả về **lỗi của tất cả các field** cùng lúc (mặc định `true` chỉ báo lỗi field đầu tiên).
3. Chuỗi nhập từ người dùng dùng `.trim().strict()` đi cùng nhau, vì chỉ có `trim()` thì khoảng trắng thừa vẫn lọt qua.
4. Lỗi validation trả về **`422 Unprocessable Entity`**, không dùng 400 (400 dành cho vi phạm quy tắc nghiệp vụ, xem bổ sung bảng mã ở 14.3).
5. Mặc định **không cần custom message tiếng Việt ở BE**, dùng message mặc định của Joi và trả trong mảng `errors` để FE tự hiển thị theo ý. Chỉ custom bằng `.messages({...})` khi thật sự cần.
6. `validators/*.validator.js` chỉ kiểm tra **định dạng đầu vào**. Quy tắc nghiệp vụ (tồn kho, quyền sở hữu, phí phạt...) vẫn đặt ở `Service` như mục 3.

### 14.2. Middleware chạy validator (`middlewares/validate.middleware.js`)

```javascript
// src/middlewares/validate.middleware.js
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

// property: 'body' | 'query' | 'params'
export const validate = (schema, property = 'body') => async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req[property], { abortEarly: false });
    // Không gán lại req.query (Express 5 chỉ cho đọc) -> lưu kết quả đã chuẩn hóa vào req.validated
    req.validated = { ...req.validated, [property]: value };
    next();
  } catch (error) {
    const errors = error.details?.map((d) => ({ field: d.path.join('.'), message: d.message })) ?? null;
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Dữ liệu không hợp lệ', 'VALIDATION_ERROR', errors));
  }
};
```

```javascript
// src/validators/pet.validator.js
import Joi from 'joi';

export const createPetSchema = Joi.object({
  name: Joi.string().required().min(1).max(100).trim().strict(),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required(),
  breed: Joi.string().max(100).trim().strict().allow(null, ''),
  weight_kg: Joi.number().positive().max(999.99),
});
```

```javascript
// src/routes/pet.route.js (trích)
router.post('/', authorizeRoles('customer'), validate(createPetSchema), petController.createPet);
```

- Với `query` (page, limit... luôn là chuỗi), schema **không** dùng `.strict()` để Joi tự ép sang số, và Controller đọc từ `req.validated.query`.

### 14.3. Bổ sung bảng mã HTTP Status Code (mục 6.3)

- `422 Unprocessable Entity`: Dữ liệu gửi lên **không qua được Joi** (thiếu field bắt buộc, sai định dạng, khoảng trắng thừa...). Body lỗi có `errorCode: "VALIDATION_ERROR"` và `errors` là mảng `{ field, message }`.
- Phân biệt: sai định dạng đầu vào (Joi) → **422**; đúng định dạng nhưng vi phạm nghiệp vụ (VD: hủy đơn đã giao, vượt tồn kho) → **400**.

### 14.4. Chốt chặn cuối trước khi vào CSDL

Dù đã validate ở `validators/`, tầng Service/Entity vẫn phải tự bảo vệ dữ liệu vì Joi chỉ kiểm tra những gì client gửi lên:
1. Các giá trị mặc định / nhạy cảm (`status`, `created_at`, `updated_at`, `owner_id`, `role`...) **do Service hoặc Entity gán**, tuyệt đối không nhận từ `req.body` (VD: `owner_id` luôn lấy từ `req.user.id`, như `createNewPet` ở mục 7).
2. Phòng trường hợp dev sửa dữ liệu sai ở Service: tầng **Entity** phải khai báo đủ ràng buộc và Repository validate lại dữ liệu trước khi ghi, đảm bảo **toàn vẹn dữ liệu** (chi tiết ở **mục 17**).

---

## 15. BỔ SUNG XỬ LÝ LỖI TẬP TRUNG (ERROR HANDLING)

### 15.1. Quy tắc

1. Mọi lỗi đều đi về **một nơi duy nhất**: `middlewares/error.middleware.js`. Controller đã bọc `asyncHandler` nên lỗi tự đẩy sang đây, **không** tự `res.status(...).json(...)` để trả lỗi trong Controller/Service.
2. Thiếu `statusCode` (dev quên truyền) → mặc định **500**.
3. Thiếu `message` → lấy `getReasonPhrase(statusCode)` (VD: `INTERNAL SERVER ERROR`) thay vì để trống.
4. **Chỉ môi trường dev (`NODE_ENV === 'development'`) mới trả `stack`** để debug. Môi trường khác phải xóa `stack`.
5. Lỗi 500 ngoài dự kiến (lỗi CSDL, lỗi thư viện...) ở môi trường không phải dev **không được lộ `err.message` gốc** ra Client.
6. Dùng `StatusCodes.*` thay cho số khi `throw new ApiError(...)`.
7. Error middleware **phải khai báo đủ 4 tham số** `(err, req, res, next)` thì Express mới nhận là middleware xử lý lỗi.

### 15.2. Code mẫu (giữ đúng cấu trúc phản hồi lỗi ở mục 6.2)

```javascript
// src/utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'BAD_REQUEST', errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
```

```javascript
// src/middlewares/error.middleware.js
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { env } from '../config/environment.js';

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const isDev = env.NODE_ENV === 'development';

  const responseError = {
    success: false,
    message:
      statusCode === StatusCodes.INTERNAL_SERVER_ERROR && !isDev
        ? getReasonPhrase(statusCode)
        : err.message || getReasonPhrase(statusCode),
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    errors: err.errors || null,
    stack: err.stack,
  };

  if (!isDev) delete responseError.stack; // production: không lộ stack trace

  res.status(statusCode).json(responseError);
};
```

Ví dụ dùng trong Service:

```javascript
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
```

---

## 16. KIỂM THỬ (TESTING) VỚI JEST + SUPERTEST

### 16.1. Quy ước

- Thư mục `tests/` ở gốc dự án, mô phỏng cấu trúc `src/`: `tests/utils/`, `tests/validators/`, `tests/services/`, `tests/api/`.
- Tên file: `<tên>.test.js` (VD: `pet.service.test.js`, `pet.validator.test.js`).
- Chạy: `npm test`. **Chạy test xong, pass hết mới được tạo Pull Request** (bổ sung vào bước 3 của mục 9.3).
- **Test không được kết nối CSDL SQL Server thật, không gọi VNPAY/Gemini/SMTP thật** → mock Repository và các dịch vụ bên ngoài. Vì vậy `app.js` không được tự kết nối DB (xem mục 13).
- **Postman** vẫn dùng để test tay (xem data trả về, status code, đúng cấu trúc lỗi mục 6); **Jest** dùng để test tự động và chống lỗi quay lại.

### 16.2. Test hàm thuần & Validator (không cần mock)

```javascript
// tests/validators/pet.validator.test.js
import { createPetSchema } from '../../src/validators/pet.validator.js';

describe('createPetSchema', () => {
  it('trả về lỗi của tất cả các field (abortEarly: false)', () => {
    const { error } = createPetSchema.validate({}, { abortEarly: false });
    const fields = error.details.map((d) => d.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['name', 'species']));
  });

  it('chặn khoảng trắng thừa nhờ trim().strict()', () => {
    const { error } = createPetSchema.validate({ name: '  Milu  ', species: 'dog' });
    expect(error).toBeDefined();
  });
});
```

### 16.3. Test Service (mock Repository)

Trong ESM dùng `jest.unstable_mockModule` rồi `await import(...)` sau khi mock:

```javascript
// tests/services/pet.service.test.js
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/pet.repository.js', () => ({
  findById: jest.fn(),
  findByOwnerId: jest.fn(),
  createPet: jest.fn(),
}));

const petRepository = await import('../../src/repositories/pet.repository.js');
const petService = await import('../../src/services/pet.service.js');

describe('petService.getPetDetail', () => {
  it('404 khi không tìm thấy thú cưng', async () => {
    petRepository.findById.mockResolvedValue(null);
    await expect(petService.getPetDetail(1, 99)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('403 khi không phải chủ nuôi', async () => {
    petRepository.findById.mockResolvedValue({ id: 5, owner_id: '2' }); // BIGINT trả về chuỗi
    await expect(petService.getPetDetail(1, 5)).rejects.toMatchObject({ statusCode: 403 });
  });
});
```

### 16.4. Test API bằng Supertest (import `app`, không mở cổng)

```javascript
// tests/api/common.test.js
import request from 'supertest';
import app from '../../src/app.js';

describe('API chung', () => {
  it('401 khi gọi API cần đăng nhập mà thiếu token', async () => {
    const res = await request(app).get('/api/v1/pets/1');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('403 khi origin không nằm trong whitelist CORS', async () => {
    const res = await request(app).get('/api/v1/pets/1').set('Origin', 'http://evil.com');
    expect(res.status).toBe(403);
  });

  it('không lộ stack trace khi không phải môi trường dev', async () => {
    const res = await request(app).get('/api/v1/pets/1');
    expect(res.body.stack).toBeUndefined(); // NODE_ENV=test
  });
});
```

(Đường dẫn route trong ví dụ cần đổi cho khớp route thật của dự án.)

### 16.5. Các case nên có cho mỗi API

| Case | Status mong đợi |
| :--- | :--- |
| Dữ liệu hợp lệ | `200` / `201` |
| Sai / thiếu dữ liệu (Joi) | `422`, có mảng `errors` |
| Thiếu token / token hết hạn | `401` |
| Sai quyền (`authorizeRoles`) hoặc không phải chủ sở hữu | `403` |
| Không tìm thấy bản ghi | `404` |
| Vi phạm nghiệp vụ (hủy đơn đã giao, vượt tồn kho...) | `400` |
| Trùng dữ liệu duy nhất (email, sku, slot) | `409` |
| Chuỗi thừa khoảng trắng bị chặn (`trim().strict()`) | `422` |

---

## 17. TẦNG ENTITY (THAY CHO TẦNG "MODEL")

Dự án dùng **TypeORM** nên tầng "Model" được chuyển thành **Entity** (`src/entities/*.entity.js`) kết hợp với **Repository** (`src/repositories/*.repository.js`):

| Việc của "Model" | Dự án này đặt ở đâu |
| :--- | :--- |
| Định nghĩa cấu trúc dữ liệu (các field, kiểu, ràng buộc, giá trị mặc định) | **Entity** (`EntitySchema`) |
| Validate lần 2 (Joi) trước khi ghi vào DB | **Repository** (gọi schema Joi khai báo cạnh Entity) |
| Thao tác với CSDL (`find`, `save`, `update`...) | **Repository** |

> Không tạo thư mục `models/`. Luồng đầy đủ: `Route → Middleware → Controller → Service → Repository (dùng Entity) → Database`.

### 17.1. Quy tắc cho Entity

1. **Entity chỉ khai báo cấu trúc bảng**, không viết logic nghiệp vụ, không viết truy vấn.
2. Tên cột `snake_case`, khớp 100% với file SQL (`animora-sqlserver-v0_1.sql`), không tự đổi tên.
3. Khai báo đủ ràng buộc: `nullable`, `length`, `default`, `unique`; cột tiền dùng `decimal` `precision: 15, scale: 2` (mục 8).
4. Các field mặc định mà **client không gửi lên** (`status`, `created_at`, `updated_at`...) do **Entity / Service gán**, không nhận từ `req.body`.
5. Mỗi file entity có thể chứa nhiều bảng của cùng domain (như mục 2): mỗi bảng là 1 `EntitySchema` export riêng (`UserEntity`, `AddressEntity`...).
6. Xóa mềm bằng cột `status` (mục 8); cột `BIGINT` trả về dạng chuỗi nên phải ép kiểu khi so sánh.

### 17.2. Vì sao Repository vẫn validate (Joi) dù đã có `validators/`

Joi ở `validators/` chỉ kiểm tra dữ liệu **client gửi lên**. Validate lần 2 ở tầng dữ liệu để:
1. **Kiểm tra / gán các field client không gửi** (các field mặc định như `status`).
2. **Bắt lỗi khi dev sửa sai dữ liệu ở Service** (VD: quên gán `owner_id`, gán sai kiểu), trước khi dữ liệu chạm vào CSDL → đảm bảo bảo mật, chặt chẽ, toàn vẹn dữ liệu.

Lỗi Joi ở tầng này là **lỗi lập trình** (không phải lỗi người dùng nhập sai), nên không bắt riêng: để nó đi thẳng vào `error.middleware.js` và trả `500` (ở production message gốc không bị lộ, theo mục 15.1).

Áp dụng bắt buộc cho các thao tác **ghi** của domain nhạy cảm (`booking`, `payment`, `order`, `inventory`, `medical`), các domain còn lại khuyến khích.

### 17.3. Code mẫu (domain `pet`)

```javascript
// src/entities/pet.entity.js
import { EntitySchema } from 'typeorm';
import Joi from 'joi';

export const PetEntity = new EntitySchema({
  name: 'Pet',
  tableName: 'pets',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    owner_id: { type: 'bigint', nullable: false },
    name: { type: 'nvarchar', length: 100, nullable: false },
    species: { type: 'nvarchar', length: 20, nullable: false }, // dog, cat, bird, rabbit, other
    breed: { type: 'nvarchar', length: 100, nullable: true },
    gender: { type: 'nvarchar', length: 10, default: 'unknown' },
    birth_date: { type: 'date', nullable: true },
    weight_kg: { type: 'decimal', precision: 5, scale: 2, nullable: true },
    avatar: { type: 'nvarchar', length: 255, nullable: true },
    allergies: { type: 'nvarchar', length: 500, nullable: true },
    status: { type: 'nvarchar', length: 20, default: 'active' },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

// Schema Joi mô tả dữ liệu ĐƯỢC PHÉP ghi vào bảng pets (validate lần 2).
// Không có id, created_at, updated_at vì do CSDL / TypeORM tự gán.
export const petDataSchema = Joi.object({
  owner_id: Joi.number().integer().positive().required(),
  name: Joi.string().required().min(1).max(100).trim().strict(),
  species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required(),
  breed: Joi.string().max(100).trim().strict().allow(null, ''),
  gender: Joi.string().valid('male', 'female', 'unknown').default('unknown'),
  birth_date: Joi.date().allow(null),
  weight_kg: Joi.number().positive().max(999.99).allow(null),
  avatar: Joi.string().max(255).allow(null, ''),
  allergies: Joi.string().max(500).allow(null, ''),
  status: Joi.string().valid('active', 'inactive', 'deleted').default('active'),
});
```

```javascript
// src/repositories/pet.repository.js
import { AppDataSource } from '../config/data-source.js';
import { PetEntity, petDataSchema } from '../entities/pet.entity.js';

const getRepo = (manager) =>
  manager ? manager.getRepository(PetEntity) : AppDataSource.getRepository(PetEntity);

export const createPet = async (petData, manager = null) => {
  // Validate lần 2 trước khi ghi: gán default + chặn dữ liệu sai do Service
  const validData = await petDataSchema.validateAsync(petData, { abortEarly: false });

  const repo = getRepo(manager);
  return await repo.save(repo.create(validData));
};
```

---

## 18. THƯ MỤC `providers/` (GỌI DỊCH VỤ BÊN NGOÀI)

`src/providers/` là nơi **duy nhất** được gọi ra các dịch vụ bên ngoài (gửi email, Gemini AI, VNPAY, upload ảnh Cloudinary, realtime...). Service không import trực tiếp `nodemailer`, `@google/generative-ai`, `cloudinary`... mà gọi thông qua provider.

### 18.1. Phân biệt `config/` và `providers/`

| Thư mục | Vai trò | Ví dụ |
| :--- | :--- | :--- |
| `config/` | **Cấu hình / khởi tạo** (đọc từ `env`, tạo sẵn client, hằng số cấu hình) | `mailer.config.js` tạo transporter SMTP, `gemini.config.js` chứa model và System Prompt |
| `providers/` | **Hàm gọi ra bên ngoài** (dùng cấu hình ở `config/` để thực hiện lời gọi) | `mailer.provider.js` có hàm `sendEmail()`, `gemini.provider.js` có hàm `generateReply()` |

### 18.2. Vị trí trong luồng xử lý

```
Controller ──► Service ──┬──► Repository ──► Database
                         └──► Provider ──► Dịch vụ bên ngoài (SMTP, Gemini, VNPAY, Cloudinary...)
```

- Chỉ **Service** (và `jobs/` thông qua Service) được gọi Provider. Controller, Repository, Middleware **không** gọi Provider trực tiếp.
- Provider **không** gọi ngược lên Service hay Repository, không đụng vào `req`, `res`.

### 18.3. Danh sách provider và người phụ trách

```text
src/providers/
├── mailer.provider.js       # Gửi email (quên mật khẩu, xác nhận...)            – Toàn
├── vnpay.provider.js        # Tạo URL thanh toán, ký/kiểm tra chữ ký HMAC-SHA512 – Toàn
├── gemini.provider.js       # Gọi Google Gemini AI                              – Hoàng
├── cloudinary.provider.js   # Upload / xóa ảnh trên Cloudinary                  – thống nhất nhóm
└── socket.provider.js       # Đẩy thông báo realtime (Socket.io)                – Hoàng
```

(Người phụ trách theo phân công ở mục 4 và `.env.example` mục 10.3.)

### 18.4. Quy tắc

1. Tên file: `<tên-dịch-vụ>.provider.js` (kebab-case, theo mục 5).
2. **Mỗi dịch vụ bên ngoài = 1 provider.** Chỉ file provider mới `import` thư viện của dịch vụ đó. Khi đổi nhà cung cấp (VD: Cloudinary sang lưu local) chỉ sửa đúng 1 file.
3. Provider **không chứa quy tắc nghiệp vụ** (không tính phí, không kiểm tra quyền, không quyết định gửi hay không gửi); chỉ nhận tham số thuần, gọi dịch vụ, trả về **dữ liệu thuần**.
4. Khóa bí mật, URL, API key lấy từ `env` (mục 12), không `process.env` trực tiếp.
5. Lỗi từ dịch vụ ngoài phải **bắt và bọc thành `ApiError`** (VD: `502 BAD_GATEWAY`, kèm `errorCode` riêng như `MAIL_PROVIDER_ERROR`, `AI_PROVIDER_ERROR`) rồi `throw`, để đi vào `error.middleware.js`. Không để lộ lỗi gốc của thư viện ra Client.
6. Cần timeout khi gọi dịch vụ chậm (Gemini, VNPAY) để request không bị treo.
7. Hàm provider là hàm **bất đồng bộ độc lập**, dễ mock khi test (mục 16).

### 18.5. Code mẫu

> Thứ tự đọc: `config/vnpay.config.js` → `providers/vnpay.provider.js` → `payment.service.js` (mục 18.6).

```javascript
// src/providers/mailer.provider.js
import { StatusCodes } from 'http-status-codes';
import { transporter } from '../config/mailer.config.js';
import { env } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    return await transporter.sendMail({ from: env.SMTP_USER, to, subject, html });
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Không gửi được email, vui lòng thử lại sau', 'MAIL_PROVIDER_ERROR');
  }
};
```

```javascript
// src/providers/gemini.provider.js
import { StatusCodes } from 'http-status-codes';
import { geminiModel } from '../config/gemini.config.js';
import ApiError from '../utils/ApiError.js';

export const generateReply = async (prompt) => {
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text(); // trả dữ liệu thuần (chuỗi), không trả object của thư viện
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Trợ lý AI đang bận, vui lòng thử lại sau', 'AI_PROVIDER_ERROR');
  }
};
```

Service gọi provider (nghiệp vụ nằm ở Service, không nằm ở Provider):

```javascript
// src/services/auth.service.js (trích)
import * as mailerProvider from '../providers/mailer.provider.js';

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại', 'USER_NOT_FOUND');

  const resetLink = await createResetLink(user); // nghiệp vụ: tạo token, lưu CSDL
  await mailerProvider.sendEmail({ to: user.email, subject: 'Đặt lại mật khẩu', html: `<a href="${resetLink}">Đặt lại mật khẩu</a>` });
};
```

Khi test Service, mock provider (không gửi email / gọi AI thật):

```javascript
jest.unstable_mockModule('../../src/providers/mailer.provider.js', () => ({ sendEmail: jest.fn() }));
```

- Bổ sung bảng mã status: **`502 Bad Gateway`** dùng khi dịch vụ bên ngoài (SMTP, Gemini, VNPAY, Cloudinary) lỗi hoặc không phản hồi.

### 18.6. Mẫu `vnpay.provider.js` (Toàn phụ trách, VNPAY Sandbox)

VNPAY yêu cầu: tham số **sắp xếp theo thứ tự A-Z**, giá trị được encode (khoảng trắng thành `+`), ký bằng **HMAC-SHA512** với `VNP_HASH_SECRET`, số tiền `vnp_Amount` phải **nhân 100**, thời gian `vnp_CreateDate` / `vnp_ExpireDate` theo **giờ Việt Nam (GMT+7)** dạng `yyyyMMddHHmmss`. Provider tự viết bằng module `crypto` có sẵn của Node.js và `dayjs` (đã có trong mục 1), không cần cài thêm thư viện.

```javascript
// src/config/vnpay.config.js
import { env } from './environment.js';

export const vnpayConfig = {
  tmnCode: env.VNP_TMN_CODE,
  hashSecret: env.VNP_HASH_SECRET,
  url: env.VNP_URL,
  returnUrl: env.VNP_RETURN_URL, // trang FE hiển thị kết quả cho khách
  version: '2.1.0',
  command: 'pay',
  currCode: 'VND',
  locale: 'vn',
  expireMinutes: 15,
};
```

```javascript
// src/providers/vnpay.provider.js
import crypto from 'node:crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { vnpayConfig } from '../config/vnpay.config.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// VNPAY dùng giờ Việt Nam (GMT+7), định dạng yyyyMMddHHmmss
const formatVnpDate = (date) => dayjs(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');

// Sắp xếp key A-Z, encode giá trị (khoảng trắng -> '+'), nối thành chuỗi query
const buildSignData = (params) =>
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`)
    .join('&');

const sign = (signData) =>
  crypto.createHmac('sha512', vnpayConfig.hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');

// Tạo URL thanh toán: FE redirect khách sang URL này
export const buildPaymentUrl = ({ txnRef, amount, orderInfo, ipAddr, bankCode }) => {
  const now = new Date();
  const params = {
    vnp_Version: vnpayConfig.version,
    vnp_Command: vnpayConfig.command,
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: vnpayConfig.locale,
    vnp_CurrCode: vnpayConfig.currCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo, // tiếng Việt không dấu, không ký tự đặc biệt
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100), // VNPAY yêu cầu nhân 100
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: formatVnpDate(now),
    vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + vnpayConfig.expireMinutes * 60 * 1000)),
    vnp_BankCode: bankCode, // tùy chọn, bỏ trống thì khách tự chọn tại cổng VNPAY
  };

  const signData = buildSignData(params);
  return `${vnpayConfig.url}?${signData}&vnp_SecureHash=${sign(signData)}`;
};

// Kiểm tra chữ ký của Return URL / IPN (truyền vào req.query). CHỈ xác thực + trả dữ liệu thuần
export const verifyCallback = (query) => {
  const receivedHash = query.vnp_SecureHash;
  const params = Object.fromEntries(
    Object.entries(query).filter(
      ([key]) => key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType'
    )
  );

  const expected = Buffer.from(sign(buildSignData(params)));
  const received = Buffer.from(String(receivedHash || '').toLowerCase());
  const isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  return {
    isValid,
    txnRef: params.vnp_TxnRef,
    amount: Number(params.vnp_Amount) / 100, // chia 100 để về VNĐ
    isSuccess: params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00',
    responseCode: params.vnp_ResponseCode,
    transactionNo: params.vnp_TransactionNo,
  };
};
```

Phân chia trách nhiệm (provider chỉ lo kỹ thuật VNPAY, **nghiệp vụ ở `payment.service.js`**):

| Việc | Ở đâu |
| :--- | :--- |
| Sắp xếp tham số, ký HMAC-SHA512, nhân 100, định dạng ngày GMT+7, kiểm tra chữ ký | `vnpay.provider.js` |
| Tạo `vnp_TxnRef`, tìm đơn / lịch hẹn, **so khớp số tiền với CSDL**, kiểm tra trạng thái đang `pending`, cập nhật `payments`, trả `RspCode` cho VNPAY | `payment.service.js` (trong Transaction, mục 8) |

Khi xử lý **IPN** (VNPAY gọi server-to-server, đây mới là nơi chốt giao dịch; Return URL chỉ để hiển thị cho khách), Service phải kiểm tra đủ: (1) chữ ký hợp lệ, (2) đơn hàng / lịch hẹn tồn tại, (3) số tiền khớp CSDL, (4) trạng thái hiện tại là chờ thanh toán. Đồng thời phải **chống xử lý trùng** (idempotent): VNPAY có thể gọi IPN nhiều lần với cùng `vnp_TxnRef`, giao dịch đã thành công thì không cập nhật lần 2.

```javascript
// src/services/payment.service.js (trích)
import * as vnpayProvider from '../providers/vnpay.provider.js';

export const createVnpayUrl = async (userId, bookingId, ipAddr) => {
  const booking = await bookingRepository.findById(bookingId);
  // ...kiểm tra tồn tại, quyền sở hữu, trạng thái (nghiệp vụ)...
  const txnRef = generatePaymentCode(); // mã duy nhất cho mỗi lần thanh toán
  return vnpayProvider.buildPaymentUrl({
    txnRef,
    amount: booking.total_amount,
    orderInfo: `Thanh toan lich hen ${booking.booking_code}`,
    ipAddr,
  });
};
```

Lưu ý khi dùng:
- `vnp_TxnRef` phải **duy nhất cho mỗi lần thanh toán** (theo tài liệu VNPAY không được trùng trong ngày), nên khách thanh toán lại cần sinh mã mới, không dùng lại mã cũ.
- `ipAddr` do Controller lấy từ `req.ip` rồi truyền xuống Service. Khi chạy sau proxy (Render, ngrok) cần `app.set('trust proxy', true)` trong `app.js`.
- URL IPN được khai báo **trong trang quản trị VNPAY Sandbox**, không truyền trong tham số. Test ở local dùng ngrok (mục 10.2).
- Chuyển sang môi trường thật chỉ cần đổi `VNP_URL`, `VNP_TMN_CODE`, `VNP_HASH_SECRET` trong `.env`, không sửa code provider.

---

## 19. PHỤ LỤC: CÁC FILE / DÒNG CẦN THÊM VÀO DỰ ÁN

| Hạng mục | Việc cần làm |
| :--- | :--- |
| `src/config/cors.js` | Tạo mới theo mục 13 |
| `src/config/environment.js` | Cập nhật theo mục 12 (export object `env`, ép kiểu) |
| `src/middlewares/validate.middleware.js` | Cập nhật theo mục 14.2 |
| `src/middlewares/error.middleware.js` | Cập nhật theo mục 15.2 |
| `src/utils/ApiError.js` | Cập nhật theo mục 15.2 (thêm `name`, `captureStackTrace`) |
| `tests/` | Tạo mới thư mục và cấu hình Jest theo mục 11.2, 16 |
| `src/providers/*.provider.js` | Tạo mới thư mục, mỗi dịch vụ bên ngoài 1 file; Service gọi qua provider (mục 18) |
| `src/entities/*.entity.js` & `src/repositories/*.repository.js` | Mỗi domain khai báo thêm schema Joi cạnh Entity và validate lần 2 trong Repository khi ghi (mục 17) |
| `.env.example` | Thêm dòng `CORS_ORIGINS=...` (mục 12) |
| `package.json` | Thêm `"type": "module"`, scripts `dev` / `start` / `test` và cấu hình `jest` (mục 11.2); commit kèm `package-lock.json` |
