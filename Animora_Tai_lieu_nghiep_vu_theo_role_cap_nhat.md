# Animora – Nghiệp vụ theo module (ver1.4.1 by Thùy)

Nov 19, 2026 · @Toàn · Cập nhật: **ver1.4.1 by Thùy** (Nov 22, 2026 – bổ sung chi tiết role NVCS/BS & chốt toàn bộ Review nghiệp vụ v1.4)

Animora ver1.4.1 thu hẹp thành nền tảng cho khách đưa thú cưng đến khám, chăm sóc và mua sắm, với 7 role (`KH`, `BS`, `NVCS`, `LT`, `QL`, `AD`, `SUP`). Bản này thay `v1.3` và `v1.4` ở mọi chỗ mâu thuẫn.

## 1. Phạm vi và thay đổi so với v1.3

**Trong phạm vi:** khám và chăm sóc sức khỏe, dịch vụ chăm sóc (tắm, cắt tỉa, spa), Shop (thức ăn, đồ uống, phụ kiện, thuốc — hỗ trợ thanh toán `COD`/`Banking`, giao hàng qua đơn vị vận chuyển bên ngoài hoặc nhận tại quầy), kho chung và nhập hàng, vận hành quầy, AI Chat tư vấn hỏi-đáp cơ bản (chỉ đọc, dựa trên `ai.service.js` sẵn có).

**Ngoài phạm vi (ghi rõ cho mentor):**

- Nhận nuôi và role Trạm cứu hộ.
- Nhân viên Part-time và đổi ca.
- Lưu trú qua đêm.
- Mã vi mạch của thú cưng.
- Combo dịch vụ có giá riêng (chỉ cộng dịch vụ, có voucher thì giảm).
- Hộp thuốc riêng của bác sĩ và phân bổ thuốc: gộp vào kho chung.
- Duyệt bằng cấp / chứng chỉ hành nghề bác sĩ trên hệ thống (AD/QL xác minh thủ công ngoài hệ thống trước khi cấp tài khoản BS).
- Luồng xin nghỉ phép trên web cho Quản lý (QL) và Admin (AD) (báo trực tiếp ngoài hệ thống vì không nằm trong bộ máy tự gán ca).
- Role Shipper giao hàng riêng (đơn vị vận chuyển bên ngoài, QL cập nhật trạng thái đơn Shop thủ công).
- Tự tính lương: kế toán làm ngoài hệ thống.
- Loài khác ngoài Chó, Mèo, Chuột, Thỏ: không tạo được hồ sơ, không đặt được dịch vụ.

**Quy tắc chung:** nghỉ trưa cố định `12:00–13:00`, slot bị khóa và hiển thị nhãn `"Nghỉ trưa"`; lịch làm việc Thứ Hai đến Thứ Bảy, `08:00–17:00` (Chủ Nhật nghỉ cố định).

| # | Chủ đề | v1.3 | ver1.4.1 |
| --- | --- | --- | --- |
| 1 | Role | 7 role có Trạm cứu hộ | 7 role, bỏ TCH, thêm Lễ tân |
| 2 | Hủy và đổi lịch | Không giới hạn, không phí | Đặt online trước tối thiểu 3 giờ; hủy dưới 3 giờ và không đến có hậu quả, đếm violation |
| 3 | Hồ sơ khách vãng lai (không cần tài khoản) | Chưa có | LT tạo bản ghi khách bằng SĐT và tên (khách không đăng nhập); tài khoản Web chỉ tạo khi khách muốn dùng |
| 4 | Giá dịch vụ | Một giá | Theo loài; một số dịch vụ theo hạng cân; chọn đích danh nhân sự (BS/NVCS) cộng phụ phí +10% giá dòng dịch vụ |
| 5 | Cân nặng | KH nhập | KH khai ban đầu, BS cập nhật rồi khóa hồ sơ y tế; dịch vụ chăm sóc tính theo cân cho phép LT nhập "Cân thực tế tại quầy" trên phiếu lịch hẹn |
| 6 | Lương | Tự tính theo số ca | QL xem và sửa lương cấp dưới (BS, NVCS, LT) có log; chặn QL tự sửa lương chính mình; bỏ tự tính |
| 7 | Kho thuốc | Hộp thuốc từng bác sĩ | Kho chung, ghi bác sĩ ở mỗi lần xuất dùng; hàng lỗi trả về tách khỏi tồn bán |
| 8 | Nghỉ đột xuất | Chưa có | Quy trình riêng, trừ vào 4 ngày nghỉ mỗi tháng (hết quỹ vẫn tạo được và gắn cờ nghỉ không lương) |
| 9 | Nghỉ phép Lễ tân | Chưa có | LT gửi đơn nghỉ gọn nhẹ (4 ngày/tháng, không khóa slot khách), đồng bộ duyệt & quỹ nghỉ với QL |
| 10 | Nhân viên chăm sóc (NVCS) | Có Part-time, đổi ca, lưu trú 24/7 và phân kỹ năng riêng từng NVCS | Chỉ hình thức Full-time (T2–T7, 08:00–17:00), bỏ lưu trú qua đêm, mọi NVCS thực hiện mọi dịch vụ chăm sóc (không phân bảng kỹ năng); chỉ xem hồ sơ thú cưng & lưu ý y khoa từ BS |
| 11 | Bác sĩ thú y (BS) | Được tạo/xóa thú cưng, tự đề xuất dời giờ hẹn khách, quản lý hộp thuốc/kệ riêng từng BS và nhận chia đều khi nhập PO | Chỉ hình thức Full-time (T2–T7, 08:00–17:00), không tạo/xóa thú cưng (chỉ cập nhật & khóa 4 trường y tế + xác nhận ghi chú khách có Audit Log), không tự đổi giờ hẹn; khám 2 bước (SOAP → Đơn thuốc) liên kết tự động theo ngày giờ địa phương; dùng chung 1 Kho thuốc chung (nhập PO cộng thẳng kho chung, xuất dùng trừ thẳng kho chung, chặn xuất âm + báo QL 1-click) |

## 2. Role và quyền

Mỗi người dùng một tài khoản riêng; Audit Log phải biết đúng ai làm. Quyền kiểm tra ở backend, không chỉ ẩn nút.

| Role | Là ai | Việc chính |
| --- | --- | --- |
| KH | Khách nuôi thú cưng | Tạo/ẩn hồ sơ thú cưng, đặt/hủy/đổi lịch, thanh toán, mua hàng Shop, xem sổ sức khỏe |
| BS | Bác sĩ thú y | Khám, kê đơn, cập nhật & khóa 4 trường y tế thú cưng, ghi thuốc xuất dùng tại phòng |
| NVCS | Nhân viên chăm sóc | Thực hiện toàn bộ dịch vụ chăm sóc (không phân bảng kỹ năng), cập nhật tiến trình 4 bước, xem hồ sơ thú cưng & lưu ý y khoa từ BS, xin nghỉ phép nguyên ngày |
| LT | Lễ tân | Tạo/nâng cấp khách vãng lai, đặt/hủy/đổi lịch giúp, check-in, dời 30p, hoàn tác không đến, nhập cân thực tế tại quầy, thu tiền dịch vụ & đơn thuốc theo lịch hẹn, xuất hóa đơn, xin nghỉ phép (gọn nhẹ) |
| QL | Quản lý | Điều phối nhân sự, duyệt nghỉ phép & tạo nghỉ đột xuất, khôi phục thú cưng đã ẩn, Shop, kho, đơn nhập, sửa lương cấp dưới, xem thống kê |
| AD | Admin | Quản lý tài khoản, phân quyền, cấu hình hệ thống, xem dữ liệu & Audit Log |
| SUP | Nhà cung cấp | Xác nhận hoặc chỉnh đơn nhập của mình, cập nhật trạng thái `"Đang giao"` |

| Chức năng | KH | BS | NVCS | LT | QL | AD | SUP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tạo hồ sơ thú cưng | Có | Không | Không | Có (khách vãng lai) | Không | Không | Không |
| Xem hồ sơ thú cưng | Của mình | Có | Có | Có | Có | Có | Không |
| Cập nhật 4 trường y tế (cân nặng, dị ứng, hành vi, triệt sản) | Khai ban đầu | Có (rồi khóa) | Không | Không\* | Không | Không | Không |
| Nhập cân thực tế tại quầy tính giá dịch vụ | Không | Có (qua SOAP) | Không | Có (trên lịch hẹn) | Không | Không | Không |
| Ẩn thú cưng | Có | Không | Không | Không | Không | Không | Không |
| Khôi phục thú cưng đã ẩn | Không | Không | Không | Không | Có | Xem log | Không |
| Đặt lịch | Có | Không | Không | Có (giúp khách) | Không | Không | Không |
| Hủy / Đổi lịch hẹn | Của mình | Không | Không | Có (hỗ trợ tại quầy) | Đổi NV khi nghỉ đột xuất | Không | Không |
| Check-in, Dời 30p, Hoàn tác không đến | Không | Không | Không | Có | Không | Không | Không |
| Thu tiền dịch vụ & đơn thuốc gắn lịch hẹn, hoàn/bù tiền, xuất hóa đơn | Không | Không | Không | Có | Không | Không | Không |
| Cập nhật tiến độ dịch vụ | Không | Có | Có | Không | Không | Không | Không |
| Kê đơn, sổ sức khỏe | Xem | Có | Không | Xem đơn thuốc để thu tiền quầy | Xem | Xem | Không |
| Shop, kho, đơn nhập | Mua | Xem tồn thuốc | Không | Không (chỉ thu đơn thuốc theo ca) | Có (QL bấm Đã nhận/Nhập kho) | Xem | Đơn của mình (cập nhật Đang giao) |
| Nghỉ phép | Không | Xin | Xin | Xin (gọn nhẹ) | Duyệt, tạo nghỉ đột xuất\*\* | Không | Không |
| Sửa lương | Không | Không | Không | Không | Có (chỉ BS, NVCS, LT; **chặn tự sửa lương mình**) | Không | Không |
| Dashboard | Không | Không | Không | Không | Có | Xem | Không |
| Tài khoản, phân quyền | Không | Không | Không | Không | Không | Có | Không |

