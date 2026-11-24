# ANIMORA – THIẾT KẾ CƠ SỞ DỮ LIỆU & KỸ THUẬT API THEO PHÂN HỆ

- **Phiên bản:** 1.5 (Sắp xếp phân hệ theo thứ tự ưu tiên `P0 → P1` đồng bộ với `PhanTichNghiepVu.md`: Xác thực & Phân quyền + Quản lý Hồ sơ Thú cưng + Lịch làm việc, Nghỉ phép & Đổi ca + Đặt lịch & Thanh toán + Cửa hàng, Giỏ hàng, Voucher & Đổi trả)
- **Ngày cập nhật:** 17/11/2026
- **Tài liệu nghiệp vụ nguồn:** Xem quy tắc chi tiết tại `PhanTichNghiepVu.md` (Module 1, Module 2, Module 3, Module 4 & Module 5)

---

<a id="muc-luc"></a>
## Mục lục

- [Phân hệ 1: Xác thực, Tài khoản & Phân quyền (`Auth & RBAC`) `[P0]`](#phan-he-1)
  - [1.1. Sơ đồ Chuyển đổi Trạng thái Tài khoản (State Machine)](#phan-he-1-1)
  - [1.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)](#phan-he-1-2)
  - [1.3. Lưu ý Kỹ thuật Triển khai API & Bảo mật (FE / BE)](#phan-he-1-3)
- [Phân hệ 2: Quản lý Hồ sơ Thú cưng (`Pets & Health Records`) `[P0]`](#phan-he-2)
  - [2.1. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)](#phan-he-2-1)
  - [2.2. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ](#phan-he-2-2)
- [Phân hệ 3: Lịch làm việc, Nghỉ phép & Đổi ca (`Schedule & Leave`) `[P0]`](#phan-he-3)
  - [3.1. Sơ đồ Chuyển đổi Trạng thái (State Machine)](#phan-he-3-1)
  - [3.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)](#phan-he-3-2)
  - [3.3. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ](#phan-he-3-3)
- [Phân hệ 4: Đặt lịch dịch vụ và Thanh toán (`Bookings & Payments`) `[P0]`](#phan-he-4)
  - [4.1. Sơ đồ chuyển đổi trạng thái Lịch hẹn (State Machine)](#phan-he-4-1)
  - [4.2. Thiết kế Cơ sở dữ liệu (Database Schema)](#phan-he-4-2)
  - [4.3. Lưu ý kỹ thuật khi triển khai API (FE/BE)](#phan-he-4-3)
- [Phân hệ 5: Cửa hàng, Giỏ hàng, Voucher & Đổi trả (`Shop, Vouchers & Returns`) `[P1]`](#phan-he-5)
  - [5.1. Sơ đồ Chuyển đổi Trạng thái (State Machine)](#phan-he-5-1)
  - [5.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)](#phan-he-5-2)
  - [5.3. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ](#phan-he-5-3)

---

<a id="phan-he-1"></a>
## Phân hệ 1: Xác thực, Tài khoản & Phân quyền (`Auth & RBAC`) `[P0]`

<a id="phan-he-1-1"></a>
### 1.1. Sơ đồ Chuyển đổi Trạng thái Tài khoản (State Machine)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Bảo mật (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | `QL` tạo nhanh khách Walk-in tại quầy | `UNCLAIMED` *(Chưa kích hoạt)* | `QL` | Tạo hồ sơ `KH` chưa có mật khẩu để gắn thú cưng và lịch hẹn tại quầy. |
| *(Khởi tạo)* | `KH` tự đăng ký mới (Email/SĐT) | `PENDING_OTP` *(Chờ xác thực)* | `KH` | Gửi mã OTP 6 số (hiệu lực 5 phút). |
| `UNCLAIMED` / `PENDING_OTP` | Xác thực OTP hợp lệ & đặt mật khẩu | `ACTIVE` *(Đang hoạt động)* | `KH` | Kích hoạt tài khoản; nếu từ `UNCLAIMED`, kế thừa toàn bộ dữ liệu Walk-in. |
| *(Khởi tạo)* | Tạo mới `BS` hoặc `NVCS` | `PENDING_VERIFICATION` | `QL`, `AD` | Chỉ mở màn hình nộp bằng cấp/chứng chỉ; ẩn khỏi đặt lịch & chia thuốc. |
| `PENDING_VERIFICATION` | `QL` duyệt chứng chỉ hành nghề | `ACTIVE` *(Đang hoạt động)* | `QL` | Mở toàn bộ quyền chuyên môn, hiển thị đặt lịch & tham gia chia thuốc. |
| `ACTIVE` | Nhập sai mật khẩu 05 lần liên tiếp | `TEMP_LOCKED` *(Tạm khóa 15p)* | System | Chặn đăng nhập trong 15 phút; tự động mở lại khi hết thời gian phạt. |
| `ACTIVE` | Khóa / Ngừng hoạt động nhân sự | `INACTIVE` *(Ngừng hoạt động)* | `QL`, `AD` | Thu hồi JWT tức thì, bắt buộc điều phối lịch hẹn tương lai & thu hồi thuốc kệ `BS`. |

<a id="phan-he-1-2"></a>
### 1.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)

Lược đồ dưới đây sử dụng cú pháp chuẩn **T-SQL (SQL Server)** (`INT IDENTITY(1,1)`, `NVARCHAR`, `BIT`, `DATETIME2`), hỗ trợ đầy đủ 7 vai trò, luồng kích hoạt Walk-in, duyệt chứng chỉ, quản lý phiên đa thiết bị, định danh trực ca `QL` và nhật ký can thiệp khẩn cấp của `AD`:

```sql
-- 1. Danh mục 7 Vai trò chuẩn của hệ thống Animora
CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_code NVARCHAR(10) NOT NULL UNIQUE CHECK (
        role_code IN ('KH', 'BS', 'NVCS', 'QL', 'AD', 'SUP', 'TCH')
    ),
    role_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(250) NULL
);

-- 2. Bảng Tài khoản người dùng trung tâm
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    user_code NVARCHAR(20) NOT NULL UNIQUE, -- VD: USR-20261117-0001
    role_id INT NOT NULL REFERENCES roles(role_id),
    
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NULL,
    phone_number NVARCHAR(20) NULL,
    password_hash NVARCHAR(255) NULL, -- NULL nếu trạng thái UNCLAIMED (Walk-in)
    avatar_url NVARCHAR(500) NULL,
    
    -- Quản lý vòng đời tài khoản & bảo mật đăng nhập
    status NVARCHAR(25) NOT NULL DEFAULT 'PENDING_OTP' CHECK (
        status IN ('UNCLAIMED', 'PENDING_OTP', 'PENDING_VERIFICATION', 'ACTIVE', 'INACTIVE')
    ),
    must_change_password BIT NOT NULL DEFAULT 0, -- Bắt buộc đổi MK lần đầu cho SUP/TCH
    is_shared_account BIT NOT NULL DEFAULT 0,    -- Đánh dấu = 1 cho tài khoản QL dùng chung
    
    -- Chống Brute-force
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME2 NULL,
    
    -- Ràng buộc khóa Trả sau (Đồng bộ Module 4)
    is_pay_later_restricted BIT NOT NULL DEFAULT 0,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    created_by INT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_User_Contact CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

-- Filtered Unique Index: Đảm bảo Email và SĐT duy nhất nhưng cho phép NULL
CREATE UNIQUE INDEX UX_Users_Email_NotNull ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX UX_Users_Phone_NotNull ON users(phone_number) WHERE phone_number IS NOT NULL;

-- 3. Liên kết Đăng nhập Google OAuth2 cho Khách hàng
CREATE TABLE user_oauth_accounts (
    oauth_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider NVARCHAR(20) NOT NULL DEFAULT 'GOOGLE' CHECK (provider IN ('GOOGLE')),
    provider_user_id NVARCHAR(150) NOT NULL, -- Google 'sub' ID
    provider_email NVARCHAR(150) NOT NULL,
    linked_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_OAuth_Provider_User UNIQUE (provider, provider_user_id)
);

-- 4. Bảng Mã xác thực OTP (Đăng ký, Kích hoạt Walk-in, Quên mật khẩu qua Email)
CREATE TABLE otp_verifications (
    otp_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    target_contact NVARCHAR(150) NOT NULL, -- Email hoặc SĐT nhận mã (RESET_PASSWORD dùng Email)
    otp_code_hash NVARCHAR(255) NOT NULL,
    purpose NVARCHAR(30) NOT NULL CHECK (
        purpose IN ('REGISTER', 'CLAIM_WALKIN', 'RESET_PASSWORD')
    ),
    attempt_count INT NOT NULL DEFAULT 0,
    is_used BIT NOT NULL DEFAULT 0,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 5. Hồ sơ Năng lực & Chứng chỉ hành nghề của BS / NVCS (Credential Gate)
CREATE TABLE staff_credentials (
    credential_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES users(user_id),
    credential_type NVARCHAR(30) NOT NULL CHECK (
        credential_type IN ('VET_LICENSE', 'DEGREE', 'GROOMING_CERT', 'OTHER')
    ),
    credential_name NVARCHAR(200) NOT NULL,
    license_number NVARCHAR(100) NULL,
    specialty NVARCHAR(150) NULL, -- Chuyên khoa (Nội khoa, Ngoại khoa, Da liễu...)
    document_url NVARCHAR(500) NOT NULL,
    issued_date DATE NULL,
    expiry_date DATE NULL,
    
    verification_status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        verification_status IN ('PENDING', 'APPROVED', 'REJECTED')
    ),
    reject_reason NVARCHAR(300) NULL,
    verified_by INT NULL REFERENCES users(user_id),
    verified_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 6. Quản lý Phiên đăng nhập & Refresh Token
CREATE TABLE user_sessions (
    session_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id INT NOT NULL REFERENCES users(user_id),
    refresh_token_hash NVARCHAR(255) NOT NULL,
    
    -- Định danh người trực ca khi đăng nhập tài khoản QL dùng chung
    operator_name NVARCHAR(100) NULL,
    
    device_info NVARCHAR(250) NULL,
    ip_address NVARCHAR(45) NULL,
    is_revoked BIT NOT NULL DEFAULT 0,
    revoked_reason NVARCHAR(150) NULL,
    last_active_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 7. Phiên kích hoạt Chế độ Can thiệp Khẩn cấp của Admin
CREATE TABLE emergency_override_sessions (
    override_id INT IDENTITY(1,1) PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES users(user_id),
    session_id UNIQUEIDENTIFIER NOT NULL REFERENCES user_sessions(session_id),
    reason NVARCHAR(500) NOT NULL,
    started_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    expires_at DATETIME2 NOT NULL, -- started_at + 30 phút
    ended_at DATETIME2 NULL,       -- Có giá trị nếu AD tắt thủ công sớm hơn 30 phút
    is_active BIT NOT NULL DEFAULT 1
);

-- 8. Nhật ký Kiểm toán Toàn hệ thống
CREATE TABLE system_audit_logs (
    log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    actor_user_id INT NOT NULL REFERENCES users(user_id),
    actor_role NVARCHAR(10) NOT NULL,
    session_id UNIQUEIDENTIFIER NULL REFERENCES user_sessions(session_id),
    operator_name NVARCHAR(100) NULL, -- Ghi rõ tên người trực nếu actor_role = 'QL'
    
    -- Đánh dấu nếu thao tác được thực hiện dưới chế độ khẩn cấp của AD
    is_emergency_override BIT NOT NULL DEFAULT 0,
    override_id INT NULL REFERENCES emergency_override_sessions(override_id),
    
    module_name NVARCHAR(50) NOT NULL, -- AUTH, PETS, SCHEDULE, BOOKING, INVENTORY...
    action_type NVARCHAR(50) NOT NULL, -- DEACTIVATE_STAFF, RESET_QL_PASSWORD, EMERGENCY_ON...
    target_entity NVARCHAR(50) NOT NULL,
    target_id NVARCHAR(50) NOT NULL,
    old_values NVARCHAR(MAX) NULL,
    new_values NVARCHAR(MAX) NULL,
    reason NVARCHAR(500) NULL,
    ip_address NVARCHAR(45) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 9. Bảng Thông báo Giám sát Nội bộ (Cảnh báo hai chiều cho QL)
CREATE TABLE system_notifications (
    notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    recipient_user_id INT NOT NULL REFERENCES users(user_id),
    severity NVARCHAR(15) NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'HIGH')),
    title NVARCHAR(200) NOT NULL,
    content NVARCHAR(500) NOT NULL,
    reference_type NVARCHAR(50) NULL,
    reference_id NVARCHAR(50) NULL,
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
```

<a id="phan-he-1-3"></a>
### 1.3. Lưu ý Kỹ thuật Triển khai API & Bảo mật (FE / BE)

- **Middleware kiểm tra Quyền & Chế độ Khẩn cấp của `AD`:**
  - Đối với mọi API ghi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) thuộc các phân hệ vận hành (Module 2 đến Module 8), nếu `req.user.role === 'AD'`, Middleware bắt buộc kiểm tra xem `AD` có bản ghi `emergency_override_sessions` đang `is_active = 1` và `expires_at > SYSDATETIME()` hay không.
  - Nếu không có phiên khẩn cấp hợp lệ, API lập tức trả về `403 Forbidden` (*"Tài khoản Admin đang ở chế độ Chỉ xem. Vui lòng bật Chế độ Can thiệp Khẩn cấp để thực hiện thao tác này"*).
- **Logic Kích hoạt Tài khoản Walk-in:**
  - Tại API `POST /api/auth/register/init`, Back-end kiểm tra `phone_number` trong bảng `users`:
    - Nếu tồn tại bản ghi có `status = 'ACTIVE'` hoặc `'PENDING_VERIFICATION'` $\rightarrow$ trả về `409 Conflict` (*"Số điện thoại đã được đăng ký"*).
    - Nếu tồn tại bản ghi có `status = 'UNCLAIMED'` $\rightarrow$ trả về cờ `account_claim_required: true` để Front-end hiển thị thông báo: *"Hệ thống tìm thấy hồ sơ khám tại quầy gắn với số điện thoại này. Xác thực OTP để kích hoạt và đồng bộ dữ liệu"*.
- **Giao dịch nguyên tử khi Khóa tài khoản Bác sĩ:**
  - API `PATCH /api/users/{id}/deactivate` phải thực thi trong **01 Database Transaction (ACID)**:
    1. Kiểm tra nếu `COUNT(*)` lịch hẹn `PENDING`/`CONFIRMED` trong tương lai $> 0$ $\rightarrow$ Rollback và trả về `400 Bad Request` kèm danh sách mã lịch hẹn cần điều phối.
    2. Cập nhật `users.status = 'INACTIVE'` và `user_sessions.is_revoked = 1`.
    3. Nếu `role_code = 'BS'`, truy vấn toàn bộ thuốc có `quantity > 0` trong Hộp thuốc cá nhân của bác sĩ đó, cộng hoàn trả vào `Tồn kho chung`, đặt số lượng trên kệ bác sĩ về `0` và ghi bản ghi biến động kho kèm `system_audit_logs`.
- **Bảo mật OTP & Mật khẩu:**
  - Mã OTP 6 chữ số không được lưu dạng văn bản thuần (`plaintext`) trong DB mà phải băm bằng `SHA-256`/`BCrypt`, giới hạn nhập sai tối đa `05 lần`/mã OTP và giới hạn tần suất gửi lại (`Rate Limit`: tối đa `01` mã mỗi `60 giây`).

---

<a id="phan-he-2"></a>
## Phân hệ 2: Quản lý Hồ sơ Thú cưng (`Pets & Health Records`) `[P0]`

<a id="phan-he-2-1"></a>
### 2.1. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)

Lược đồ dưới đây sử dụng cú pháp chuẩn **T-SQL (SQL Server)** (`INT IDENTITY(1,1)`, `NVARCHAR`, `BIT`, `DATETIME2`), tích hợp cột `version` để chống ghi đè đồng thời và **Filtered Unique Index** cho mã Microchip:

```sql
-- 1. Danh mục Loài thú cưng
CREATE TABLE pet_species (
    species_id INT IDENTITY(1,1) PRIMARY KEY,
    species_name NVARCHAR(50) NOT NULL UNIQUE, -- VD: Chó, Mèo, Thỏ, Khác
    is_active BIT NOT NULL DEFAULT 1
);

-- 2. Danh mục Giống thú cưng theo Loài
CREATE TABLE pet_breeds (
    breed_id INT IDENTITY(1,1) PRIMARY KEY,
    species_id INT NOT NULL REFERENCES pet_species(species_id),
    breed_name NVARCHAR(100) NOT NULL, -- VD: Poodle, Golden Retriever, Mèo Anh lông ngắn, Giống lai
    is_active BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Species_Breed UNIQUE (species_id, breed_name)
);

-- 3. Bảng Hồ sơ Thú cưng chính (Optimistic Locking)
CREATE TABLE pets (
    pet_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_code NVARCHAR(20) NOT NULL UNIQUE, -- VD: PET-20261117-0001
    owner_id INT NOT NULL REFERENCES users(user_id), -- ID của KH hoặc tài khoản đại diện TCH
    
    pet_name NVARCHAR(100) NOT NULL,
    species_id INT NOT NULL REFERENCES pet_species(species_id),
    breed_id INT NULL REFERENCES pet_breeds(breed_id),
    custom_breed_name NVARCHAR(100) NULL, -- Nhập tay nếu chọn giống khác
    gender NVARCHAR(15) NOT NULL DEFAULT 'UNKNOWN' CHECK (gender IN ('MALE', 'FEMALE', 'UNKNOWN')),
    
    -- Quản lý tuổi chính xác hoặc ước lượng
    age_input_type NVARCHAR(15) NOT NULL DEFAULT 'EXACT_DOB' CHECK (age_input_type IN ('EXACT_DOB', 'ESTIMATED')),
    date_of_birth DATE NULL,
    estimated_age_months INT NULL CHECK (estimated_age_months >= 0),
    age_recorded_at DATE NULL,
    
    -- Định danh ngoại hình & Chip
    coat_color NVARCHAR(100) NULL,
    distinctive_marks NVARCHAR(300) NULL,
    microchip_number NVARCHAR(50) NULL,
    avatar_url NVARCHAR(500) NULL,
    
    -- Chỉ số hiện tại & Triệt sản
    current_weight_kg DECIMAL(5, 2) NULL CHECK (current_weight_kg > 0),
    neutered_status NVARCHAR(15) NOT NULL DEFAULT 'UNKNOWN' CHECK (neutered_status IN ('NEUTERED', 'INTACT', 'UNKNOWN')),
    
    -- Nguồn gốc cứu hộ (Khóa chỉ đọc sau khi bàn giao)
    source_type NVARCHAR(20) NOT NULL DEFAULT 'CUSTOMER_CREATED' CHECK (source_type IN ('CUSTOMER_CREATED', 'SHELTER')),
    origin_shelter_id INT NULL REFERENCES shelters(shelter_id),
    
    -- Vòng đời & Xóa mềm
    lifecycle_status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (
        lifecycle_status IN ('ACTIVE', 'LOST', 'DECEASED', 'ARCHIVED')
    ),
    status_updated_at DATETIME2 NULL,
    status_note NVARCHAR(300) NULL,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking chống ghi đè
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Filtered Unique Index: Đảm bảo Microchip duy nhất toàn hệ thống nhưng cho phép nhiều dòng NULL
CREATE UNIQUE INDEX UX_Pets_Microchip_NotNull 
ON pets(microchip_number) 
WHERE microchip_number IS NOT NULL;

-- 4. Lịch sử Cân nặng thú cưng
CREATE TABLE pet_weight_logs (
    weight_log_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    weight_kg DECIMAL(5, 2) NOT NULL CHECK (weight_kg > 0),
    appointment_id INT NULL REFERENCES appointments(appointment_id), -- Có giá trị nếu đo lúc check-in khám/spa
    recorded_by INT NOT NULL REFERENCES users(user_id),
    recorded_by_role NVARCHAR(10) NOT NULL, -- KH, BS, NVCS, QL, TCH
    note NVARCHAR(250) NULL,
    recorded_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 5. Bộ Nhãn Cảnh báo An toàn Y tế & Hành vi
CREATE TABLE pet_alerts (
    alert_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    alert_category NVARCHAR(25) NOT NULL CHECK (
        alert_category IN ('ALLERGY', 'CHRONIC_CONDITION', 'BEHAVIOR')
    ),
    severity NVARCHAR(15) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    alert_title NVARCHAR(150) NOT NULL, -- VD: Dị ứng Penicillin, Sợ máy sấy - dễ cắn
    description NVARCHAR(500) NULL,
    
    -- Khóa bảo vệ cảnh báo y tế do Bác sĩ xác nhận
    is_doctor_verified BIT NOT NULL DEFAULT 0,
    verified_by_doctor_id INT NULL REFERENCES users(user_id),
    is_active BIT NOT NULL DEFAULT 1,
    
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 6. Ghi chú Chăm sóc Spa của NVCS
CREATE TABLE pet_care_notes (
    care_note_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    appointment_id INT NULL REFERENCES appointments(appointment_id),
    coat_condition NVARCHAR(150) NULL, -- VD: Rối lông vùng tai, rụng lông nhiều
    skin_condition NVARCHAR(150) NULL, -- VD: Da khô, có gàu nhẹ vùng lưng
    grooming_preferences NVARCHAR(300) NULL, -- VD: Cắt ngắn 5mm, dùng sữa tắm dịu nhẹ
    staff_id INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 7. Sổ Tiêm phòng & Tẩy giun Đa nguồn
CREATE TABLE pet_vaccinations (
    vaccination_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    record_type NVARCHAR(20) NOT NULL CHECK (record_type IN ('VACCINE', 'DEWORMING')),
    vaccine_name NVARCHAR(150) NOT NULL, -- VD: Vắc-xin 7 bệnh, Dại, Tẩy giun Drontal
    administered_date DATE NOT NULL,
    next_due_date DATE NULL,
    
    -- Phân biệt nguồn nội bộ vs KH tự khai báo & trạng thái BS xác thực
    source NVARCHAR(15) NOT NULL CHECK (source IN ('INTERNAL', 'EXTERNAL')),
    appointment_id INT NULL REFERENCES appointments(appointment_id), -- Có giá trị nếu source = INTERNAL
    proof_image_url NVARCHAR(500) NULL, -- Ảnh chụp tem/sổ tiêm nếu source = EXTERNAL
    
    verification_status NVARCHAR(20) NOT NULL DEFAULT 'SELF_REPORTED' CHECK (
        verification_status IN ('SELF_REPORTED', 'VERIFIED')
    ),
    verified_by_doctor_id INT NULL REFERENCES users(user_id),
    verified_at DATETIME2 NULL,
    
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 8. Lịch sử Chuyển giao / Chuyển nhượng Chủ sở hữu
CREATE TABLE pet_ownership_history (
    transfer_id INT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    from_owner_id INT NOT NULL REFERENCES users(user_id),
    to_owner_id INT NOT NULL REFERENCES users(user_id),
    transfer_type NVARCHAR(25) NOT NULL CHECK (
        transfer_type IN ('SHELTER_ADOPTION', 'CUSTOMER_TRANSFER')
    ),
    adoption_request_id INT NULL, -- Tham chiếu đến đơn nhận nuôi nếu là SHELTER_ADOPTION
    transfer_note NVARCHAR(300) NULL,
    transferred_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 9. Nhật ký Kiểm toán Từng Trường Dữ liệu Hồ sơ Thú cưng
CREATE TABLE pet_audit_logs (
    audit_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(pet_id),
    action_type NVARCHAR(20) NOT NULL CHECK (
        action_type IN ('CREATE', 'UPDATE_FIELD', 'STATUS_CHANGE', 'OWNERSHIP_TRANSFER', 'VERIFY_RECORD')
    ),
    field_name NVARCHAR(100) NULL, -- Tên trường bị sửa: weight, microchip_number, neutered_status...
    old_value NVARCHAR(MAX) NULL,
    new_value NVARCHAR(MAX) NULL,
    changed_by INT NOT NULL REFERENCES users(user_id),
    changed_by_role NVARCHAR(10) NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
```

<a id="phan-he-2-2"></a>
### 2.2. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ

- **Logic tự động tạo phụ thu khi Check-in lệch bậc cân nặng:**
  - Tại API `PATCH /api/appointments/{id}/check-in` (hoặc API cập nhật cân nặng gắn với `appointment_id` đang ở trạng thái `IN_PROGRESS`), Back-end thực hiện truy vấn đối chiếu bậc giá cũ (`booked_tier_price`) và bậc giá theo `new_weight_kg` trong bảng `service_pricing_tiers`.
  - Nếu `actual_tier_price > booked_tier_price`, hệ thống thực hiện trong **01 Database Transaction**:
    1. Thêm bản ghi vào `pet_weight_logs` và cập nhật `pets.current_weight_kg`.
    2. Chèn bản ghi vào `appointment_addons` với `addon_type = 'EXTRA_SERVICE'` và `subtotal = actual_tier_price - booked_tier_price`.
    3. Cập nhật `appointments.addon_total_amount` và `appointments.final_total_amount`.
- **Kiểm tra điều kiện trước khi Chuyển nhượng hoặc Lưu trữ hồ sơ:**
  - Trước khi thực thi API chuyển nhượng chủ sở hữu (`POST /api/pets/{id}/transfer`) hoặc đổi trạng thái sang `ARCHIVED`/`DECEASED`, Back-end bắt buộc kiểm tra:
    ```sql
    SELECT COUNT(*) FROM appointments
    WHERE pet_id = @petId
      AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
    ```
    Nếu số lượng $> 0$, API trả về lỗi `400 Bad Request` yêu cầu hoàn tất hoặc hủy các lịch hẹn đang mở trước khi chuyển nhượng/đóng hồ sơ.
- **Xử lý trùng lặp khi tạo hồ sơ:**
  - Khi nhận lỗi vi phạm Unique Index `UX_Pets_Microchip_NotNull` (mã lỗi SQL Server `2601` hoặc `2627`), Back-end bắt ngoại lệ và trả về mã `409 Conflict` kèm thông báo rõ ràng: *"Mã số Microchip này đã được đăng ký cho một thú cưng khác trên hệ thống"*.
  - Với kiểm tra trùng `Tên + Loài` trong cùng tài khoản `KH`, API `POST /api/pets` hỗ trợ cờ `confirm_duplicate = true` sau khi người dùng đã xác nhận cảnh báo trên giao diện.

---

<a id="phan-he-3"></a>
## Phân hệ 3: Lịch làm việc, Nghỉ phép & Đổi ca (`Schedule & Leave`) `[P0]`

<a id="phan-he-3-1"></a>
### 3.1. Sơ đồ Chuyển đổi Trạng thái (State Machine)

#### Vòng đời Đơn xin nghỉ phép (`Leave_Request`)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Hệ thống (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | Gửi đơn nghỉ (`PLANNED` $\ge 24\text{h}$ hoặc `EMERGENCY`) | `PENDING` *(Chờ duyệt)* | `BS`, `NVCS Full-time` | Giữ chỗ $1$ ngày trong quỹ $4$ ngày/tháng (`Pending Quota`); đếm số lịch hẹn trùng trong ngày. |
| `PENDING` | Nhân sự tự rút đơn trước khi duyệt | `CANCELLED` *(Đã hủy)* | `BS`, `NVCS Full-time` | Hoàn lại $1$ ngày giữ chỗ vào quỹ phép tháng. |
| `PENDING` | `QL` từ chối đơn nghỉ | `REJECTED` *(Từ chối)* | `QL` | Bắt buộc nhập lý do từ chối; hoàn lại $1$ ngày giữ chỗ vào quỹ phép tháng. |
| `PENDING` | `QL` duyệt (kèm chuyển giao lịch hẹn nếu có) | `APPROVED` *(Đã duyệt)* | `QL` | Chuyển `assigned_staff_id` các lịch hẹn trùng sang người thay thế; khóa slot nghỉ cả ngày của nhân sự. |
| `APPROVED` | `QL` hủy ngoại lệ (nhân sự đi làm lại) | `CANCELLED_BY_QL` | `QL` | Bắt buộc nhập lý do; hoàn lại $1$ ngày vào quỹ phép tháng; ghi nhật ký kiểm toán. |

#### Vòng đời Yêu cầu Đổi ca Part-time (`Shift_Swap_Request`)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Hệ thống (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | NV A gửi đề nghị chuyển ca cho NV B ($\Delta t \ge 4\text{h}$) | `PENDING_PEER` *(Chờ đồng nghiệp)* | `NVCS Part-time` (A) | Kiểm tra NV B không trùng ca & không vượt trần giờ/tuần. |
| `PENDING_PEER` | NV B từ chối hoặc NV A hủy đề nghị | `CANCELLED` / `PEER_REJECTED` | `NVCS Part-time` (A/B) | Giữ nguyên phân công ca của NV A. |
| `PENDING_PEER` | NV B xác nhận đồng ý nhận ca | `PENDING_QL` *(Chờ QL duyệt)* | `NVCS Part-time` (B) | Đẩy yêu cầu lên màn hình phê duyệt của `QL`. |
| `PENDING_QL` | `QL` từ chối đổi ca | `REJECTED` *(Từ chối)* | `QL` | Nhập lý do; giữ nguyên ca và lịch hẹn `CARE` cho NV A. |
| `PENDING_QL` | `QL` phê duyệt đổi ca | `APPROVED` *(Đã duyệt)* | `QL` | Chuyển quyền sở hữu ca sang NV B; **tự động chuyển toàn bộ lịch hẹn `CARE` trong ca đó sang NV B**. |

<a id="phan-he-3-2"></a>
### 3.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)

Lược đồ dưới đây sử dụng cú pháp chuẩn **T-SQL (SQL Server)** (`INT IDENTITY(1,1)`, `NVARCHAR`, `BIT`, `DATETIME2`), tích hợp cột `version` (Optimistic Locking) cho toàn bộ các bảng nghiệp vụ mà tài khoản `QL` dùng chung có quyền phê duyệt:

```sql
-- 1. Cấu hình lịch làm việc & giờ nghỉ trưa lệch ca theo nhân sự
CREATE TABLE staff_schedule_configs (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NOT NULL UNIQUE REFERENCES users(user_id),
    employment_type NVARCHAR(20) NOT NULL CHECK (employment_type IN ('FULL_TIME', 'PART_TIME')),
    
    -- Cấu hình cho FULL_TIME (BS & NVCS Full-time): Nghỉ trưa 01 giờ lệch nhau
    lunch_start_time TIME NULL, -- VD: '11:30:00' hoặc '12:30:00'
    lunch_end_time TIME NULL,   -- VD: '12:30:00' hoặc '13:30:00'
    
    -- Cấu hình cho PART_TIME (NVCS Part-time): Giới hạn giờ tối đa/tuần
    max_weekly_hours DECIMAL(4, 1) NULL DEFAULT 24.0 CHECK (max_weekly_hours > 0),
    
    updated_by INT NULL REFERENCES users(user_id),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_FullTime_Lunch CHECK (
        employment_type = 'PART_TIME' 
        OR (lunch_start_time IS NOT NULL AND lunch_end_time IS NOT NULL AND DATEDIFF(MINUTE, lunch_start_time, lunch_end_time) = 60)
    )
);

-- 2. Bảng Ngày nghỉ lễ & Đóng cửa toàn phòng khám
CREATE TABLE clinic_holidays (
    holiday_id INT IDENTITY(1,1) PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name NVARCHAR(150) NOT NULL,
    closure_type NVARCHAR(25) NOT NULL CHECK (closure_type IN ('PLANNED_HOLIDAY', 'EMERGENCY_CLOSURE')),
    note NVARCHAR(300) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 3. Khung ca làm việc Part-time do QL mở theo ngày
CREATE TABLE part_time_shifts (
    shift_id INT IDENTITY(1,1) PRIMARY KEY,
    shift_date DATE NOT NULL,
    shift_name NVARCHAR(100) NOT NULL, -- VD: Ca Sáng (4h), Ca Chiều (5h), Ca Xuyên trưa (6h)
    start_time TIME NOT NULL CHECK (start_time >= '08:00:00'),
    end_time TIME NOT NULL CHECK (end_time <= '17:00:00'),
    duration_hours DECIMAL(4, 1) NOT NULL CHECK (duration_hours > 0),
    required_slots INT NOT NULL DEFAULT 1 CHECK (required_slots > 0),
    status NVARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Shift_Time_Order CHECK (end_time > start_time)
);

-- 4. Bảng Đăng ký / Phân công ca Part-time
CREATE TABLE part_time_registrations (
    registration_id INT IDENTITY(1,1) PRIMARY KEY,
    shift_id INT NOT NULL REFERENCES part_time_shifts(shift_id),
    staff_id INT NOT NULL REFERENCES users(user_id), -- NVCS Part-time hiện đang giữ ca
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
    ),
    reject_reason NVARCHAR(300) NULL,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking chống 2 QL cùng duyệt vượt chỉ tiêu
    approved_by INT NULL REFERENCES users(user_id),
    approved_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 5. Bảng Đơn xin nghỉ phép nguyên ngày cho Full-time
CREATE TABLE leave_requests (
    leave_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NOT NULL REFERENCES users(user_id), -- BS hoặc NVCS Full-time
    leave_date DATE NOT NULL,
    
    -- Phân loại nghỉ có kế hoạch (>=24h) vs nghỉ đột xuất trong ngày
    leave_category NVARCHAR(20) NOT NULL CHECK (leave_category IN ('PLANNED', 'EMERGENCY')),
    leave_reason_type NVARCHAR(20) NOT NULL CHECK (leave_reason_type IN ('PERSONAL', 'SICK', 'UNPAID')),
    reason_detail NVARCHAR(500) NOT NULL,
    
    status NVARCHAR(25) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CANCELLED_BY_QL')
    ),
    affected_appointments_count INT NOT NULL DEFAULT 0,
    reject_or_exception_note NVARCHAR(500) NULL,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    created_by INT NOT NULL REFERENCES users(user_id), -- Nhân viên tự tạo hoặc QL tạo hộ khi đột xuất
    processed_by INT NULL REFERENCES users(user_id),
    processed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Filtered Unique Index: Không cho phép 1 nhân viên có 2 đơn nghỉ đang hiệu lực/chờ duyệt cùng 1 ngày
CREATE UNIQUE INDEX UX_Leave_Staff_ActiveDate
ON leave_requests(staff_id, leave_date)
WHERE status IN ('PENDING', 'APPROVED');

-- 6. Bảng Yêu cầu Chuyển / Đổi ca Part-time hai chiều
CREATE TABLE shift_swap_requests (
    swap_id INT IDENTITY(1,1) PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES part_time_registrations(registration_id),
    requester_id INT NOT NULL REFERENCES users(user_id),    -- NVCS Part-time xin chuyển ca
    target_staff_id INT NOT NULL REFERENCES users(user_id), -- NVCS Part-time đồng ý nhận ca
    reason NVARCHAR(300) NULL,
    
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDING_PEER' CHECK (
        status IN ('PENDING_PEER', 'PENDING_QL', 'APPROVED', 'REJECTED', 'PEER_REJECTED', 'CANCELLED')
    ),
    peer_responded_at DATETIME2 NULL,
    ql_reject_reason NVARCHAR(300) NULL,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    approved_by INT NULL REFERENCES users(user_id),
    approved_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Swap_Different_Staff CHECK (requester_id <> target_staff_id)
);
```

<a id="phan-he-3-3"></a>
### 3.3. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ (Module 4)

- **Kiểm tra Quỹ phép giữ chỗ (Pending Quota) trước khi tạo đơn nghỉ:**
  - API `POST /api/leaves` bắt buộc truy vấn tổng số đơn `PENDING` và `APPROVED` trong cùng tháng dương lịch của `leave_date`:
    ```sql
    SELECT COUNT(*) 
    FROM leave_requests
    WHERE staff_id = @staffId
      AND YEAR(leave_date) = YEAR(@leaveDate)
      AND MONTH(leave_date) = MONTH(@leaveDate)
      AND status IN ('PENDING', 'APPROVED');
    ```
    Nếu kết quả $\ge 4$, Back-end trả về mã `400 Bad Request` (*"Bạn đã sử dụng hoặc đang chờ duyệt đủ hạn mức 4 ngày nghỉ trong tháng này"*).
- **Truy vấn Gợi ý Nhân sự Thay thế khi `QL` Duyệt nghỉ:**
  - Khi `QL` mở chi tiết đơn nghỉ của nhân sự `X` vào ngày `D` có lịch hẹn trùng ở khung `[item_start_time, item_end_time]`, API tìm kiếm nhân sự thay thế cùng vai trò (`BS` hoặc `NVCS`) thỏa mãn đồng thời 3 điều kiện:
    1. Không có đơn nghỉ `APPROVED` vào ngày `D` (và ngày `D` không nằm trong `clinic_holidays`).
    2. Có ca làm việc hợp lệ bao trùm `[item_start_time, item_end_time]` (với Full-time: không giao cắt `[lunch_start_time, lunch_end_time]`; với Part-time: có `part_time_registrations.status = 'APPROVED'` bao trùm khung giờ này).
    3. Không có bản ghi nào trong `appointment_items` (thuộc đơn `PENDING`, `CONFIRMED`, `IN_PROGRESS`) giao cắt khung giờ trên.
  - Khi `QL` bấm **"Chuyển giao lịch hẹn & Duyệt nghỉ"**, toàn bộ thao tác cập nhật `appointment_items.assigned_staff_id` và `leave_requests.status = 'APPROVED'` (kèm kiểm tra `version`) phải chạy trong **01 Database Transaction (ACID)**.
- **Giao dịch nguyên tử khi Duyệt Đổi ca Part-time:**
  - Khi `QL` phê duyệt `shift_swap_requests`, Back-end thực hiện trong **01 Transaction**:
    1. Re-validate nhân viên nhận ca (`target_staff_id`) vẫn không bị trùng ca và không vượt `max_weekly_hours` tại thời điểm duyệt.
    2. Cập nhật `part_time_registrations.staff_id = @targetStaffId` cho ca làm việc đó.
    3. Tự động chuyển giao toàn bộ lịch hẹn dịch vụ `CARE` gắn với ca:
       ```sql
       UPDATE ai
       SET ai.assigned_staff_id = @targetStaffId
       FROM appointment_items ai
       INNER JOIN appointments a ON ai.appointment_id = a.appointment_id
       WHERE ai.assigned_staff_id = @requesterId
         AND a.scheduled_date = @shiftDate
         AND ai.item_start_time >= @shiftStartTime
         AND ai.item_end_time <= @shiftEndTime
         AND a.status IN ('PENDING', 'CONFIRMED');
       ```
    4. Cập nhật `shift_swap_requests.status = 'APPROVED'` với `version = version + 1` (trả về `409 Conflict` nếu phiên `QL` khác đã xử lý trước đó).

---

<a id="phan-he-4"></a>
## Phân hệ 4: Đặt lịch dịch vụ và Thanh toán (`Bookings & Payments`) `[P0]`

<a id="phan-he-4-1"></a>
### 4.1. Sơ đồ chuyển đổi trạng thái Lịch hẹn (State Machine)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Tài chính (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | Đặt lịch Online / Walk-in | `PENDING` hoặc `CONFIRMED` | `KH`, `QL` | Khóa slot nhân sự; nếu trả trước thành công $\rightarrow$ chuyển thẳng `CONFIRMED` & ghi nhận `prepaid_amount`. |
| `PENDING` | Xác nhận lịch hẹn | `CONFIRMED` | `BS`, `NVCS`, `QL` | Xác nhận giữ lịch chính thức. |
| `PENDING` / `CONFIRMED` | Khách đổi lịch ($\Delta t \ge 4\text{h}$, lần $1$) | `CONFIRMED` | `KH`, `QL` | Cập nhật khung giờ mới, giải phóng slot cũ, tăng `reschedule_count = 1`, bảo lưu `prepaid_amount`. |
| `PENDING` / `CONFIRMED` | Khách / QL hủy lịch | `CANCELLED` | `KH`, `QL` | Giải phóng slot; nếu có `prepaid_amount`, tính tỷ lệ hoàn ($100\%$ / $50\%$ / $0\%$) và cộng vào `Ví Animora`. |
| `CONFIRMED` | Quá giờ hẹn $> 15$ phút | `NO_SHOW` | `QL`, System | Giải phóng slot; nếu `Trả sau`, ghi nhận $1$ điểm vi phạm để xét khóa quyền `Trả sau` trong $30$ ngày. |
| `CONFIRMED` | Check-in bắt đầu làm | `IN_PROGRESS` | `BS`, `NVCS`, `QL` | Khóa chức năng hủy/đổi lịch; mở quyền thêm chi phí phát sinh (`appointment_addons`). |
| `IN_PROGRESS` | Ghi nhận phát sinh / thuốc | `IN_PROGRESS` | `BS`, `NVCS` | Cộng dồn vào `addon_total_amount`; nếu dùng thuốc tại chỗ, trừ tồn kệ `Hộp thuốc cá nhân` của `BS`. |
| `IN_PROGRESS` | Tất toán & Hoàn thành | `COMPLETED` | `BS`, `NVCS`, `QL` | Xác nhận thu đủ phần tiền còn thiếu; mở quyền `KH` đánh giá dịch vụ & xem Sổ sức khỏe. |

---

<a id="phan-he-4-2"></a>
### 4.2. Thiết kế Cơ sở dữ liệu (Database Schema)

Cấu trúc 8 bảng dữ liệu chuẩn hóa phục vụ phân hệ Đặt lịch và Thanh toán, tích hợp cột `version` để kiểm soát xung đột đồng thời (Optimistic Locking) cho tài khoản `QL` dùng chung:

> **Lưu ý cú pháp DB thực tế:** DDL bên dưới minh họa theo cú pháp chuẩn PostgreSQL (`SERIAL`, `BOOLEAN`, `INTERVAL '30 days'`). Khi triển khai migration cho **SQL Server (`AnimoraDB`)**, cần chuyển đổi tương ứng sang `INT IDENTITY(1,1)`, `BIT`, `DATETIME2` và `DATEADD(DAY, -30, ...)`.

```sql
-- 1. Danh mục dịch vụ gốc
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('MEDICAL', 'CARE')),
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    base_duration_minutes INT NOT NULL CHECK (base_duration_minutes > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng giá & thời lượng biến thiên theo cân nặng cho dịch vụ CARE
CREATE TABLE service_pricing_tiers (
    tier_id SERIAL PRIMARY KEY,
    service_id INT NOT NULL REFERENCES services(service_id),
    min_weight_kg DECIMAL(5, 2) NOT NULL, -- VD: 0.00, 5.00, 15.00, 30.00
    max_weight_kg DECIMAL(5, 2) NOT NULL, -- VD: 4.99, 14.99, 29.99, 999.99
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    CONSTRAINT uq_service_weight_tier UNIQUE (service_id, min_weight_kg, max_weight_kg)
);

-- 3. Ví nội bộ Animora của Khách hàng
CREATE TABLE user_wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id),
    balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lịch sử giao dịch Ví nội bộ
CREATE TABLE wallet_transactions (
    transaction_id SERIAL PRIMARY KEY,
    wallet_id INT NOT NULL REFERENCES user_wallets(wallet_id),
    amount DECIMAL(14, 2) NOT NULL, -- Dương (+) khi hoàn tiền/nạp, Âm (-) khi thanh toán
    transaction_type VARCHAR(30) NOT NULL CHECK (
        transaction_type IN ('REFUND_CANCEL_BOOKING', 'PAY_BOOKING', 'PAY_SHOP_ORDER', 'REFUND_SHOP_RETURN', 'TOPUP')
    ),
    reference_id INT, -- ID của appointment hoặc shop_order
    balance_before DECIMAL(14, 2) NOT NULL,
    balance_after DECIMAL(14, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Lịch hẹn chính (Combo, Đổi lịch, Walk-in, Optimistic Locking)
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    appointment_code VARCHAR(20) NOT NULL UNIQUE, -- VD: APT-20261117-001
    customer_id INT NOT NULL REFERENCES users(user_id),
    pet_id INT NOT NULL REFERENCES pets(pet_id), -- 1 Lịch hẹn = 1 Thú cưng
    booking_source VARCHAR(15) NOT NULL DEFAULT 'ONLINE' CHECK (booking_source IN ('ONLINE', 'WALK_IN')),
    
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL, -- Đã bao gồm tổng thời lượng các dịch vụ + buffer time
    
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('PREPAID', 'POSTPAID')),
    initial_total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    addon_total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    final_total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    prepaid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    ),
    reschedule_count INT NOT NULL DEFAULT 0 CHECK (reschedule_count <= 1),
    cancel_reason TEXT,
    cancelled_at TIMESTAMP,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking chống ghi đè khi QL dùng chung tài khoản
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chi tiết từng dịch vụ trong Combo & Phân công nhân sự
CREATE TABLE appointment_items (
    item_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(service_id),
    assigned_staff_id INT NOT NULL REFERENCES users(user_id), -- ID của BS hoặc NVCS
    assignment_mode VARCHAR(15) NOT NULL CHECK (assignment_mode IN ('MANUAL', 'AUTO_ASSIGN')),
    
    item_start_time TIME NOT NULL,
    item_end_time TIME NOT NULL,
    applied_price DECIMAL(12, 2) NOT NULL CHECK (applied_price >= 0),
    applied_duration_minutes INT NOT NULL,
    item_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        item_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')
    )
);

-- 7. Chi phí phát sinh & Thuốc dùng trực tiếp tại chỗ
CREATE TABLE appointment_addons (
    addon_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    addon_type VARCHAR(20) NOT NULL CHECK (addon_type IN ('EXTRA_SERVICE', 'DIRECT_MEDICINE')),
    
    service_id INT REFERENCES services(service_id), -- Có giá trị nếu là EXTRA_SERVICE
    product_id INT REFERENCES products(product_id), -- Có giá trị nếu là DIRECT_MEDICINE
    doctor_id INT REFERENCES users(user_id), -- BS sử dụng thuốc -> Trừ vào Hộp thuốc cá nhân
    
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Lịch sử thanh toán & hoàn tiền của Lịch hẹn
CREATE TABLE appointment_payments (
    payment_id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL REFERENCES appointments(appointment_id),
    payment_phase VARCHAR(20) NOT NULL CHECK (payment_phase IN ('PREPAID', 'FINAL_SETTLEMENT', 'REFUND')),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('ANIMORA_WALLET', 'VNPAY', 'MOMO', 'CASH', 'BANK_TRANSFER')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    transaction_ref VARCHAR(100), -- Mã giao dịch cổng thanh toán hoặc mã wallet_transactions
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    processed_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

<a id="phan-he-4-3"></a>
### 4.3. Lưu ý kỹ thuật khi triển khai API (FE/BE)

- **Kiểm tra điều kiện khóa `Trả sau` tại tầng Back-end:** Không chỉ ẩn nút trên Front-end, API `POST /api/appointments` bắt buộc chạy truy vấn kiểm tra trước khi tạo lịch `POSTPAID`:
  ```sql
  SELECT COUNT(*) FROM appointments
  WHERE customer_id = :customerId
    AND payment_method = 'POSTPAID'
    AND status = 'NO_SHOW'
    AND scheduled_date >= CURRENT_DATE - INTERVAL '30 days';
  ```
  Nếu kết quả $\ge 2$, Back-end trả về mã lỗi `403 Forbidden` kèm thông báo lý do tạm khóa hình thức trả sau.
- **Giao dịch nguyên tử (ACID) khi Hủy lịch hoàn tiền & Tất toán thuốc:**
  - Khi `KH` hủy lịch `PREPAID`, cập nhật `appointments.status = 'CANCELLED'`, cộng tiền vào `user_wallets.balance` và ghi `wallet_transactions` phải nằm trong **cùng 01 Database Transaction** để tránh lỗi mất tiền hoặc hoàn tiền hai lần (kết hợp kiểm tra trạng thái trước khi cập nhật để đảm bảo tính Idempotency).
  - Khi `BS` thêm `DIRECT_MEDICINE` vào `appointment_addons`, hệ thống phải kiểm tra tồn kệ của `BS` đó (`quantity >= requested_qty`) và trừ trực tiếp vào Hộp thuốc cá nhân của `BS` trong cùng một transaction.
- **Kiểm soát xung đột cho tài khoản `QL` dùng chung:** Khi `QL` xác nhận khách Walk-in, chuyển trạng thái `NO_SHOW` hoặc tất toán hóa đơn tại quầy, API `PUT/PATCH` phải gửi kèm `version` hiện tại của bản ghi `appointments`:
  ```sql
  UPDATE appointments
  SET status = :newStatus, version = version + 1, updated_at = CURRENT_TIMESTAMP
  WHERE appointment_id = :id AND version = :currentVersion;
  ```
  Nếu số dòng cập nhật bằng $0$, hệ thống báo lỗi xung đột (`409 Conflict`) để `QL` tải lại dữ liệu mới nhất, ngăn ngừa việc hai phiên đăng nhập cùng lúc ghi đè trạng thái của nhau.

---

<a id="phan-he-5"></a>
## Phân hệ 5: Cửa hàng, Giỏ hàng, Voucher & Đổi trả (`Shop, Vouchers & Returns`) `[P1]`

<a id="phan-he-5-1"></a>
### 5.1. Sơ đồ Chuyển đổi Trạng thái (State Machine)

#### Vòng đời Đơn hàng Shop (`Shop_Order`)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Tài chính (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | Đặt hàng Online (`VNPAY`/`MOMO`) | `PENDING_PAYMENT` | `KH` | Khóa giữ chỗ `reserved_quantity` trong $15$ phút; khóa Voucher. |
| *(Khởi tạo)* | Đặt hàng `COD` hoặc `ANIMORA_WALLET` | `PENDING_CONFIRMATION` | `KH` | `COD`: giữ chỗ `reserved_quantity`; `WALLET`: trừ ví & trừ `total_stock_quantity` ngay. |
| `PENDING_PAYMENT` | Cổng thanh toán báo thành công | `PENDING_CONFIRMATION` | System / Webhook | Trừ `total_stock_quantity` & giải phóng `reserved_quantity`. |
| `PENDING_PAYMENT` | Quá $15$ phút chưa thanh toán | `CANCELLED` | System (Cron) | Giải phóng `reserved_quantity`; hoàn lại lượt dùng Voucher. |
| `PENDING_CONFIRMATION` | `KH` hoặc `QL` hủy đơn | `CANCELLED` | `KH`, `QL` | Nhả giữ chỗ hoặc cộng hoàn `total_stock_quantity`; hoàn tiền về `Ví Animora` (nếu đã trả trước) & hoàn Voucher. |
| `PENDING_CONFIRMATION` | `QL` xác nhận & đóng gói hàng | `PREPARING` | `QL` | Nếu là đơn `COD`, trừ chính thức `total_stock_quantity` & giải phóng `reserved_quantity`. |
| `PREPARING` | Bàn giao vận chuyển / Sẵn sàng tại quầy | `SHIPPING` / `READY_FOR_PICKUP` | `QL` | Cập nhật mã vận đơn (nếu `DELIVERY`) hoặc thông báo mời khách đến quầy nhận (`CLICK_AND_COLLECT`). |
| `SHIPPING` / `READY_FOR_PICKUP` | Giao thành công / Khách nhận tại quầy | `DELIVERED` | `QL`, System | Ghi nhận `delivered_at` và mở đếm ngược **07 ngày** quyền đổi trả (`return_deadline_at`). |
| `DELIVERED` | Hết $07$ ngày không có khiếu nại mở | `COMPLETED` | System (Cron) | Chốt doanh thu, khóa quyền tạo yêu cầu đổi trả và mở quyền `KH` đánh giá sản phẩm. |

#### Vòng đời Yêu cầu Đổi / Trả hàng (`Return_Request`)

| Trạng thái hiện tại | Hành động / Sự kiện | Trạng thái kế tiếp | Vai trò thực hiện | Tác động dữ liệu & Kho/Tài chính (Side Effects) |
| :--- | :--- | :--- | :--- | :--- |
| *(Khởi tạo)* | `KH` gửi yêu cầu trong $\le 07$ ngày | `PENDING` *(Chờ QL duyệt)* | `KH` | Đính kèm ảnh/video minh chứng; tạm hoãn tự động chốt `COMPLETED` của đơn hàng gốc. |
| `PENDING` | `QL` từ chối yêu cầu (không đủ điều kiện) | `REJECTED` *(Từ chối)* | `QL` | Bắt buộc nhập lý do từ chối; nếu đã quá $07$ ngày thì đơn hàng gốc chuyển sang `COMPLETED`. |
| `PENDING` | `QL` chấp thuận yêu cầu đổi/trả | `APPROVED_AWAITING_RETURN` | `QL` | Hướng dẫn `KH` gửi trả hàng lỗi/sai về phòng khám Animora. |
| `APPROVED_AWAITING_RETURN` | `QL` nhận lại hàng & hoàn tất (`REFUND`) | `COMPLETED` *(Hoàn tất)* | `QL` | Cộng tiền hoàn vào **Ví Animora**; cộng kho bán lẻ (nếu `WRONG_ITEM`) hoặc kho lỗi (nếu `DEFECTIVE`). |
| `APPROVED_AWAITING_RETURN` | `QL` nhận lại hàng & hoàn tất (`EXCHANGE`) | `COMPLETED` *(Hoàn tất)* | `QL` | Phân loại kho hàng hoàn như trên; **tự động tạo Đơn đổi mới $0\text{đ}$** xuất từ `Tồn kho chung`. |

---

<a id="phan-he-5-2"></a>
### 5.2. Thiết kế Cơ sở dữ liệu chuẩn SQL Server (`AnimoraDB`)

Lược đồ dưới đây sử dụng cú pháp chuẩn **T-SQL (SQL Server)** (`INT IDENTITY(1,1)`, `NVARCHAR`, `BIT`, `DATETIME2`), tích hợp cột `version` (Optimistic Locking) cho các bảng nghiệp vụ được tài khoản `QL` dùng chung thao tác:

```sql
-- 1. Danh mục Sản phẩm Shop
CREATE TABLE product_categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(150) NOT NULL UNIQUE,
    description NVARCHAR(300) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 2. Bảng Sản phẩm gốc (Phân tách RETAIL và PRESCRIPTION_DRUG)
CREATE TABLE products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    product_code NVARCHAR(30) NOT NULL UNIQUE, -- VD: PRD-0001
    category_id INT NOT NULL REFERENCES product_categories(category_id),
    product_name NVARCHAR(200) NOT NULL,
    product_type NVARCHAR(25) NOT NULL DEFAULT 'RETAIL' CHECK (
        product_type IN ('RETAIL', 'PRESCRIPTION_DRUG')
    ),
    brand NVARCHAR(100) NULL,
    description NVARCHAR(MAX) NULL,
    thumbnail_url NVARCHAR(500) NULL,
    is_active BIT NOT NULL DEFAULT 1, -- Ngừng kinh doanh (ẩn) thay vì xóa vật lý
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 3. Bảng Biến thể Sản phẩm / SKU & Tồn kho chung (Optimistic Locking)
CREATE TABLE product_variants (
    variant_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id),
    sku_code NVARCHAR(50) NOT NULL UNIQUE, -- VD: PRD-0001-5KG
    variant_name NVARCHAR(150) NOT NULL,   -- VD: Túi 5kg, Hộp 10 viên
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    
    -- Quản lý Tồn kho chung (Độc lập hoàn toàn với Hộp thuốc cá nhân BS)
    total_stock_quantity INT NOT NULL DEFAULT 0 CHECK (total_stock_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    damaged_quantity INT NOT NULL DEFAULT 0 CHECK (damaged_quantity >= 0), -- Kho hàng lỗi hoàn về
    
    -- Quản lý Hạn sử dụng
    nearest_expiry_date DATE NULL,
    is_available BIT NOT NULL DEFAULT 1,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking chống bán âm kho & ghi đè tồn kho
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Stock_Reserved CHECK (total_stock_quantity >= reserved_quantity)
);

-- 4. Giỏ hàng của Khách hàng (Hỗ trợ liên kết dòng đơn thuốc cho thuốc Rx)
CREATE TABLE cart_items (
    cart_item_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    variant_id INT NOT NULL REFERENCES product_variants(variant_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    
    -- Bắt buộc có giá trị nếu sản phẩm thuộc loại PRESCRIPTION_DRUG
    prescription_item_id INT NULL, -- Tham chiếu đến dòng thuốc trong đơn thuốc của BS
    added_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 5. Bảng Khuyến mãi / Voucher (Optimistic Locking)
CREATE TABLE vouchers (
    voucher_id INT IDENTITY(1,1) PRIMARY KEY,
    voucher_code NVARCHAR(30) NOT NULL UNIQUE,
    voucher_name NVARCHAR(150) NOT NULL,
    discount_type NVARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(12, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount DECIMAL(12, 2) NULL CHECK (max_discount_amount > 0), -- Trần giảm cho PERCENTAGE
    min_order_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (min_order_value >= 0),
    
    -- Phạm vi áp dụng & loại trừ thuốc kê đơn
    applicable_category_id INT NULL REFERENCES product_categories(category_id),
    exclude_prescription_drugs BIT NOT NULL DEFAULT 1,
    is_public BIT NOT NULL DEFAULT 1, -- 1: Công khai lưu vào ví; 0: Cấp riêng tư
    
    usage_limit INT NOT NULL CHECK (usage_limit > 0),
    used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    per_user_limit INT NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
    
    start_at DATETIME2 NOT NULL,
    end_at DATETIME2 NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    created_by INT NOT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_Voucher_Dates CHECK (end_at > start_at),
    CONSTRAINT CK_Voucher_Usage CHECK (used_count <= usage_limit)
);

-- 6. Kho Voucher của Khách hàng
CREATE TABLE user_vouchers (
    user_voucher_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    voucher_id INT NOT NULL REFERENCES vouchers(voucher_id),
    status NVARCHAR(20) NOT NULL DEFAULT 'UNUSED' CHECK (status IN ('UNUSED', 'USED', 'EXPIRED')),
    used_order_id INT NULL,
    saved_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    used_at DATETIME2 NULL
);

-- 7. Bảng Đơn hàng Shop chính (Optimistic Locking)
CREATE TABLE shop_orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    order_code NVARCHAR(25) NOT NULL UNIQUE, -- VD: ORD-20261117-0001
    customer_id INT NOT NULL REFERENCES users(user_id),
    
    -- Giao nhận: Giao tận nơi vs Nhận tại quầy
    shipping_method NVARCHAR(25) NOT NULL CHECK (shipping_method IN ('DELIVERY', 'CLICK_AND_COLLECT')),
    recipient_name NVARCHAR(150) NOT NULL,
    recipient_phone NVARCHAR(20) NOT NULL,
    shipping_address NVARCHAR(500) NULL, -- NULL nếu chọn CLICK_AND_COLLECT
    tracking_code NVARCHAR(100) NULL,
    
    -- Tài chính & Voucher
    subtotal_amount DECIMAL(12, 2) NOT NULL CHECK (subtotal_amount >= 0),
    voucher_id INT NULL REFERENCES vouchers(voucher_id),
    user_voucher_id INT NULL REFERENCES user_vouchers(user_voucher_id),
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_fee >= 0),
    final_total_amount DECIMAL(12, 2) NOT NULL CHECK (final_total_amount >= 0),
    
    -- Thanh toán đơn kênh
    payment_method NVARCHAR(20) NOT NULL CHECK (
        payment_method IN ('COD', 'VNPAY', 'MOMO', 'ANIMORA_WALLET')
    ),
    payment_status NVARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (
        payment_status IN ('UNPAID', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED')
    ),
    payment_transaction_ref NVARCHAR(100) NULL,
    payment_expires_at DATETIME2 NULL, -- Mốc hết hạn giữ chỗ 15p cho đơn Online
    
    -- Đánh dấu đơn đổi hàng 0đ sinh ra từ quy trình đổi trả
    is_exchange_order BIT NOT NULL DEFAULT 0,
    parent_return_id INT NULL,
    
    -- Vòng đời trạng thái & Mốc hậu kiểm 7 ngày
    status NVARCHAR(25) NOT NULL DEFAULT 'PENDING_CONFIRMATION' CHECK (
        status IN (
            'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'PREPARING',
            'SHIPPING', 'READY_FOR_PICKUP', 'DELIVERED', 'COMPLETED', 'CANCELLED'
        )
    ),
    cancel_reason NVARCHAR(300) NULL,
    delivered_at DATETIME2 NULL,
    return_deadline_at DATETIME2 NULL, -- delivered_at + 7 ngày
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking cho tài khoản QL dùng chung
    processed_by INT NULL REFERENCES users(user_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 8. Chi tiết Dòng sản phẩm trong Đơn hàng (Lưu phân bổ chiết khấu để hoàn tiền thực trả)
CREATE TABLE shop_order_items (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL REFERENCES shop_orders(order_id) ON DELETE CASCADE,
    variant_id INT NOT NULL REFERENCES product_variants(variant_id),
    prescription_item_id INT NULL, -- Tham chiếu đơn thuốc nếu là thuốc Rx
    
    product_name_snapshot NVARCHAR(200) NOT NULL,
    variant_name_snapshot NVARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    original_subtotal DECIMAL(12, 2) NOT NULL CHECK (original_subtotal >= 0),
    
    -- Phân bổ giảm giá Voucher & Số tiền thực trả để tính hoàn tiền chính xác
    voucher_discount_allocated DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (voucher_discount_allocated >= 0),
    net_paid_amount DECIMAL(12, 2) NOT NULL CHECK (net_paid_amount >= 0)
);

-- 9. Bảng Yêu cầu Đổi / Trả hàng trong vòng 07 ngày
CREATE TABLE return_requests (
    return_id INT IDENTITY(1,1) PRIMARY KEY,
    return_code NVARCHAR(25) NOT NULL UNIQUE, -- VD: RTN-20261117-0001
    order_id INT NOT NULL REFERENCES shop_orders(order_id),
    customer_id INT NOT NULL REFERENCES users(user_id),
    
    reason_type NVARCHAR(20) NOT NULL CHECK (reason_type IN ('DEFECTIVE', 'WRONG_ITEM')),
    resolution_type NVARCHAR(20) NOT NULL CHECK (resolution_type IN ('EXCHANGE', 'REFUND')),
    reason_detail NVARCHAR(500) NOT NULL,
    evidence_urls NVARCHAR(MAX) NOT NULL, -- Danh sách URL ảnh/video minh chứng (JSON array)
    
    total_refund_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_refund_amount >= 0),
    exchange_order_id INT NULL REFERENCES shop_orders(order_id), -- Đơn đổi 0đ nếu resolution_type = EXCHANGE
    
    status NVARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED_AWAITING_RETURN', 'COMPLETED', 'REJECTED')
    ),
    reject_reason NVARCHAR(300) NULL,
    
    version INT NOT NULL DEFAULT 1, -- Optimistic Locking
    processed_by INT NULL REFERENCES users(user_id),
    processed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- 10. Chi tiết Sản phẩm Đổi / Trả
CREATE TABLE return_request_items (
    return_item_id INT IDENTITY(1,1) PRIMARY KEY,
    return_id INT NOT NULL REFERENCES return_requests(return_id) ON DELETE CASCADE,
    order_item_id INT NOT NULL REFERENCES shop_order_items(order_item_id),
    return_quantity INT NOT NULL CHECK (return_quantity > 0),
    calculated_refund_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (calculated_refund_amount >= 0)
);

-- 11. Đánh giá Sản phẩm sau khi Đơn hàng Hoàn tất
CREATE TABLE product_reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    order_item_id INT NOT NULL UNIQUE REFERENCES shop_order_items(order_item_id), -- Mỗi lần mua đánh giá 1 lần
    product_id INT NOT NULL REFERENCES products(product_id),
    customer_id INT NOT NULL REFERENCES users(user_id),
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
```

---

<a id="phan-he-5-3"></a>
### 5.3. Lưu ý Kỹ thuật Triển khai API & Tích hợp Liên phân hệ

- **Giao dịch nguyên tử (ACID) khi Đặt hàng & Áp dụng Voucher:**
  - Tại API `POST /api/shop/orders`, toàn bộ chuỗi thao tác sau phải nằm trong **01 Database Transaction**:
    1. Kiểm tra `is_available = 1` và `nearest_expiry_date > CAST(GETDATE() AS DATE)` (nếu có hạn sử dụng) của từng `variant_id`.
    2. Nếu có sản phẩm `PRESCRIPTION_DRUG`, kiểm tra đơn thuốc còn hạn (`valid_until`) và `purchased_quantity + requested_qty <= prescribed_quantity`, sau đó cộng dồn `purchased_quantity`.
    3. Kiểm tra tồn kho khả dụng (`total_stock_quantity - reserved_quantity >= requested_qty`) và cập nhật bằng **Optimistic Locking** (`WHERE variant_id = @id AND version = @v`).
    4. Nếu có `user_voucher_id`, kiểm tra trạng thái `UNUSED`, thời hạn Voucher và tính phân bổ `voucher_discount_allocated` chỉ trên nhóm `RETAIL`, sau đó cập nhật `user_vouchers.status = 'USED'` và tăng `vouchers.used_count`.
    5. Nếu `payment_method = 'ANIMORA_WALLET'`, kiểm tra số dư ví, trừ `user_wallets.balance` và ghi `wallet_transactions` (`transaction_type = 'PAY_SHOP_ORDER'`).
- **Background Job Giải phóng Giữ chỗ 15 phút & Tự động Chốt đơn 07 ngày:**
  - **Job 1 (Chạy mỗi 1 phút):** Quét các đơn `status = 'PENDING_PAYMENT'` có `payment_expires_at < SYSDATETIME()`, chuyển sang `CANCELLED`, trừ `reserved_quantity` trên `product_variants` và hoàn lại `user_vouchers.status = 'UNUSED'`.
  - **Job 2 (Chạy mỗi 1 giờ):** Quét các đơn `status = 'DELIVERED'` có `return_deadline_at < SYSDATETIME()` và không có bản ghi `return_requests` nào đang ở trạng thái `PENDING` hoặc `APPROVED_AWAITING_RETURN`, tự động chuyển đơn sang `COMPLETED`.
- **Xử lý Hoàn tất Đổi / Trả hàng:**
  - Khi `QL` gọi API `PATCH /api/shop/returns/{id}/complete`, Back-end thực thi trong **01 Transaction**:
    - Nếu `reason_type = 'WRONG_ITEM'`: Cộng `return_quantity` trở lại `product_variants.total_stock_quantity`.
    - Nếu `reason_type = 'DEFECTIVE'`: Cộng `return_quantity` vào `product_variants.damaged_quantity` (tuyệt đối không cộng vào kho bán lẻ).
    - Nếu `resolution_type = 'REFUND'`: Cộng `total_refund_amount` vào `user_wallets.balance` của `KH` và ghi `wallet_transactions` (`transaction_type = 'REFUND_SHOP_RETURN'`).
    - Nếu `resolution_type = 'EXCHANGE'`: Khởi tạo đơn hàng mới (`is_exchange_order = 1`, `final_total_amount = 0`, `payment_status = 'PAID'`) và trừ trực tiếp `total_stock_quantity` cho sản phẩm xuất bù.
