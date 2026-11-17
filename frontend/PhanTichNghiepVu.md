# ANIMORA – TÀI LIỆU CHI TIẾT NGHIỆP VỤ THEO ROLE

*Bản cập nhật theo các quyết định nghiệp vụ đã thống nhất*
- **Phiên bản:** 1.2
- **Ngày cập nhật:** 16/11/2026
- **Phạm vi:** Nghiệp vụ toàn hệ thống Animora

---

## Lịch sử và phạm vi tài liệu

Tài liệu mô tả nghiệp vụ của 7 role trong hệ thống Animora và các quy tắc vận hành đã được thống nhất. Nội dung được cập nhật từ tài liệu chi tiết nghiệp vụ theo role, tài liệu Use Case/User Story Scrum v2.0 và các quyết định bổ sung trong quá trình phân tích.

**Mục tiêu:** làm tài liệu tham chiếu chung cho BA, UI/UX, Front-end, Back-end, kiểm thử và nhóm phát triển. Những nội dung được ghi là quy tắc đã chốt phải được ưu tiên hơn mô tả cũ nếu có mâu thuẫn.

| Thông tin | Mô tả |
| --- | --- |
| **Tên hệ thống** | Animora – nền tảng chăm sóc và nhận nuôi thú cưng |
| **Số lượng role** | 7 role: `KH`, `BS`, `NVCS`, `QL`, `AD`, `SUP`, `TCH` |
| **Phiên bản tài liệu** | 1.2 – cập nhật 16/11/2026 |
| **Phạm vi nổi bật** | Phân quyền theo role, lịch làm việc, đặt lịch và thanh toán, Shop, nhập kho, Hộp thuốc bác sĩ, nhận nuôi, quản trị hệ thống |

---

## 1. Tổng quan role và phạm vi trách nhiệm

| Role | Mã | Trách nhiệm chính |
| --- | --- | --- |
| **Khách hàng** | `KH` | Đặt lịch dịch vụ, thanh toán, quản lý nhu cầu mua sắm, nhận nuôi, quản lý (CRUD) hồ sơ thú cưng và chỉ xem sổ sức khỏe, lịch sử khám, đơn thuốc. |
| **Bác sĩ thú y** | `BS` | Khám, chẩn đoán, cập nhật sổ sức khỏe, kê đơn và quản lý Hộp thuốc cá nhân. |
| **Nhân viên chăm sóc thú cưng** | `NVCS` | Thực hiện dịch vụ chăm sóc, cập nhật tiến độ, quản lý (CRUD) hồ sơ thú cưng và lịch làm việc theo loại nhân sự. |
| **Quản lý nghiệp vụ** | `QL` | Điều phối vận hành, quản lý nhân sự, lịch hẹn, dịch vụ, Shop, nhập hàng, tồn kho, yêu cầu thuốc và nhận nuôi. |
| **Admin** | `AD` | Quản trị tài khoản, phân quyền và cấu hình; dữ liệu vận hành chỉ xem, trừ can thiệp khẩn cấp được ghi log. |
| **Nhà cung cấp** | `SUP` | Tiếp nhận đơn nhập hàng, xác nhận/điều chỉnh số lượng và giao hàng cho Animora. |
| **Trạm cứu hộ** | `TCH` | Đăng thú cưng cần nhận nuôi và xử lý yêu cầu nhận nuôi. |

---

## 2. Khách hàng (`KH`)

### 2.1. Nghiệp vụ chính