> \* **Làm rõ quyền nhập cân của Lễ tân (LT):** LT **không** sửa cân nặng trong hồ sơ y tế (vốn do BS làm chủ và khóa `medicalLocked = true`), mà chỉ nhập **"Cân thực tế tại quầy (kg)"** trên phiếu lịch hẹn để hệ thống tự quy đổi hạng cân và tính giá mới (có Audit Log).
> \*\* **Làm rõ nghỉ phép của Quản lý (QL):** QL không nằm trong bộ máy tự gán ca khách hàng nên không sử dụng luồng xin nghỉ trên web trong ver1.4.1 (báo trực tiếp AD/Chủ phòng khám ngoài hệ thống).
> **Làm rõ phân quyền Quản lý (QL) vs. Lễ tân (LT):** Các thao tác **Check-in, Thu tiền tại quầy, Hoàn/Bù tiền, Xuất hóa đơn** chỉ thuộc về **Lễ tân (LT)**. Trên màn hình Quản lý lịch hẹn, **QL** chỉ xem thông tin, cấu hình dịch vụ và điều phối/đổi nhân sự khi xử lý nghỉ đột xuất.
> **Làm rõ phân quyền & phạm vi của Nhân viên chăm sóc (NVCS):**
> - Mọi NVCS đều làm việc theo hình thức **Full-time** (T2–T7, `08:00–17:00`) và thực hiện được **toàn bộ dịch vụ chăm sóc** (Tắm, Spa thảo mộc, Cắt tỉa lông, Vệ sinh cơ bản) — **không phân biệt bảng kỹ năng** trên hồ sơ cá nhân hay màn hình đặt lịch. Phòng khám vẫn duy trì `≥ 2` NVCS cùng vai trò để phục vụ tự gán cân tải và đổi nhân sự khi nghỉ đột xuất.
> - NVCS chỉ có quyền **Chỉ xem** hồ sơ thú cưng (không tạo/sửa/xóa, không sửa cân nặng, dị ứng, hành vi, triệt sản); **bị chặn truy cập** Sổ sức khỏe, Kê đơn thuốc và Kho/Tủ thuốc. Trong chi tiết lịch hẹn, NVCS được xem khung **"Lưu ý Y khoa từ Bác sĩ Thú y"** (tổng hợp bệnh án gần nhất từ tất cả các Bác sĩ) và cân nặng/giá thực tế đo tại quầy Lễ tân để chăm sóc bé an toàn.
>
> **Làm rõ phân quyền & phạm vi thực tế của Bác sĩ thú y (BS):**
> - **Hồ sơ thú cưng:** BS **không** tạo mới và **không** xóa/ẩn hồ sơ thú cưng (chỉ KH và LT tạo; chỉ KH ẩn). BS làm chủ 4 trường y tế (**Cân nặng thực tế**, **Dị ứng**, **Hành vi đặc biệt**, **Tình trạng triệt sản**), có quyền xác nhận 1-click đưa **Ghi chú bổ sung từ khách (`customerNotes`)** vào trường Dị ứng/Hành vi chính thức, tự động bật cờ khóa `medicalLocked = true` đối với KH ngay từ lần cập nhật đầu tiên (kể cả khi lưu Phiếu khám SOAP) và ghi **Audit Log** đầy đủ.
> - **Khám lâm sàng & Kê đơn điện tử:** Chỉ BS được truy cập Sổ sức khỏe/Bệnh án, Kê đơn thuốc và Kho thuốc chung. Kê đơn đọc tồn kho trực tiếp từ **Kho thuốc chung**, ưu tiên thuốc còn tồn (`stock > 0`), cảnh báo khác loài theo 4 loài chuẩn (Chó, Mèo, Chuột, Thỏ), và áp quy tắc tái cấp trực tuyến (ca bệnh nặng khóa cứng `0` lượt mua lại).
> - **Lịch hẹn & Điều phối:** Làm việc Full-time cố định T2–T7 (`08:00–17:00`, nghỉ trưa `12:00–13:00`); BS không tự ý đổi giờ / đề xuất dời giờ hẹn hay đơn phương hủy ca của khách — khi phát sinh sự cố đột xuất chỉ gửi yêu cầu **"Báo Quản lý điều phối (Nghỉ đột xuất)"**.
> - **Kho thuốc chung:** Xem tồn kho chung (chỉ đọc), lọc **"Thuốc tôi đã dùng"**, ghi nhận xuất dùng tại phòng khám (trừ trực tiếp kho chung, chặn xuất âm + báo QL 1-click, chống xuất đúp cùng thuốc/ca), gửi đề xuất bổ sung kho / đề xuất thuốc mới / đề xuất ngừng kinh doanh lên QL (không tự xóa sản phẩm).

## 3. Hồ sơ thú cưng

Hồ sơ thuộc một chủ; dữ liệu y tế do bác sĩ làm chủ sau lần cập nhật đầu tiên.

- **Loài:** chỉ Chó, Mèo, Chuột, Thỏ. Loài khác không tạo được hồ sơ và không đặt được dịch vụ (giới hạn đã biết, mở rộng ở giai đoạn sau).
- **Cân nặng:** KH khai ban đầu. BS cân lại theo thực tế và cập nhật (từ màn hình Khách hàng & Thú cưng hoặc tự động đồng bộ khi BS lưu **Phiếu khám bệnh án SOAP**); sau lần cập nhật đầu tiên hệ thống tự bật cờ khóa `medicalLocked = true` để KH không sửa được. Mọi lần đổi ghi Audit Log (giá trị cũ, mới, người sửa, nguồn cập nhật, lúc nào).
- **Dị ứng, hành vi (ví dụ sợ tiếng máy sấy), tình trạng triệt sản:** KH nhập khi tạo. BS cập nhật rồi khóa với KH (`medicalLocked = true`). BS không tạo mới và không xóa hồ sơ thú cưng; NVCS và QL chỉ xem.
- **Ghi chú bổ sung từ khách (`customerNotes`):** KH chỉ thêm dòng mới (có thời gian), không sửa hay xóa dòng cũ. BS có thao tác xác nhận 1-click để hợp nhất nội dung ghi chú vào trường **Dị ứng** hoặc **Hành vi** chính thức (tránh trùng lặp, đánh dấu đã xác nhận kèm tên BS & thời điểm, đồng thời ghi Audit Log).
- **Thú con lớn nhanh:** khách đưa đến để BS cân lại (hoặc LT cân tại quầy với ca chăm sóc); giá ra theo cân mới (xem mục 6).
- **Ẩn thú cưng:** chỉ KH, kèm lý do cá nhân. Ẩn là xóa mềm: thú cưng biến khỏi danh sách của khách nhưng lịch sử, sổ sức khỏe và thống kê giữ nguyên.
  - **Chặn cứng ẩn thú cưng** nếu bé đang có lịch hẹn ở trạng thái `Đã đến` hoặc `Đang làm`, hoặc còn hóa đơn dịch vụ chưa thu tiền.
  - Với các lịch hẹn sắp tới (`Giữ chỗ` / `Đã xác nhận`), ẩn thú cưng được xem như khách chủ động hủy lịch → **áp dụng đúng quy tắc phạt hủy dưới 3 giờ và tính `violation` của Mục 5** (hệ thống bắt buộc hiển thị popup cảnh báo rõ số tiền bị giữ / số violation phát sinh trước khi khách bấm xác nhận ẩn, chống lợi dụng nút ẩn để né phạt).
  - **QL** có quyền khôi phục thú cưng đã ẩn khi cần (ghi Audit Log).
- **Khách vãng lai:** LT được tạo hồ sơ thú cưng. Cân nặng và dị ứng do LT nhập tính là `"do khách khai"`, BS cập nhật sau.
- **Dùng chung một hàm** lấy danh sách thú cưng đang hoạt động ở mọi màn hình chọn thú cưng, để thú cưng đã ẩn không hiện ra khi đặt lịch.
- **Bỏ:** mã vi mạch.

