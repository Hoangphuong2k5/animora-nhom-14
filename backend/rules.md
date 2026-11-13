# 📘 QUY CHUẨN KỸ THUẬT & TỔ CHỨC CODE BACK-END (RULES & CONVENTIONS)
**Dự án:** ANIMORA – Nền tảng Chăm sóc, Mua sắm và Nhận nuôi Thú cưng  
**Nhóm thực hiện:** DN26_CPL – Group 14 (Team Back-End: **Toàn, Phương, Hoàng**)  
**Mục đích:** Thống nhất 100% cách tổ chức thư mục, đặt tên file, luồng xử lý giữa các tầng, chuẩn API và cách viết code để 3 thành viên BE code đồng nhất như một người viết, tránh xung đột (merge conflict) khi ghép code.

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
│   │   ├── env.config.js           # Load biến môi trường từ .env
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

module.exports = ApiError;
```

**`src/utils/apiResponse.js`**
```javascript
const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginatedResponse = (res, data, page, limit, totalItems, message = 'Thành công') => {
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

module.exports = { successResponse, paginatedResponse };
```

**`src/utils/asyncHandler.js`**
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

---

### 7.2. Mẫu viết 1 luồng tính năng từ A-Z (Ví dụ: Quản lý Thú cưng - `pet`)

#### Bước 1: Định nghĩa Entity (`src/entities/pet.entity.js`)
```javascript
const { EntitySchema } = require('typeorm');

const PetEntity = new EntitySchema({
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

module.exports = { PetEntity };
```

#### Bước 2: Viết Repository (`src/repositories/pet.repository.js`)
```javascript
const { AppDataSource } = require('../config/data-source');
const { PetEntity } = require('../entities/pet.entity');

const getRepo = (manager) => (manager ? manager.getRepository(PetEntity) : AppDataSource.getRepository(PetEntity));

const findByOwnerId = async (ownerId) => {
  return await getRepo().find({
    where: { owner_id: ownerId, status: 'active' },
    order: { created_at: 'DESC' },
  });
};

const findById = async (id) => {
  return await getRepo().findOne({
    where: { id, status: 'active' },
  });
};

const createPet = async (petData, manager = null) => {
  const repo = getRepo(manager);
  const newPet = repo.create(petData);
  return await repo.save(newPet);
};

module.exports = {
  findByOwnerId,
  findById,
  createPet,
};
```

#### Bước 3: Viết Service xử lý nghiệp vụ (`src/services/pet.service.js`)
```javascript
const petRepository = require('../repositories/pet.repository');
const ApiError = require('../utils/ApiError');

const createNewPet = async (userId, payload) => {
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

const getPetDetail = async (userId, petId) => {
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

module.exports = {
  createNewPet,
  getPetDetail,
};
```

#### Bước 4: Viết Controller (`src/controllers/pet.controller.js`)
```javascript
const petService = require('../services/pet.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const createPet = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Lấy từ auth.middleware.js
  const result = await petService.createNewPet(userId, req.body);
  return successResponse(res, result, 'Thêm hồ sơ thú cưng thành công', 201);
});

const getPetById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const petId = req.params.id;
  const result = await petService.getPetDetail(userId, petId);
  return successResponse(res, result, 'Lấy thông tin thú cưng thành công');
});

module.exports = {
  createPet,
  getPetById,
};
```

#### Bước 5: Khai báo Route (`src/routes/pet.route.js`)
```javascript
const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

router.use(verifyToken); // Toàn bộ route bên dưới đều yêu cầu đăng nhập

router.post('/', authorizeRoles('customer'), petController.createPet);
router.get('/:id', authorizeRoles('customer'), petController.getPetById);

module.exports = router;
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
   - Chọn nhánh đích (base): `develop` $\leftarrow$ nhánh nguồn (compare): `feature/toan-bkg01-booking-engine`.
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

### 10.1. Có dùng Docker không? $\rightarrow$ **CÓ (Dùng Docker Compose ở Local cho SQL Server)**
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

### 10.2. Có mua tên miền không & Deploy lên đâu? $\rightarrow$ **KHÔNG MUA TÊN MIỀN – DÙNG GÓI FREE**

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