- Đăng ký, đăng nhập, đăng xuất, quên mật khẩu và cập nhật thông tin cá nhân.
- Tạo, xem, cập nhật và xóa (CRUD) hồ sơ thông tin thú cưng của mình; chỉ xem đối với Sổ sức khỏe & Lịch sử khám, Đơn thuốc của Bác sĩ và lịch sử mua lại từ Shop.
- Theo dõi lịch sử khám, chẩn đoán, đơn thuốc, tiêm phòng và các thông tin sức khỏe được chia sẻ.
- Tìm bác sĩ theo thông tin chuyên môn, đánh giá và khung giờ phù hợp; đặt lịch dịch vụ.
- Chủ động chọn hình thức thanh toán dịch vụ: trả trước hoặc trả sau, theo các lựa chọn hệ thống hỗ trợ.
- Hủy hoặc đổi lịch hẹn; theo dõi trạng thái lịch hẹn và thanh toán.
- Đánh giá bác sĩ/dịch vụ sau khi dịch vụ hoàn thành.
- Sử dụng AI Chat để hỏi đáp thông tin chăm sóc thú cưng.
- Xem danh sách thú cưng từ Trạm cứu hộ, gửi yêu cầu nhận nuôi và theo dõi kết quả.
- Mua sản phẩm tại Shop, quản lý giỏ hàng, đặt hàng, theo dõi đơn và gửi yêu cầu đổi trả/hoàn tiền khi đủ điều kiện.
- Mua lại thuốc theo đơn trong phạm vi và hướng dẫn tái cấp thuốc do bác sĩ điều trị quy định.

### 2.2. Quy tắc nghiệp vụ

- KH có quyền CRUD thông tin hồ sơ thú cưng của mình; riêng Sổ sức khỏe & Lịch sử khám, Đơn thuốc của Bác sĩ & Mua lại từ Shop là Chỉ xem.
- Hủy lịch hẹn không giới hạn thời gian và không thu phí. Nếu lịch đã thanh toán trước, hệ thống hoàn lại 100% khoản đã thanh toán.
- Đổi/dời lịch không giới hạn thời gian và không thu phí. Khoản thanh toán trước được bảo lưu và chuyển sang lịch hẹn mới.
- Hình thức trả trước/trả sau do KH lựa chọn tại thời điểm đặt lịch.
- AI Chat chỉ dành cho KH.
- Đơn thuốc được mua lại theo hướng dẫn của bác sĩ điều trị; không áp dụng một số lượt tái cấp cố định chung cho mọi đơn.
- Trường hợp bệnh nặng cần tái khám và có chỉ định/đơn thuốc mới theo quyết định chuyên môn của bác sĩ.
- Yêu cầu đổi trả sản phẩm chỉ được gửi trong vòng 7 ngày kể từ khi giao hàng thành công và chỉ áp dụng với hàng lỗi hoặc giao sai.

---

## 3. Bác sĩ thú y (`BS`)

### 3.1. Nghiệp vụ khám và điều trị

- Quản lý thông tin hồ sơ bác sĩ, chuyên môn, bằng cấp/chứng chỉ theo quyền được cấp.
- Xem và tiếp nhận lịch hẹn; xác nhận, thực hiện và hoàn thành dịch vụ theo quy trình.
- Xem hồ sơ thú cưng; cập nhật thông tin hồ sơ khi cần thiết và ghi nhận kết quả khám vào sổ sức khỏe.
- Thực hiện chẩn đoán và kê đơn thuốc. Chỉ bác sĩ có quyền chuyên môn mới được kê đơn.
- Thuốc kê đơn phải được chọn từ danh mục thuốc/sản phẩm hợp lệ của Shop.
- Theo dõi đánh giá từ khách hàng.
- Sử dụng chức năng Hộp thuốc cá nhân để xem số lượng thuốc được phân bổ, theo dõi thuốc đã sử dụng và gửi yêu cầu đến QL.

### 3.2. Lịch làm việc và nghỉ phép

- Bác sĩ là nhân sự full-time.
- Lịch làm việc tiêu chuẩn: Thứ Hai đến Thứ Bảy, từ 08:00 đến 17:00; nghỉ trưa 01 giờ; tổng thời gian làm việc 08 giờ/ngày.
- Hệ thống vận hành trong khung giờ 08:00–17:00; không tổ chức ca đêm.
- Bác sĩ chỉ được gửi yêu cầu nghỉ nguyên ngày; không có nghỉ nửa ngày hoặc nghỉ theo buổi.
- Bác sĩ không có chức năng đổi ca và không có chức năng đăng ký tăng ca.
- Mỗi tháng được đăng ký nghỉ tối đa 4 ngày; hạn mức được làm mới vào đầu tháng. Nghỉ ốm và nghỉ không lương vẫn tính vào hạn mức.
- Không cho phép gửi yêu cầu nghỉ cho tuần đã qua trong tháng; chỉ gửi yêu cầu cho tuần hiện tại hoặc các tuần tương lai.
- Yêu cầu nghỉ đã được duyệt không thể tự hủy trên hệ thống; trường hợp ngoại lệ do QL xử lý theo quy trình vận hành.