## 4. Đặt lịch, giá và thanh toán

Online và tại quầy dùng chung một bộ máy đặt lịch (cùng lịch nhân sự, cùng tự gán, cùng khóa chống trùng); chỉ khác người thao tác và một vài quy tắc.

**Luồng đặt:**
- **Online trả trước:** chọn thú cưng (1 thú cưng mỗi lần) → thêm dịch vụ vào giỏ (cộng lại, có voucher thì giảm) → chọn ngày giờ (cách hiện tại tối thiểu **3 giờ**) → hệ thống xếp các dịch vụ nối tiếp và tính tổng thời lượng, tổng tiền → tự gán nhân sự → `Giữ chỗ` (10 phút) → thanh toán online → tự chuyển `Đã xác nhận` (`payment_status = Đã thanh toán`).
- **Online trả sau:** chọn thú cưng → thêm dịch vụ → chọn ngày giờ (cách hiện tại tối thiểu **3 giờ**) → tự gán nhân sự → khách bấm xác nhận → backend kiểm tra rảnh & khóa slot trong 1 transaction (không qua bước `Giữ chỗ 10 phút`) → tạo thẳng đơn ở trạng thái `Đã xác nhận` + `payment_status = Chưa thanh toán`.

**Giá dịch vụ**

- Giá theo loài. Mỗi dịch vụ có cờ `"tính theo hạng cân"` (có/không).
- Dịch vụ tính theo hạng cân (ví dụ tắm, cắt tỉa lông, tiêm): giá = loài × hạng cân, cố định 3–4 hạng, không tính từng kg.
- Dịch vụ giá cố định theo loài (ví dụ spa, massage, khám tổng quát): không đổi theo cân nặng.
- Chỉ dịch vụ y tế và dịch vụ có cờ mới cần cân lại. Với dịch vụ có BS khám thì BS cập nhật cân nặng vào hồ sơ y tế; với dịch vụ chăm sóc có cờ hạng cân (Tắm, Cắt tỉa lông) khi không có BS trong ca thì cho phép LT nhập **"Cân thực tế tại quầy (kg)"** trên phiếu lịch hẹn để hệ thống tự tính giá mới (không ghi đè khóa bệnh án y tế của BS). Dịch vụ giá cố định theo loài không cần cân lại.
- Giá lưu lại lúc đặt (giá chụp); đổi giờ giữ giá cũ.
- **Đổi dịch vụ** được coi là hủy lịch cũ và đặt lịch mới:
  - Nếu khách tự đổi dịch vụ trên web trong vòng **dưới 3 giờ** trước giờ hẹn → áp dụng đúng quy tắc hủy dưới 3 giờ ở Mục 5 (tránh lách luật).
  - Nếu khách đến quầy / gọi quầy nhờ **LT hỗ trợ đổi dịch vụ** và nhân sự vẫn đáp ứng được thời lượng khung giờ đó → miễn phạt (`0đ`, `0 violation`), ghi Audit Log.

**Tự gán nhân sự**

- Mỗi dòng dịch vụ có loại nhân sự yêu cầu (BS hoặc NVCS). Hệ thống chọn người rảnh có **ít ca nhất trong ngày, hòa thì theo mã nhân viên**.
- Có người rảnh cho mọi dòng thì lịch tự xác nhận, QL không duyệt. Thiếu người thì không cho đặt khung đó và gợi ý khung gần nhất.
- **Chọn đích danh nhân sự:** khách được chọn đích danh BS hoặc NVCS mong muốn, **cộng phụ phí +10% giá dòng dịch vụ đó** (áp dụng cho cả BS và NVCS). Lịch chọn đích danh được gắn cờ `is_preferred_staff = true` để phân biệt khi tính giá và xử lý nghỉ phép/nghỉ đột xuất.
- Chuỗi dịch vụ nằm gọn trong một buổi; không đặt vào `12:00–13:00`.

**Chống đặt trùng:** giữ chỗ 10 phút khi sang bước thanh toán online, hết hạn tự nhả. Lúc xác nhận kiểm tra lại và khóa trong một transaction.

**Hai kênh**

|  | Online | Tại quầy (LT đặt giúp) |
| --- | --- | --- |
| Người thao tác | Khách tự đặt | LT nhập thay khách |
| Tài khoản khách | Có | Không bắt buộc, chỉ cần tên và SĐT |
| Giữ chỗ 10 phút | Có (chỉ đơn trả trước online) | Không |
| Đặt trước tối thiểu 3 giờ | **Có (tối thiểu 3 giờ)** | Không (làm ngay hoặc hẹn trong vòng 3h được) |
| Trạng thái đầu (lịch hẹn) | `Giữ chỗ` (trả trước) hoặc `Đã xác nhận` (trả sau) | `Đã xác nhận` (Hẹn giờ) hoặc `Đã đến` (Làm ngay) |
| Thanh toán | Trả trước online (VNPay/PayOS/CK) hoặc Trả sau tiền mặt tại quầy | Tiền mặt, chuyển khoản (trả ngay trước khi làm hoặc trả sau khi xong) |
| Khi hết người | Từ chối, gợi ý giờ khác | Từ chối, không ghi đè |

**Thanh toán**

- **Trả trước:**
  - Trên kênh Online: **chỉ chấp nhận thanh toán trước online** (VNPay/PayOS/Chuyển khoản sandbox) ngay trong 10 phút giữ chỗ. Không còn lựa chọn `"tiền mặt nộp trước tại quầy"` trên kênh Online.
  - Trên kênh Tại quầy (LT đặt giúp): khách nộp tiền mặt / chuyển khoản **ngay tại quầy trước khi làm** và LT bấm `"Đã thu"` (`payment_status = Đã thanh toán`) → tính là ca trả trước hợp lệ.
- **Trả sau:** tiền mặt / chuyển khoản tại quầy sau khi dịch vụ hoàn thành; LT bấm `"Đã thu"` và xuất hóa đơn.
- Khách lớn tuổi không thanh toán online được vẫn dùng đầy đủ: LT đặt giúp và thu tiền mặt tại quầy.
- Hoàn và bù tiền thủ công (tiền mặt hoặc VNPay, PayOS); hệ thống chỉ ghi số tiền, người làm, lý do.

**Tách riêng 2 trường trạng thái (áp dụng đồng bộ DB, Backend & Frontend):**

- **Trạng thái lịch hẹn (`appointment_status`):** `Giữ chỗ` (chỉ online trả trước) → `Đã xác nhận` → `Đã đến` → `Đang làm` → `Hoàn thành`. Nhánh phụ: `Hết hạn giữ chỗ`, `Đã hủy`, `Không đến`, `Cần điều phối` (nhân sự nghỉ đột xuất chưa có người thay).
- **Trạng thái thanh toán (`payment_status`):** `Chưa thanh toán (unpaid)`, `Đã thanh toán (paid)`, `Thu phí hủy / Hoàn một phần (partial_fee)`, `Đã hoàn đủ (refunded)`.

**Dòng dịch vụ:** `Chờ` → `Đang làm` → `Xong`. Mỗi dòng `"Xong"` kích hoạt đếm ca (hiển thị) và xuất kho thuốc, trong cùng một transaction và chỉ một lần cho mỗi dòng (`idempotent`).

**Quy trình thực hiện dịch vụ chăm sóc & đồng bộ 2 chiều (LT ↔ NVCS ↔ QL):**

- **Tiến trình 4 bước của NVCS** (chi tiết hóa vòng đời `Chờ → Đang làm → Xong`): (1) *Tiếp nhận* — kiểm tra lông, da, tai/móng và tâm lý bé → (2) *Đang thực hiện* — tắm thảo mộc, spa, cắt tỉa tạo kiểu hoặc vệ sinh cơ bản → (3) *Hoàn thiện* — sấy khô êm ái, chải tạo kiểu và kiểm tra cuối → (4) *Hoàn tất & bàn giao (`Xong`)* — ghi nhận tình trạng bé sau dịch vụ và tính 1 ca hoàn thành.
- **Đồng bộ Lễ tân ↔ NVCS:** khi LT bấm `Đã đến`, lịch trên cổng NVCS giữ trạng thái sẵn sàng kèm nhãn `"Đã check-in tại quầy"` và hiển thị cân thực tế / giá điều chỉnh tại quầy (nếu có); khi LT đánh dấu `Không đến`, lịch trên cổng NVCS tự đóng.
- **Đơn trả sau (`postpaid`):** NVCS bấm hoàn tất dịch vụ (`Đang làm → Xong`) trước, hệ thống mời khách thanh toán tại quầy để LT thu tiền và xuất hóa đơn (NVCS không thu tiền và không tự đóng dấu xác nhận thay QL).
- **Điều phối sự cố:** NVCS không đơn phương hủy lịch của khách; khi phát sinh sự cố đột xuất chỉ gửi yêu cầu **"Báo Quản lý điều phối (Nghỉ đột xuất)"**.

**Quy trình khám lâm sàng & đồng bộ 2 chiều của Bác sĩ (LT ↔ BS ↔ QL):**