### 3.3. Chức năng Hộp thuốc bác sĩ

**Mục tiêu:** mỗi bác sĩ có một Hộp thuốc riêng để theo dõi số lượng thuốc được phân bổ cho cá nhân. Hệ thống đồng thời quản lý tồn kho chung và số lượng thuốc trên kệ của từng bác sĩ.

| Thành phần | Quy tắc nghiệp vụ đã chốt |
| --- | --- |
| **Hộp thuốc cá nhân** | Mỗi bác sĩ có một Hộp thuốc riêng; số lượng trên kệ được theo dõi độc lập theo từng bác sĩ và từng loại thuốc. |
| **Tồn kho chung** | Là số lượng thuốc hiện có tại kho trung tâm, được theo dõi riêng với số lượng thuốc trên kệ của bác sĩ. |
| **Nhập kho thành công** | Khi phiếu nhận hàng được xác nhận nhập kho thành công, hệ thống tự động phân bổ số lượng nhập cho tất cả bác sĩ. |
| **Cách phân bổ** | Hệ thống chia đều tổng số lượng nhập cho tất cả bác sĩ đang thuộc phạm vi hoạt động. Tổng số lượng cộng vào các Hộp thuốc phải đúng bằng số lượng nhập. |
| **Số dư khi chia** | Nếu số lượng không chia hết, hệ thống phân phối phần dư cho một số bác sĩ theo thứ tự ổn định do hệ thống xác định; không làm mất hoặc nhân đôi số lượng. |
| **Sử dụng thuốc** | Khi bác sĩ ghi nhận sử dụng thuốc, số lượng trên kệ của chính bác sĩ đó giảm tương ứng với lượng đã dùng. |
| **Xem tồn kho** | Bác sĩ xem được số lượng thuốc trên kệ cá nhân và số lượng thuốc còn trong kho chung theo quyền được cấp. |
| **Yêu cầu bổ sung** | Bác sĩ có thể gửi yêu cầu bổ sung thuốc đến QL. QL tiếp nhận và xử lý yêu cầu. |
| **Yêu cầu ngừng kinh doanh/xóa** | Bác sĩ có thể gửi yêu cầu QL ngừng kinh doanh hoặc xóa thuốc khỏi danh mục Shop. Đây là yêu cầu đối với danh mục chung, không phải thao tác xóa thuốc khỏi Hộp thuốc cá nhân. |
| **Đồng bộ** | Sau khi nhập kho và phân bổ thành công, số lượng trên Hộp thuốc của từng bác sĩ được cập nhật tự động. |

### 3.4. Luồng nhập kho và phân bổ thuốc

1. QL tạo/duyệt đơn nhập hàng từ Supplier theo quy trình nhập hàng.
2. Supplier xác nhận đơn và giao hàng; số lượng Supplier điều chỉnh trên đơn được cập nhật vào đơn nhập theo quy tắc đã thống nhất.
3. QL kiểm tra số lượng thực nhận và xác nhận nhập kho thành công.
4. Hệ thống ghi nhận số lượng thực nhận vào nghiệp vụ kho và tự động phân bổ số lượng đó cho các Hộp thuốc bác sĩ theo cơ chế chia đều.
5. Hệ thống kiểm tra tổng lượng phân bổ bằng đúng lượng thực nhận; cập nhật số lượng từng bác sĩ và ghi nhận lịch sử phân bổ.
6. Nếu quá trình phân bổ lỗi, hệ thống phải bảo đảm không ghi nhận trạng thái hoàn tất một phần gây sai lệch; giao dịch nhập kho/phân bổ cần được xử lý nguyên tử hoặc có cơ chế hoàn tác.

> **Ví dụ:** nhập thành công 100 viên thuốc A cho 3 bác sĩ. Hệ thống phân bổ 34, 33 và 33 viên. Tổng số lượng được phân bổ là 100 viên. Không được cộng 100 viên cho từng bác sĩ.
>
> **Lưu ý nghiệp vụ:** lượng thuốc đã phân bổ vào Hộp thuốc không còn được tính là tồn kho chưa phân bổ tại kho chung. Khi hiển thị số liệu, cần tránh cộng trùng cùng một lượng thuốc ở cả kho chung và các Hộp thuốc.