- **Quy trình lâm sàng 2 bước của BS** (mở khóa khi ca chuyển sang `Đang làm`):
  1. *Bước 1 – Phiếu khám lâm sàng (SOAP):* đo chỉ số sinh tồn (cân nặng thực tế, nhiệt độ), ghi triệu chứng, chẩn đoán, mức độ bệnh (nhẹ/nặng), lời dặn và lịch tái khám/tiêm phòng/tẩy giun → tự sinh bản ghi Sổ sức khỏe và tự động đồng bộ cân nặng thực tế + khóa y tế (`medicalLocked = true`) vào hồ sơ thú cưng. Ngày ghi bệnh án dùng **ngày địa phương (UTC+7)** đồng bộ với ngày phát hành đơn thuốc để tránh lệch ngày lúc `00:00–06:59`.
  2. *Bước 2 – Kê đơn thuốc điện tử:* tự động liên kết với bệnh án của cùng lịch hẹn hoặc cùng thú cưng trong ngày; đọc tồn kho realtime từ **Kho thuốc chung** (ẩn SKU ngừng kinh doanh, ưu tiên mặc định thuốc còn tồn `stock > 0`, chặn phát hành nếu có thuốc hết hàng, cảnh báo khác loài theo 4 loài chuẩn và khóa cứng `0` lượt mua lại trực tuyến đối với ca bệnh nặng).
- **Đóng ca khám & chống ghi trùng (Idempotency):** hệ thống chặn hoàn thành lặp trên lịch hẹn đã ở trạng thái `completed` hoặc `cancelled`, đảm bảo mỗi dòng dịch vụ chỉ đếm ca và ghi lịch sử hoàn thành đúng một lần.
- **Đồng bộ Lễ tân ↔ Bác sĩ & Đơn trả sau (`postpaid`):** khi LT bấm `Đã đến`, cổng BS hiển thị nhãn `"Đã check-in tại quầy"`; với đơn trả sau, BS hoàn tất ca khám (`Đang làm → Xong`) trước rồi hệ thống mời khách thanh toán dịch vụ (và đơn thuốc nếu lấy tại quầy) tại quầy Lễ tân.
- **Điều phối sự cố:** gỡ bỏ hoàn toàn chức năng BS tự đề xuất đổi giờ hẹn của khách trên Drawer lịch hẹn; khi phát sinh sự cố đột xuất không thể khám ca đã gán, BS dùng luồng **"Báo Quản lý điều phối (Nghỉ đột xuất)"**.

## 5. Hủy, không đến và violation

Trả trước bị trừ tiền theo mốc thời gian; trả sau không phạt tiền mà bị tước quyền `"trả sau"` khi vi phạm đủ số lần. Đây là thay đổi có chủ đích so với **v1.3** (trước đây hủy và đổi không phí, không giới hạn) và cần mentor xác nhận. Do đã nâng thời gian đặt trước online tối thiểu lên **3 giờ**, khách đặt online không rơi vào tình huống vừa đặt xong đã bị phạt hủy.

| Tình huống | Trả trước (đã `payment_status = paid`) | Trả sau (tiền mặt tại quầy) |
| --- | --- | --- |
| Hủy trước `≥ 3 giờ` | Hoàn 100% (`refunded`) | Không phát sinh |
| Hủy trong vòng `< 3 giờ` | Giữ 30% giá trị đơn, hoàn 70% (`partial_fee`) | Không phạt tiền (`0đ`), tính `1 violation` |
| Không đến (quá 15 phút) | Mất 100% số tiền đã trả (`partial_fee`, `fee = 100%`) | Không phạt tiền (`0đ`), tính `1 violation` |

**Khóa trả sau & mở khóa (chống lách luật)**

- `violation_count` = số lần hủy dưới 3 giờ (đối với đơn trả sau) và `Không đến`, đếm các vi phạm phát sinh sau mốc `MAX(now - 90 ngày, violation_reset_at)`.
- Đạt `2` thì **khóa lựa chọn `"trả sau"`** (ghi Audit Log):
  - Khi đặt **Online**, khách **bắt buộc thanh toán trước online** trong 10 phút giữ chỗ (không cho chọn tiền mặt nộp sau tại quầy).
  - Khi đặt **Tại quầy (LT)**, khách vẫn được hỗ trợ đặt nhưng phải thanh toán tiền ngay trước khi làm (`payment_status = paid`) mới tính là trả trước.
- **Mở khóa & reset bộ đếm:** tự động mở lại quyền trả sau khi khách hoàn thành **2 ca đã thanh toán trước thực tế** (`payment_timing = prepaid` **VÀ** `payment_status = paid`, không tính đơn online hẹn trả tiền mặt) tính từ sau mốc bị khóa. Tại thời điểm mở khóa, hệ thống ghi nhận `violation_reset_at = now`, reset bộ đếm vi phạm chu kỳ về `0` (tránh bị khóa lại ngay bởi 2 vi phạm cũ trong cửa sổ 90 ngày) và ghi Audit Log.
- Đổi lịch trước `≥ 3 giờ` không tính vi phạm và không phí.
- Ngoại lệ miễn phạt: trường hợp khách hủy do **không đồng ý giá mới sau khi cân thực tế tại quầy** không tính phí hủy (`0đ`, hoàn 100% dòng dịch vụ đó nếu đã trả trước) và không cộng `violation`.

**Check-in, ân hạn 15 phút, Dời 30 phút và Không đến (thứ tự xử lý)**

- **Trong khoảng ân hạn `0–15 phút` sau giờ hẹn (`T` → `T + 15p`):** Đơn giữ nguyên `Đã xác nhận`; LT có 2 nút thao tác:
  1. **`Khách đã đến` (Check-in):** chuyển `Đã đến`.
  2. **`Dời 30 phút`:** áp dụng khi khách báo đến trễ, **tối đa 1 lần mỗi đơn** (chặn tràn vào `12:00–13:00` hoặc quá `17:00`, kiểm tra trùng ca nhân sự và tự gán nhân sự rảnh ít ca nhất nếu trùng). Sau khi dời sang `T' = T + 30p`, mốc ân hạn tự động tính lại là `T' + 15p`.
- **Quá `15 phút` sau giờ hẹn chưa Check-in & chưa Dời 30 phút:** hệ thống tự chuyển sang `Không đến`, nhả slot và ẩn nút `Dời 30 phút`.
- Khách làm ngay tại quầy (`walk_in_now`) không có trạng thái `Không đến`.
- **Hoàn tác `"Không đến"`:** LT có nút hoàn tác kèm **lý do bắt buộc** và Audit Log để sửa trường hợp đánh dấu oan. Khi hoàn tác, hệ thống:
  1. **Kiểm tra lại slot/nhân sự sau khi đã nhả slot** (nếu nhân sự cũ đã nhận ca khác thì tự gán nhân sự rảnh cùng chuyên môn theo quy tắc ít ca nhất hoặc yêu cầu chọn khung giờ khác để tránh trùng lịch).
  2. **Trừ lại `violation`** của đơn đó.
  3. **Khôi phục `payment_status = paid` và `cancellation_fee = 0`** nếu là đơn đã trả trước (không trừ mất 100% tiền của khách).
- Khách có vi phạm: LT thấy cảnh báo khi đặt giúp, không bị chặn.
- Thông báo lý do rõ ràng khi khách bị khóa trả sau.

**Hạn chế đã biết:** khách đổi số điện thoại hoặc tạo tài khoản mới sẽ qua mặt được bộ đếm; chấp nhận trong lần này.

## 6. Lễ tân

Lễ tân xử lý khách tại quầy và dùng phiên đăng nhập của chính mình, không bao giờ đăng nhập bằng tài khoản của khách.

**Việc của LT**