---

## 4. Nhân viên chăm sóc thú cưng (`NVCS`)

### 4.1. Nghiệp vụ chính

- Quản lý thông tin cá nhân và hồ sơ năng lực/bằng cấp/chứng chỉ theo yêu cầu.
- Xem lịch làm việc và lịch hẹn được phân công.
- Tiếp nhận, thực hiện dịch vụ chăm sóc thú cưng và cập nhật tiến độ theo từng bước.
- Theo dõi trạng thái dịch vụ và phối hợp với QL khi phát sinh vấn đề.
- Đăng ký nghỉ hoặc đăng ký ca làm theo loại nhân sự full-time/part-time.
- Tạo, xem, cập nhật và xóa (CRUD) hồ sơ thú cưng.

### 4.2. NVCS full-time

- Lịch làm việc tiêu chuẩn: Thứ Hai đến Thứ Bảy, 08:00–17:00, nghỉ trưa 01 giờ, 08 giờ làm việc/ngày.
- Chỉ được gửi yêu cầu nghỉ nguyên ngày; tối đa 4 ngày/tháng.
- Không được đổi ca và không có chức năng đăng ký tăng ca.
- Không được gửi yêu cầu nghỉ cho tuần đã qua; chỉ gửi cho tuần hiện tại hoặc tương lai.

### 4.3. NVCS part-time

- Làm việc theo các ca part-time do QL cấu hình trước trên hệ thống.
- Có thể đăng ký các ca đang trống/được mở đăng ký theo cấu hình.
- Khi thực hiện đổi ca với nhân viên khác, phải cung cấp thông tin nhân viên đổi ca để hệ thống ghi nhận hai bên liên quan.
- Không có chức năng đăng ký tăng ca.
- Không cho phép đăng ký hoặc đổi ca thuộc các tuần đã qua trong tháng; chỉ xử lý tuần hiện tại và tương lai.

---

## 5. Quản lý nghiệp vụ (`QL`)

### 5.1. Quản lý vận hành

- Quản lý thông tin nhân sự, hồ sơ và trạng thái làm việc; duyệt hồ sơ năng lực theo quy trình.
- Quản lý lịch làm việc, xử lý yêu cầu nghỉ phép và yêu cầu đổi ca hợp lệ của NVCS part-time.
- Theo dõi, điều phối và xử lý lịch hẹn; can thiệp khi có xung đột hoặc sự cố.
- Quản lý hồ sơ thú cưng; có quyền tạo và cập nhật hồ sơ thú cưng.
- Quản lý danh mục dịch vụ, giá và cấu hình hình thức thanh toán.
- Quản lý Shop: danh mục, sản phẩm, trạng thái kinh doanh, tồn kho, voucher và đơn nhập hàng.
- Quản lý đơn hàng, trạng thái xử lý, đổi trả và hoàn tiền theo quy tắc.
- Quản lý đối tác Trạm cứu hộ và quy trình nhận nuôi.
- Theo dõi báo cáo vận hành và các yêu cầu cần xử lý.

### 5.2. Quản lý thuốc và Hộp thuốc bác sĩ

- Tiếp nhận yêu cầu bổ sung thuốc từ bác sĩ; xem xét, phê duyệt/từ chối và xử lý theo quy trình nhập hàng.
- Tiếp nhận yêu cầu ngừng kinh doanh/xóa thuốc khỏi danh mục Shop; đánh giá ảnh hưởng đến đơn thuốc, đơn hàng, tồn kho và các nghiệp vụ đang phát sinh trước khi quyết định.
- Quản lý đơn nhập hàng với Supplier; theo dõi số lượng đặt, số lượng Supplier xác nhận và số lượng thực nhận.
- Xác nhận nhập kho dựa trên số lượng thực tế nhận được.
- Sau khi nhập kho thành công, hệ thống tự động chia đều số lượng thực nhận cho các bác sĩ và cập nhật từng Hộp thuốc.
- Theo dõi tồn kho chung, số lượng đã phân bổ, số lượng trên kệ từng bác sĩ và lịch sử sử dụng/phân bổ.
- Không được để tổng số lượng phân bổ vượt quá số lượng thực nhập.