1. Gõ SĐT (chuẩn hóa 10 số, tìm trước khi tạo để không trùng). Khách mới: nhập tên và SĐT, tạo bản ghi khách không cần mật khẩu.
2. Tạo hồ sơ thú cưng nhanh (tên, loài thuộc 4 loài hợp lệ: Chó, Mèo, Chuột, Thỏ; cân nặng và dị ứng tính là `"do khách khai"`). Đặt lịch giúp trên **giao diện POS quầy 1 màn hình** dành riêng cho Lễ tân (`/receptionist/booking`, tối ưu tốc độ tiếp nhận trực tiếp, dùng chung 100% bộ máy tính giá, khóa giờ nghỉ trưa `12:00–13:00` và tự gán nhân sự với kênh Online; đồng thời vẫn mở quyền cho LT truy cập `/dat-lich` khi cần). Hỗ trợ chọn 1 hoặc nhiều dịch vụ nối tiếp và 2 chế độ: **"Làm ngay"** (không cần đặt trước 3h, trạng thái đầu `Đã đến`) và **"Hẹn giờ"** (không giữ chỗ 10 phút, trạng thái đầu `Đã xác nhận`). Đơn tự ghi kênh = quầy và người thao tác = LT.
3. Check-in khách đã đặt online; **"Dời 30 phút"** (tối đa 1 lần/đơn) khi khách đến trễ trong thời gian ân hạn 15 phút; đánh dấu và **hoàn tác `"Không đến"`** kèm lý do.
4. Thu tiền, bấm `"Đã thu"`, xuất hóa đơn cho khách trả sau; **thu tiền đơn thuốc BS vừa kê gắn liền với lịch hẹn đó** (áp dụng cho cả khách vãng lai lẫn khách online muốn lấy thuốc ngay sau khám — khi bấm `"Đã thu"`, hệ thống tự trừ kho chung loại `Bán (-)` kèm mã đơn thuốc); ghi nhận hoàn và bù tiền thủ công.
5. Nếu khách muốn dùng web, LT tạo tài khoản giúp theo yêu cầu của khách; khách tự đặt mật khẩu hoặc xác thực bằng OTP. Hệ thống **nâng cấp trực tiếp trên hồ sơ khách hiện có** (và tương tự khi khách tự đăng ký web trùng SĐT vãng lai chưa có tài khoản) để **gộp và giữ nguyên toàn bộ thú cưng, lịch sử khám và lịch sử `violation`**.
6. Xin nghỉ phép gọn nhẹ (`/receptionist/leave`): gửi đơn nghỉ nguyên ngày (nghỉ luân phiên / nghỉ ốm / nghỉ không lương, quỹ 4 ngày/tháng, chặn tuần đã qua, Chủ Nhật & trùng ngày), tự hủy khi còn `Chờ duyệt`, đồng bộ 2 chiều lên bảng duyệt đơn và bảng quỹ nghỉ của Quản lý (kèm cảnh báo trống quầy, không khóa slot đặt lịch khách hàng).

**Điều chỉnh giá theo cân nặng thực tế**

- Màn hình Lễ tân hiển thị cả cân nặng do **BS cập nhật** lẫn nút nhập **"Cân thực tế tại quầy (kg)"** (dùng cho các ca Spa/Tắm/Chăm sóc không có BS). Hệ thống tự tính giá mới theo bảng giá và hạng cân. LT chỉ xác nhận, không nhập giá tay (tránh báo sai giá).
- Giá đổi thì LT báo chủ thú cưng. Khách đồng ý thì làm; **không đồng ý thì trả bé lại đối với dòng dịch vụ đó: hủy miễn phí `0đ`, không cộng `violation` và hoàn 100% tiền dòng dịch vụ đó nếu đã trả trước** (nếu lịch hẹn gồm nhiều dịch vụ và khách vẫn muốn làm các dịch vụ còn lại thì chỉ hủy & hoàn riêng dòng bị đội giá).
- Trả sau: hóa đơn ra theo giá mới. Trả trước, cân tăng: thu bù phần chênh. Trả trước, cân giảm: hoàn phần chênh (thủ công).
- Mọi lần điều chỉnh ghi log: cân cũ và mới, giá cũ và mới, người làm, lý do.

**Xin nghỉ phép (gọn nhẹ):** LT gửi đơn xin nghỉ nguyên ngày trên web (quỹ tối đa 4 ngày/tháng, không xin cho tuần đã qua) để Quản lý duyệt và tính công tập trung. Do LT không nằm trong bộ máy tự gán lịch hẹn khách hàng nên đơn nghỉ của LT **không** bị chặn bởi lịch hẹn khách và **không** khóa slot đặt lịch; hệ thống gắn cảnh báo **"trống quầy — cần bố trí người trực thay"** khi hiển thị cho Quản lý duyệt.

**LT không làm:** kê đơn hay sửa sổ sức khỏe, bán lẻ phụ kiện/thức ăn Shop tại quầy, quản lý Shop và kho, xem dashboard, duyệt nghỉ phép, ghi đè quy tắc đặt lịch, gỡ khóa trả sau, khôi phục thú cưng đã ẩn, xóa dữ liệu.

**Chưa làm lần này:** POS bán lẻ hàng hóa Shop (thức ăn, phụ kiện, đồ chơi) tại quầy — LT chỉ thu tiền dịch vụ và **đơn thuốc kê đơn gắn liền với lịch hẹn của BS**; LT không nằm trong bộ máy tự gán lịch hẹn và không áp dụng luồng đổi nhân sự/bồi thường khi nghỉ đột xuất.

## 7. Lịch làm việc, nghỉ phép và nghỉ đột xuất

BS và NVCS dùng chung một bộ quy tắc: lịch Thứ Hai đến Thứ Bảy, `08:00–17:00`, nghỉ trưa `12:00–13:00`, không tăng ca, không đổi ca. **Chỉ còn hình thức làm việc toàn thời gian (Full-time)** (gồm 2 vai trò chuyên môn là BS và NVCS).

> **Riêng với Lễ tân (LT):** Áp dụng quỹ **4 ngày nghỉ nguyên ngày/tháng** (không xin cho tuần đã qua, chặn Chủ Nhật) và gửi đơn duyệt chung trên màn hình Quản lý nhân sự để đồng bộ chấm công. Do LT không nằm trong bộ máy tự gán booking, đơn nghỉ của LT **không** bị chặn bởi lịch hẹn khách, **không** khóa slot đặt lịch khách hàng và **không** áp dụng quy trình đổi nhân sự/bồi thường 15% khi nghỉ đột xuất; Quản lý nhận cảnh báo **"trống quầy — cần bố trí người trực thay"** khi duyệt đơn.
> **Riêng với Quản lý (QL) & Admin (AD):** Không dùng luồng xin nghỉ phép trên hệ thống trong ver1.4.1 (báo trực tiếp ngoài hệ thống).

**Nghỉ phép thường (BS & NVCS)**

- Nghỉ nguyên ngày, tối đa **4 ngày mỗi tháng**, không xin cho tuần đã qua, gửi trước tối thiểu **2 ngày**.
- **Chặn ngày Chủ Nhật:** do lịch làm việc cố định T2–T7 (Chủ Nhật nghỉ cố định), hệ thống chặn gửi đơn nghỉ phép thường và tạo nghỉ đột xuất vào Chủ Nhật để tránh trừ oan quỹ 4 ngày/tháng.
- **Điều kiện theo lịch hẹn trong ngày xin nghỉ (đã chỉnh để dùng được thực tế):**
  - **Tạm giữ (Hold) khi gửi đơn:** ngay khi đơn ở trạng thái `Chờ duyệt`, hệ thống tạm không tự gán thêm lịch mới cho nhân sự đó trong ngày xin nghỉ (nếu QL từ chối hoặc NV tự hủy đơn thì tự nhả lại).
  - Nếu ngày đó đã có **lịch khách chọn đích danh** (`is_preferred_staff = true`) cho nhân sự đó → **chặn xin nghỉ phép thường** (chỉ xử lý qua Nghỉ đột xuất nếu bất khả kháng).
  - Nếu ngày đó chưa có lịch hoặc **chỉ có lịch hệ thống tự gán (`is_preferred_staff = false`)** → **cho phép gửi đơn xin nghỉ**; khi QL bấm **Duyệt**, trong 1 transaction hệ thống tự chuyển toàn bộ các lịch tự gán đó sang đồng nghiệp cùng vai trò (BS/NVCS) rảnh có **ít ca nhất trong ngày** rồi khóa slot ngày nghỉ (nếu tại lúc duyệt không còn đồng nghiệp nào rảnh nhận thay thì hệ thống báo lỗi, không cho duyệt).
- Đã duyệt thì slot khóa ngay và không thể hủy.
- **Minh bạch quỹ nghỉ tháng & kiểm tra xung đột lịch tuần:** thẻ quỹ nghỉ tách bạch 4 nhóm (*Nghỉ luân phiên*, *Nghỉ ốm / Không lương*, *Nghỉ đột xuất*, *Còn lại*) bảo đảm tổng khớp 100% số ngày đã dùng; lịch tuần phát hiện trùng giờ theo khoảng thời lượng thực tế `[giờ bắt đầu, giờ bắt đầu + thời lượng dịch vụ)` và cảnh báo nếu ca tràn vào khung nghỉ trưa cố định `12:00–13:00`.
- Ca bổ sung khi quá đông: QL tạo ca cho một ngày và khung giờ; chưa làm gợi ý tự động.

**Nghỉ đột xuất**

1. Nhân sự gọi video call / báo gấp với QL.
2. QL tạo bản ghi nghỉ đột xuất trong bảng nghỉ phép với số ngày cụ thể (chặn Chủ Nhật); số ngày này trừ vào quỹ 4 ngày/tháng. **Nếu nhân sự đã dùng hết 4 ngày/tháng, hệ thống vẫn cho QL tạo nghỉ đột xuất** và tự gắn cờ **`Vượt hạn mức (Nghỉ không lương)`** để kế toán đối chiếu cuối tháng. Slot khóa ngay lập tức.
3. Hệ thống kiểm tra toàn bộ các lịch hẹn của nhân sự trong những ngày đó.
4. **Lịch không chọn đích danh (`is_preferred_staff = false`):**
   - Nếu có đồng nghiệp cùng vai trò (BS/NVCS) rảnh → hệ thống tự chuyển sang người rảnh theo đúng quy tắc chung Mục 4 (**ít ca nhất trong ngày, hòa thì theo mã nhân viên**).
   - Nếu **không tìm được người thay** → chuyển lịch sang trạng thái `Cần điều phối`; QL/LT liên hệ khách chọn **dời sang khung giờ/ngày gần nhất (+ voucher 15%)** hoặc **hủy miễn phí, hoàn 100%, `0 violation`**.
5. **Lịch khách đặt đích danh (`is_preferred_staff = true`) và có nhân sự thay thế:** gọi khách, khách chọn một trong hai phương án:
   - **Phương án 1:** đổi sang nhân sự thay thế, giữ nguyên giờ; **hủy khoản phụ phí +10% chọn đích danh** (hoàn lại nếu đã trả trước) và **giảm thêm 15%** giá dịch vụ đã đặt.
   - **Phương án 2:** dời lịch với đúng nhân sự đã chọn theo ngày nhân sự đó quay lại, áp **voucher 15%**.
6. NVCS nghỉ đột xuất xử lý giống BS (nếu khách không chọn đích danh thì không có khoản hủy/hoàn 10%).
7. **Thao tác thực tế trên cổng Quản lý (ver1.4.1):** QL dùng nút **"Tạo nghỉ đột xuất"** trực tiếp trên bảng duyệt đơn nghỉ phép (chặn Chủ Nhật, trừ quỹ 4 ngày/tháng hoặc gắn cờ vượt hạn mức nghỉ không lương, khóa ca ngày đó ngay, gắn cờ `"Chờ Quản lý điều phối (Nghỉ đột xuất)"` cho toàn bộ lịch bị ảnh hưởng và liệt kê danh sách ca kèm lối tắt sang màn hình Lịch hẹn để đổi nhân sự NVCS/BS thay thế; bảng duyệt đơn hỗ trợ lọc tách riêng *Nghỉ phép thường* và *Nghỉ đột xuất*).

**Mặc định đã chốt:** khách không trả lời sau 24 giờ thì áp Phương án 1 (nếu có người thay); nếu không tìm được người thay thì chuyển Phương án 2 hoặc hủy và hoàn 100% (`0 violation`). Lịch dời cũng không được xếp vào `12:00–13:00`.

## 8. Kho chung, Shop, nhập hàng và nhà cung cấp

Hộp thuốc riêng của bác sĩ bỏ hẳn; mọi thuốc và sản phẩm nằm trong một kho chung. `"Kệ thuốc bác sĩ"` chỉ còn là cách xem trên kho đó, lọc theo bác sĩ.

**Sổ cái kho (`stock_movements`):** chỉ thêm, không sửa, không xóa. Tồn bán được hiện tại = tổng số lượng các dòng có tác động vào kho bán.

| Loại giao dịch | Tác động tồn bán | Khi nào |
| --- | --- | --- |
| Nhập | `+` | QL xác nhận nhập kho từ đơn nhập PO (chỉ cộng hàng đạt chất lượng) |
| Bán | `−` | Đơn Shop được xác nhận đóng gói (`packing`) hoặc LT bấm `"Đã thu"` đơn thuốc kê theo lịch hẹn tại quầy |
| Xuất dùng | `−` | Dòng khám hoàn thành, thuốc dùng tại phòng khám; ghi kèm mã bác sĩ và lịch hẹn |
| Hoàn bán | `+` | Chỉ dùng cho **đơn hủy trước khi giao** hoặc **hàng khách trả còn nguyên seal/bán lại được** |
| Trả hàng lỗi | `0` (sổ riêng) | **Hàng lỗi / hư hỏng / bể vỡ** khách trả hoặc phát hiện khi nhập PO — ghi log đối chiếu & hoàn tiền, **tuyệt đối không cộng lại vào tồn bán được** |
| Điều chỉnh | `±` | Hao hụt, hết hạn, kiểm kê; bắt buộc có lý do và log |

- **Nhập kho PO đồng bộ trực tiếp vào Kho chung (QL → Kho chung → BS):** Khi QL xác nhận nhập kho đơn PO cho thuốc/vắc-xin, số lượng thực nhận đạt chuẩn được **cộng trực tiếp vào tồn Kho thuốc chung** (`SHOP_PRODUCTS.stock`) và ghi 1 dòng `+` vào sổ cái `stock_movements` (bỏ hoàn toàn cơ chế chia đều lên kệ từng BS ở v1.3) → mọi Bác sĩ thấy tồn kho tăng ngay lập tức tại cả màn hình *Kho thuốc chung* lẫn *Kê đơn thuốc*.
- **Xuất dùng tại phòng khám, chống xuất trùng & chặn xuất âm (BS → Kho chung):** BS ghi nhận thuốc xuất dùng bắt buộc kèm **Mã bác sĩ** và **Mã lịch hẹn** (trừ trực tiếp tồn Kho chung); hệ thống **chặn xuất đúp** cùng một loại thuốc trên cùng một mã lịch hẹn. Nếu số lượng nhập vượt quá tồn kho chung hiện có, hệ thống **chặn xuất âm ngay lập tức** và hiển thị nút 1-click **"Báo Quản lý bổ sung kho ngay"** (tự tạo yêu cầu bổ sung + gửi thông báo cảnh báo kho lên QL). Khóa dòng sản phẩm trong transaction khi trừ.
- **Thuốc kê mang về & khóa bán thuốc kê đơn trên Shop:**
  - Mọi sản phẩm thuốc kê đơn gắn cờ `requiresPrescription = true` hiển thị nhãn **"Thuốc kê đơn"** và **khóa nút mua tự do trên Shop** (người không có đơn không thể tự thêm vào giỏ).
  - Khách có tài khoản mua/mua lại trực tiếp từ nút **"Mua thuốc theo đơn"** trong Sổ sức khỏe (tuân thủ giới hạn lượt mua lại do BS cấp; ca bệnh nặng = `0` lượt).
  - Khách vãng lai (và khách online muốn lấy thuốc ngay sau khi khám) được **LT thu tiền đơn thuốc BS kê gắn với lịch hẹn ngay tại quầy** (trừ kho chung loại `Bán -`). Thuốc dùng trực tiếp trong lúc khám/tiêm tính vào giá dịch vụ và trừ kho theo loại `Xuất dùng (-)`.
- **Luồng đơn hàng Shop:**
  - Thanh toán: `COD` (thanh toán khi nhận hàng) hoặc `Banking / Online` (sandbox).
  - Giao nhận: Giao hàng tận nơi qua đơn vị vận chuyển bên thứ 3 bên ngoài (QL cập nhật trạng thái đơn thủ công, không xây role Shipper) hoặc Nhận tại quầy.
  - Vòng đời đơn Shop: `Chờ xác nhận (pending)` → `Đang đóng gói (packing)` *(trừ kho `Bán -`)* → `Đang giao (shipping)` → `Đã giao (delivered)` → `Khách đã nhận (received)`. Nhánh phụ: `Đã hủy` (hoàn tồn `Hoàn bán +`), `Đổi trả (returned)` (nếu hàng lỗi ghi `Trả hàng lỗi` — không cộng lại kho bán).
- **Màn hình Bác sĩ & Quy trình duyệt đề xuất của Quản lý (BS → QL → PO NCC):**
  - Màn hình BS (`Kho thuốc chung & Sổ xuất dùng`): xem tồn kho chung (chỉ đọc), lọc **"Thuốc tôi đã dùng"** từ sổ cái `stock_movements`, ghi nhận xuất dùng tại phòng khám, gửi yêu cầu **bổ sung kho / đề xuất thuốc mới** hoặc **đề xuất ngừng kinh doanh** cho QL (BS không tự xóa sản phẩm).
  - **Duyệt đề xuất bổ sung kho:** Khi BS gửi yêu cầu bổ sung (kể cả lúc tồn kho chung = `0`), QL duyệt được bình thường (**không bị chặn thiếu kho** và **không trừ ngược kho chung**), đồng thời bấm ngay nút **"Tạo PO NCC"** tại dòng yêu cầu để đặt nhập hàng bổ sung về Kho chung.
  - **Duyệt đề xuất thuốc/vắc-xin mới:** QL duyệt sẽ tạo SKU mới ở trạng thái `stock = 0` gắn NCC dược mặc định để QL tạo đơn PO nhập hàng.
  - **Duyệt đề xuất ngừng kinh doanh:** QL kiểm tra ràng buộc (tồn kho, yêu cầu chờ duyệt, đơn thuốc còn lượt mua lại, đơn hàng/PO đang mở) rồi chuyển trạng thái ẩn khỏi Shop (`isHidden = true`), bảo toàn toàn bộ lịch sử.
  - **Bảng đối chiếu trên màn hình QL (`Kho thuốc & Đề xuất BS`):** hiển thị **Tồn kho chung** kèm thống kê **Sản lượng đã xuất dùng theo từng Bác sĩ** (thay cho bảng "Kệ từng Bác sĩ" ở v1.3).

**Gợi ý nhập**