### 5.3. Tài khoản Quản lý

- Tài khoản QL là tài khoản dùng chung cho nhiều người quản lý và hỗ trợ đăng nhập nhiều phiên đồng thời.
- QL không tự đổi mật khẩu; chỉ Admin có quyền thay đổi mật khẩu tài khoản QL.
- Các thao tác nghiệp vụ của tài khoản dùng chung được ghi nhận người xử lý hiển thị là “Đã xử lý bởi Quản lý”.
- Nhật ký hệ thống vẫn cần lưu thời điểm, loại thao tác, đối tượng bị tác động và dữ liệu trước/sau để phục vụ kiểm tra.

---

## 6. Admin (`AD`)

- Quản lý danh sách tài khoản, trạng thái tài khoản và phân quyền truy cập.
- Tạo/cấp tài khoản Supplier theo quy trình.
- Cấu hình các thông số hệ thống thuộc phạm vi quản trị.
- Xem dashboard, báo cáo và dữ liệu vận hành ở chế độ chỉ đọc.
- Không thực hiện nghiệp vụ vận hành thông thường thay QL.
- Được phép can thiệp nghiệp vụ trong tình huống khẩn cấp khi QL vắng mặt; mọi thao tác can thiệp phải được ghi nhật ký kiểm toán, nêu rõ người thực hiện, thời điểm, lý do và nội dung thay đổi.
- Là role duy nhất được thay đổi mật khẩu tài khoản QL dùng chung.

---

## 7. Nhà cung cấp (`SUP`)

- Đăng nhập bằng tài khoản do Admin cấp; cập nhật thông tin nhà cung cấp.
- Quản lý danh mục hàng hóa/thuốc có thể cung cấp và thông tin liên quan.
- Tiếp nhận đơn nhập hàng từ Animora.
- Xác nhận, từ chối hoặc điều chỉnh số lượng cung cấp trên đơn theo quy trình.
- Giao hàng và cập nhật trạng thái giao hàng.
- Theo dõi các đơn nhập và thông tin đối soát được hệ thống cung cấp.

> **Quy tắc:** Khi Supplier điều chỉnh số lượng trên đơn, số lượng điều chỉnh được cập nhật trực tiếp vào đơn nhập. QL kiểm tra số lượng thực tế nhận khi hàng đến; không yêu cầu QL xác nhận lại số lượng Supplier đã điều chỉnh trước khi Supplier giao hàng.

---

## 8. Trạm cứu hộ (`TCH`)

- Quản lý thông tin Trạm cứu hộ liên kết.
- Đăng thú cưng cần nhận nuôi, bao gồm hình ảnh, tình trạng sức khỏe, đặc điểm và điều kiện nhận nuôi.
- Tiếp nhận và xử lý yêu cầu nhận nuôi theo quy trình.
- Cập nhật kết quả xét duyệt và trạng thái thú cưng.

> **Quy tắc hồ sơ thú cưng khi nhận nuôi:** nếu thú cưng đã có hồ sơ trên Animora, hệ thống chuyển/liên kết hồ sơ hiện có sang khách hàng nhận nuôi, không tạo hồ sơ trùng. Nếu chưa có hồ sơ, hệ thống tạo hồ sơ mới.

---

## 9. Quy tắc nghiệp vụ dùng chung

### 9.1. Lịch làm việc

| Đối tượng | Lịch / quyền đăng ký | Giới hạn |
| --- | --- | --- |
| **BS** | Full-time, Thứ Hai–Thứ Bảy, 08:00–17:00; nghỉ trưa 1 giờ; chỉ xin nghỉ nguyên ngày. | Tối đa 4 ngày nghỉ/tháng; không đổi ca, không tăng ca. |
| **NVCS full-time** | Lịch tiêu chuẩn giống BS; chỉ xin nghỉ nguyên ngày. | Tối đa 4 ngày nghỉ/tháng; không đổi ca, không tăng ca. |
| **NVCS part-time** | Đăng ký ca trống/ca được mở; đổi ca phải khai báo nhân viên còn lại. | Không tăng ca; không thao tác với tuần đã qua. |