```latex
\text{Tốc độ bán/ngày} = \frac{\text{Bán} + \text{Xuất dùng}}{\text{Số ngày còn hàng của kỳ}}
```

```latex
\text{Gợi ý nhập} = \max\big(0,\ \text{Tốc độ} \times (\text{Ngày giao} + \text{Ngày dự trữ}) - \text{Tồn hiện tại} - \text{Hàng đang đặt chưa nhận}\big)
```

**Đơn nhập và nhà cung cấp**

- Vòng đời: `nháp` → `đã gửi` → `NCC xác nhận / điều chỉnh (hoặc từ chối)` → `đang giao` *(SUP cập nhật)* → `đã nhận` *(QL kiểm đếm xác nhận)* → `đã nhập kho` *(QL bấm nhập kho chung)*.
- Màn hình chi tiết đơn có thanh tiến trình giao hàng, cố định 5 mốc: `Đã gửi`, `NCC xác nhận`, `Đang giao`, `Đã nhận`, `Đã nhập kho`.
- NCC chỉnh số lượng thì QL phải bấm chấp nhận. Giao thiếu thì QL chọn chờ phần còn lại hoặc đóng đơn. Hàng lỗi ghi riêng (`Trả hàng lỗi`), không vào kho bán.
- Mỗi sản phẩm có một nhà cung cấp mặc định. Tài khoản SUP chỉ thấy đơn của nhà cung cấp mình.
- Màn hình SUP do người làm kho (D) làm luôn.

**Chưa làm lần này:** công nợ và đối soát, hạn sử dụng theo lô, danh mục hàng riêng của nhà cung cấp, thông báo email cho SUP, dự báo theo mùa.

## 9. Lương, Audit Log và thống kê

**Lương:** QL xem và sửa mức lương của nhân viên cấp dưới (**BS, NVCS, LT**), kèm log sửa lương (chỉ thêm, không sửa). **Chặn cứng ở Backend không cho QL tự sửa lương của chính mình** (`targetUserId !== currentUserId`); lương QL do AD/kế toán quản lý ngoài hệ thống. Hệ thống không tự tính lương; việc tính lương do kế toán làm ngoài hệ thống. Số ca của bác sĩ vẫn hiển thị để tham khảo. Không có quy tắc lương riêng cho NVCS trong lần này.

**Audit Log:** ghi ai, lúc nào, trước và sau thay đổi, cho đầy đủ các thao tác sau:

- Thú cưng và sổ sức khỏe (gồm cập nhật 4 trường y tế, **ẩn thú cưng của KH và khôi phục thú cưng của QL**).
- Khách hàng (gồm **khóa và mở khóa quyền trả sau**, reset `violation_reset_at`).
- **Thay đổi bảng giá dịch vụ và cấu hình hạng cân** (QL).
- **AD tạo/sửa/khóa tài khoản và thay đổi phân quyền**.
- Đơn đặt hàng nhà cung cấp và chi tiết đơn (gồm NCC chỉnh số lượng, SUP chuyển `Đang giao`, QL xác nhận `Đã nhận` / `Nhập kho`).
- Đổi trả và hoàn tiền khách hàng (phân biệt `Hoàn bán +` vs `Trả hàng lỗi`).
- Điều chỉnh giá theo cân nặng.
- Sửa lương (chỉ cấp dưới BS/NVCS/LT).
- Nghỉ đột xuất và đổi nhân sự.
- Thao tác của LT: tạo/nâng cấp khách vãng lai, tạo hồ sơ thú cưng nhanh, đặt/hủy/đổi lịch, dời 30 phút, hoàn tác không đến, điều chỉnh giá theo cân thực tế, thu tiền dịch vụ & đơn thuốc theo ca, hoàn/bù tiền, xuất hóa đơn, gửi/hủy đơn xin nghỉ phép (và kết quả duyệt/từ chối của QL).
- Thao tác của NVCS: tiếp nhận ca, bắt đầu ca, cập nhật tiến trình 4 bước chăm sóc, hoàn tất dịch vụ (`Xong`), gửi yêu cầu Quản lý điều phối ca khi đột xuất, gửi/hủy đơn xin nghỉ phép (khi còn chờ duyệt), và báo cáo đánh giá vi phạm gửi Quản lý nghiệp vụ.
- Thao tác của BS: cập nhật 4 trường y tế thú cưng & xác nhận ghi chú bổ sung từ khách (`giá trị cũ → giá trị mới`, mã BS, nguồn cập nhật, thời điểm), lập bệnh án SOAP & phát hành đơn thuốc điện tử, tiếp nhận/bắt đầu/hoàn tất ca khám (có chống trùng idempotency), gửi yêu cầu Quản lý điều phối ca khi đột xuất, ghi nhận xuất dùng thuốc tại phòng khám (`stock_movements` kèm mã BS & mã lịch hẹn), gửi/hủy đề xuất kho thuốc (bổ sung / thuốc mới / ngừng KD) và kết quả duyệt của QL, gửi/hủy đơn xin nghỉ phép, báo cáo đánh giá vi phạm.
- Điều chỉnh tồn kho.

**Thống kê (QL, AD chỉ xem — chốt 3 màn cốt lõi cho ver1.4.1):** 3 màn hình có filter thời gian: (1) Doanh thu dịch vụ (lọc thêm theo kênh online và quầy), (2) Hiệu suất bác sĩ & công suất lịch hẹn (số ca, không dùng tính lương), (3) Tồn kho, sản phẩm bán chạy và gợi ý nhập. Dữ liệu mẫu 30 ngày tạo bằng seed script chạy đúng quy tắc nghiệp vụ, không nhập tay.

## 10. Ước lượng, tiến độ, checklist kỹ thuật và câu hỏi chốt

**Cập nhật tiến độ thực tế tại mốc 22/11/2026:**
- Ước lượng gốc (19/11) là **115 ngày công** cho phạm vi đầy đủ (nếu cộng đệm 10–15% sẽ lên ~125–130 ngày công so với năng lực gốc 95 ngày công từ 17/11–12/12).
- Tại mốc **22/11/2026** (còn ~15 ngày làm việc đến 12/12, khóa tính năng **10/12**), phần nền Frontend và khung 12 module Backend đã có sẵn phần lớn, đồng thời **ver1.4.1 đã chốt cắt giảm 7 ngày công** (giữ nguyên phụ phí +10% chọn đích danh):
  - Rút Dashboard từ 5 xuống **3 màn cốt lõi** (-5 ngày công).
  - **Nghỉ đột xuất bản gọn**: QL tạo bản ghi, tự chuyển ca không đích danh (hoặc gắn cờ `Cần điều phối`) và liệt kê ca ảnh hưởng cho QL/LT xử lý tay (-2 ngày công).
- **Giải tỏa nút thắt cổ chai Đặt lịch lõi (24 ngày công) trước checkpoint 26/11:** tách làm 2 luồng song song bám chung DTO `Booking`:
  - *Luồng A1:* Core đặt lịch (giỏ dịch vụ nối tiếp, tự gán nhân sự, khóa slot transaction, giữ chỗ 10p).
  - *Luồng A2:* Hậu đặt lịch (hủy/đổi lịch, `violation_count` + `violation_reset_at`, check-in/dời 30p/hoàn tác không đến, điều chỉnh giá theo cân).

**Checklist đồng bộ kỹ thuật Backend / DB (trước checkpoint 26/11):**

- [ ] **DB Schema:** Thêm `violation_reset_at` (bảng customers); tách riêng `appointment_status` và `payment_status` (bảng appointments); thêm `is_preferred_staff` (boolean); thêm `delayed_30m_count` (int, max 1); tách `stock_movements.movement_type` có `defective_return` (tác động tồn bán = `0`).
- [ ] **Backend Guards:** Chặn đặt online `< 3 giờ` (`isCounterChannel = false`); chặn QL tự sửa lương chính mình (`targetUserId !== req.user.id`); chặn ẩn thú cưng khi đang có ca `Đã đến`/`Đang làm`; chặn mua sản phẩm `requires_prescription = true` trên Shop nếu không gắn `prescription_id` hợp lệ.
- [ ] **Kiểm kê API thực tế:** Đối chiếu nhanh 12 module `backend/src` đã nối DB thật vs. phần còn đang dùng mock localStorage ở Frontend để phân công dứt điểm.

**Rủi ro chính**

- Tỷ lệ API Backend đã nối DB thật ở phần nền cần xác nhận ngay đầu tuần 2.
- Đặt lịch lõi trễ sẽ chặn dashboard và hoàn thành dịch vụ → kiểm soát chặt tại **checkpoint 26/11**.
- Thanh toán trả trước phải xong sớm vì khóa trả sau, hoàn và bù đều dựa vào nó.
- Thành viên nghỉ hoặc ốm; mentor phản hồi chậm; phát sinh thêm tính năng sau mốc khóa **10/12**.

**Hạn chế đã biết (ghi vào tài liệu)**

- Chỉ 4 loài; mọi NVCS làm được mọi dịch vụ chăm sóc (chưa có bảng kỹ năng).
- Tự gán theo từng dòng (greedy), có thể bỏ lỡ cách xếp tối ưu toàn cục.
- Bộ đếm violation bị qua mặt khi đổi số điện thoại.
- Chưa có hạn sử dụng theo lô, chưa có quy tắc lương NVCS.
- Hoàn và bù tiền thủ công, dựa vào log để đối chiếu.

**Câu hỏi cho mentor**

1. Bỏ Hộp thuốc riêng, dùng kho chung ghi mã bác sĩ ở mỗi lần xuất dùng: có đồng ý không? Có loại thuốc nào cần sổ theo dõi riêng từng bác sĩ không?
2. Bỏ duyệt bằng cấp trên hệ thống (xác minh thủ công ngoài hệ thống trước khi cấp tài khoản BS) có ổn với yêu cầu của phòng khám thú y không?
3. Nâng đặt trước online tối thiểu lên 3 giờ, hủy dưới 3 giờ giữ 30% với khách trả trước, và khóa trả sau sau 2 violation: có chấp nhận thay đổi so với **v1.3** không?
4. Giảm 15% hoặc voucher 15% khi nghỉ đột xuất là chi phí thật: có đồng ý mức này không?

**Các mục nhóm đã chốt (cập nhật ver1.4.1 by Thùy)**

- **[Đã chốt]** Đặt trước online tối thiểu **3 giờ** (Phương án A — khớp mốc phạt hủy 3 giờ; khách cần gấp trong vòng 3 giờ liên hệ quầy/hotline để LT đặt tại quầy).
- **[Đã chốt]** Chặn lách luật khóa trả sau: bỏ lựa chọn `"tiền mặt nộp trước tại quầy"` trên kênh Online; khách bị khóa đặt online bắt buộc trả trước online; tại quầy chỉ tính mở khóa khi đã thu tiền ngay (`payment_status = paid`). Mở khóa xong ghi `violation_reset_at = now` và reset bộ đếm chu kỳ về `0`.
- **[Đã chốt]** Tách riêng `appointment_status` và `payment_status`; đơn Online trả sau tạo thẳng `Đã xác nhận` + `Chưa thanh toán` trong 1 transaction (không qua giữ chỗ 10p).
- **[Đã chốt]** Giữ **phụ phí `+10%` giá dòng dịch vụ khi chọn đích danh nhân sự (BS/NVCS)** (khi nghỉ đột xuất chọn Phương án 1 thì hủy/hoàn khoản +10% này và giảm thêm 15%); rút Dashboard còn 3 màn cốt lõi; QL không tự sửa lương chính mình; không xây luồng nghỉ phép web cho QL/AD.
- **[Đã chốt]** Nghỉ phép thường cho phép gửi khi chỉ có lịch hệ thống tự gán (gửi trước ≥ 2 ngày, tạm hold nhận ca mới, QL duyệt sẽ tự chuyển ca sang đồng nghiệp rảnh ít ca nhất); chặn nếu có lịch khách chọn đích danh. Nghỉ đột xuất vẫn cho QL tạo khi đã hết 4 ngày/tháng (gắn cờ `Vượt hạn mức – Nghỉ không lương`) và thống nhất thuật toán gán ít ca nhất theo mã NV.
- **[Đã chốt]** Tách hàng lỗi khách trả khỏi `Hoàn bán (+)` → ghi `Trả hàng lỗi` (`0` vào tồn bán được). Thuốc kê đơn (`requiresPrescription = true`) khóa mua tự do trên Shop; khách vãng lai/tại quầy được LT thu tiền đơn thuốc BS kê gắn với lịch hẹn ngay trên hóa đơn quầy.
- **[Đã chốt]** Ai nhập cân thực tế cho dịch vụ có cờ hạng cân khi khách không khám với BS? → Cho phép nhập **"Cân thực tế tại quầy (kg)"** trên màn hình Lễ tân để hệ thống tự quy đổi hạng cân và tính giá mới (LT vẫn không nhập giá tay; không ghi đè khóa bệnh án y tế của BS). Nếu khách từ chối giá mới → trả bé lại, hủy miễn phí `0đ` (riêng dòng dịch vụ bị từ chối nếu giỏ có nhiều dịch vụ), hoàn 100% nếu trả trước, không tính `violation`.
- **[Đã chốt]** Lễ tân có được gửi đơn xin nghỉ phép trên web không? → **Có (gọn nhẹ)**: áp dụng quỹ 4 ngày nghỉ nguyên ngày/tháng (chặn tuần đã qua, Chủ Nhật & trùng ngày), tự hủy khi còn `Chờ duyệt`, đồng bộ 2 chiều vào bảng duyệt đơn và bảng quỹ nghỉ của Quản lý kèm cảnh báo **"trống quầy — cần bố trí người trực thay"**; không bị chặn bởi lịch hẹn khách hàng và không khóa slot đặt lịch.
- **[Đã chốt]** Phạm vi dịch vụ & kỹ năng của NVCS: Bỏ hoàn toàn *Lưu trú qua đêm* trên toàn hệ thống; mọi NVCS đều làm việc Full-time (T2–T7, `08:00–17:00`) và thực hiện được toàn bộ dịch vụ chăm sóc (không phân biệt bảng kỹ năng trên hồ sơ cá nhân hay màn hình đặt lịch; phòng khám duy trì `≥ 2` NVCS cùng vai trò để tự gán cân tải và đổi nhân sự khi nghỉ đột xuất).
- **[Đã chốt]** Phân quyền xem hồ sơ & liên kết y khoa của NVCS: NVCS chỉ có quyền **Chỉ xem** hồ sơ thú cưng, bị chặn truy cập Sổ sức khỏe/Kê đơn thuốc/Kho thuốc; trong chi tiết lịch hẹn được hiển thị khung **"Lưu ý Y khoa từ Bác sĩ Thú y"** (tổng hợp bệnh án gần nhất từ tất cả các Bác sĩ) và cân thực tế / giá điều chỉnh từ quầy Lễ tân.
- **[Đã chốt]** Phân quyền hồ sơ thú cưng & khóa dữ liệu y tế của Bác sĩ (BS): Bác sĩ **không** tạo mới và **không** xóa hồ sơ thú cưng (chỉ KH và LT tạo). Bác sĩ cập nhật 4 trường chuyên môn (**Cân nặng thực tế**, **Dị ứng**, **Hành vi đặc biệt**, **Tình trạng triệt sản**), xác nhận đưa **Ghi chú bổ sung từ khách (`customerNotes`)** vào trường Dị ứng/Hành vi chính thức, tự động bật cờ khóa `medicalLocked = true` đối với KH ngay từ lần cập nhật đầu tiên (hoặc khi lưu Phiếu khám bệnh án SOAP) và ghi **Audit Log** đầy đủ (giá trị cũ, giá trị mới, bác sĩ thực hiện, thời điểm).
- **[Đã chốt]** Kho thuốc chung & Sổ xuất dùng của Bác sĩ (BS ↔ QL ↔ NCC): Bỏ hoàn toàn *Hộp thuốc / Kệ riêng từng bác sĩ*, bỏ thao tác *Xóa thuốc khỏi kệ riêng* và bỏ chia đều lên kệ khi nhập PO; toàn bộ thuốc và vắc-xin nằm trong **Kho chung**. Khi QL xác nhận nhập PO thuốc/vắc-xin, tồn kho đạt chuẩn được **cộng trực tiếp vào Kho chung** để mọi BS thấy tăng ngay lập tức; khi QL duyệt yêu cầu bổ sung của BS (kể cả lúc kho = `0`) thì **không chặn thiếu kho và không trừ ngược kho chung**, mà mở lối tắt **"Tạo PO NCC"** để nhập hàng. BS xem tồn kho chung (chỉ đọc), lọc **"Thuốc tôi đã dùng"** từ sổ cái `stock_movements`, ghi nhận xuất dùng tại phòng khám kèm **Mã bác sĩ** và **Mã lịch hẹn** (trừ trực tiếp kho chung, chống xuất trùng cùng thuốc/ca, **chặn xuất âm** kèm nút 1-click **"Báo Quản lý bổ sung kho ngay"**).
- **[Đã chốt]** Luồng lịch hẹn & khám lâm sàng 2 bước của Bác sĩ (BS): Đồng bộ lịch cố định T2–T7 (`08:00–17:00`, nghỉ trưa `12:00–13:00`); gỡ bỏ chức năng BS tự đề xuất dời giờ hẹn khách trên Drawer (sự cố đột xuất dùng **"Báo Quản lý điều phối (Nghỉ đột xuất)"**); bảo vệ chống hoàn thành trùng ca (`idempotency`) khi đóng ca khám; Phiếu khám SOAP dùng ngày địa phương (UTC+7) đồng bộ với Đơn thuốc điện tử để tự động liên kết bệnh án ↔ đơn thuốc trong ngày.
- **Còn 2 mục nhóm xác nhận nhanh đầu tuần:** (1) Tỷ lệ % API phần nền Backend đã nối DB thật; (2) OTP xác thực tài khoản gửi thật hay giả lập (`123456`) trong demo.