Hạn mức nghỉ 4 ngày được làm mới vào đầu tháng, không cộng dồn sang tháng sau. Nghỉ ốm và nghỉ không lương vẫn tính vào hạn mức. Không xây dựng chức năng tăng ca trong Animora. Điều 107 Bộ luật Lao động 2019 chỉ được giữ làm ghi chú tham chiếu pháp lý trong tài liệu, không phải luồng chức năng của hệ thống.

### 9.2. Đặt lịch và thanh toán dịch vụ

- KH tự chọn trả trước hoặc trả sau khi đặt lịch.
- Hủy lịch không giới hạn thời gian, không thu phí; lịch trả trước được hoàn 100%.
- Đổi/dời lịch không giới hạn thời gian, không thu phí; khoản đã trả trước được bảo lưu và chuyển sang lịch mới.
- Lịch trả sau được giữ trạng thái chưa thanh toán và thanh toán sau khi dịch vụ hoàn thành.

### 9.3. Hồ sơ thú cưng

KH (với thú cưng của mình), BS, NVCS và QL đều có quyền CRUD thông tin hồ sơ thú cưng. Riêng Sổ sức khỏe, Lịch sử khám và Đơn thuốc của Bác sĩ là Chỉ xem đối với KH (do BS cập nhật chuyên môn). Khi nhận nuôi, ưu tiên tái sử dụng hồ sơ hiện có để tránh trùng lặp dữ liệu.

### 9.4. Đổi trả sản phẩm

KH được gửi yêu cầu đổi trả trong vòng 7 ngày kể từ khi đơn hàng được giao thành công, với lý do hàng bị lỗi hoặc giao sai. Quy trình có thể tham khảo mô hình xử lý của sàn thương mại điện tử nhưng không sao chép thời hạn, điều kiện hoặc chính sách riêng của Shopee.

### 9.5. Ghi nhận và kiểm toán

- Các thao tác ảnh hưởng đến dữ liệu quan trọng cần có lịch sử: người thực hiện, thời điểm, đối tượng, hành động và kết quả.
- Các thao tác can thiệp khẩn cấp của AD phải có lý do và nhật ký kiểm toán.
- Các thao tác nhập kho, phân bổ thuốc và sử dụng thuốc cần lưu số lượng trước/sau để đối chiếu.
- Không được cập nhật tồn kho theo cách làm trùng số lượng giữa kho chung và Hộp thuốc cá nhân.

---

## 10. Ma trận quyền hạn tóm tắt

| Chức năng | KH | BS | NVCS | QL | AD | SUP | TCH |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Đặt lịch dịch vụ** | Thực hiện | Xem/nhận | Xem/nhận | Quản lý | Chỉ xem | — | — |
| **Khám, chẩn đoán, kê đơn** | — | Thực hiện | — | Theo dõi | Chỉ xem | — | — |
| **Tạo/cập nhật hồ sơ thú cưng** | Có | Có | Có | Có | Chỉ xem | — | — |
| **Sổ sức khỏe & Đơn thuốc** | Chỉ xem | Thực hiện | — | Theo dõi | Chỉ xem | — | — |
| **Hộp thuốc cá nhân** | — | Xem/sử dụng/gửi yêu cầu | — | Quản lý | Chỉ xem | — | — |
| **Nhập kho và phân bổ thuốc** | — | Theo dõi | — | Quản lý/xác nhận | Chỉ xem; khẩn cấp có log | Giao hàng/xác nhận | — |
| **Quản lý Shop** | Mua hàng | Gửi yêu cầu thuốc | — | Quản lý | Chỉ xem | Cung cấp hàng | — |
| **Lịch nghỉ/đổi ca** | — | Xin nghỉ | Xin nghỉ/đăng ký ca theo loại | Duyệt/điều phối | Chỉ xem | — | — |
| **Quản trị tài khoản/phân quyền** | — | — | — | — | Quản lý | — | — |
| **Đăng thú cưng nhận nuôi** | Gửi yêu cầu | — | — | Quản lý | Chỉ xem | — | Thực hiện |

---

## 11. Quy tắc kiểm soát dữ liệu cho Front-end / Back-end

### 11.1. Front-end

- Ẩn hoặc vô hiệu hóa chức năng theo role; không chỉ dựa vào việc ẩn nút mà phải kiểm tra quyền ở Back-end.
- Trang Hộp thuốc BS cần phân biệt rõ: số lượng trên kệ cá nhân, số lượng còn trong kho chung và lịch sử biến động.
- Hiển thị trạng thái yêu cầu thuốc: chờ xử lý, đã duyệt/đang xử lý, hoàn tất hoặc từ chối (tên trạng thái có thể chuẩn hóa khi thiết kế Use Case).
- Khi nhập kho/phân bổ hoàn tất, dữ liệu Hộp thuốc cần được cập nhật lại để BS thấy số lượng mới.
- Khi số lượng thuốc trên kệ không đủ, không cho ghi nhận sử dụng vượt quá số lượng hiện có.

### 11.2. Back-end

- Kiểm tra quyền truy cập theo role ở mọi API nghiệp vụ.
- Xử lý nhập kho và phân bổ thuốc theo giao dịch nguyên tử hoặc cơ chế bảo đảm nhất quán; tổng phân bổ phải bằng số lượng thực nhận.
- Không cho phép số lượng tồn kho hoặc số lượng trên kệ âm.
- Mỗi lần sử dụng thuốc phải ghi nhận bác sĩ, thuốc, số lượng, thời điểm và tham chiếu nghiệp vụ liên quan nếu có.
- Không cho phép bác sĩ tự xóa thuốc khỏi danh mục Shop; bác sĩ chỉ gửi yêu cầu để QL xem xét.
- Khi QL ngừng kinh doanh/xóa thuốc, cần kiểm tra ràng buộc với đơn thuốc, đơn hàng và tồn kho trước khi thực hiện; ưu tiên ngừng kinh doanh thay vì xóa vật lý nếu dữ liệu lịch sử đang tham chiếu.
- Ghi log thay đổi tồn kho, phân bổ, sử dụng thuốc và thao tác can thiệp khẩn cấp của AD.

---

## 12. Các điểm cần chuẩn hóa khi đặc tả Use Case / Database

- Xác định chính xác phạm vi bác sĩ được nhận phân bổ: chỉ bác sĩ đang hoạt động hay tất cả tài khoản bác sĩ còn hiệu lực tại thời điểm nhập kho.
- Chốt quy tắc kỹ thuật xác định thứ tự nhận phần dư khi số lượng không chia hết; phải bảo đảm kết quả ổn định và kiểm toán được.
- Chuẩn hóa trạng thái yêu cầu bổ sung thuốc và yêu cầu ngừng kinh doanh/xóa thuốc.
- Xác định thao tác ghi nhận sử dụng thuốc có gắn với phiếu khám/đơn thuốc hay có thể ghi nhận cho các hoạt động sử dụng nội bộ khác.
- Xác định quy trình xử lý thuốc hết hạn, hư hỏng, thu hồi hoặc điều chỉnh tồn kho ngoài luồng sử dụng thông thường.
- Đối chiếu mã Use Case mới cho Hộp thuốc với Use Case `MED-09` hiện có để tránh trùng chức năng đề xuất thuốc mới và nhập hàng.

---

## 13. Nguyên tắc ưu tiên tài liệu

Tài liệu này là bản nghiệp vụ cập nhật. Khi có mâu thuẫn với mô tả cũ, ưu tiên các quy tắc đã chốt trong tài liệu này, đặc biệt đối với hủy/đổi lịch, thanh toán, quyền quản lý hồ sơ thú cưng, lịch làm việc, loại bỏ chức năng tăng ca, quyền can thiệp khẩn cấp của Admin và Hộp thuốc bác sĩ.

Tài liệu không thay thế đặc tả Use Case chi tiết, Data Dictionary hoặc thiết kế cơ sở dữ liệu. Các tài liệu đó cần được cập nhật đồng bộ dựa trên các quy tắc trong bản này.

*Tài liệu nghiệp vụ nội bộ – Phiên bản cập nhật 16/11/2026*
