# Tuyên Ngôn Kiến Trúc Backend Enterprise & Tiêu Chuẩn Lập Trình AI cho Node.js

Tài liệu này quy định toàn bộ tiêu chuẩn kiến trúc, kỷ luật lập trình và nguyên tắc tối ưu hóa hạ tầng áp dụng cho hệ thống Backend Enterprise sử dụng Node.js. Tất cả các mô-đun mã nguồn sinh bởi AI hoặc do kỹ sư phát triển bắt buộc phải tuân thủ nghiêm ngặt 100% các quy tắc dưới đây.

---

## 1. Kiến Trúc Phân Lớp & Tổ Chức Mã Nguồn (Layered Architecture)
* **Tách biệt Trách nhiệm (Separation of Concerns):** Hệ thống được thiết kế theo mô hình phân lớp cốt lõi: Controller/Routing, Service (Business Logic), Repository/DataAccess, và DTO (Data Transfer Object).
* **Luồng Phụ thuộc Một chiều:** Tầng ngoài chỉ được phép gọi tầng ngay dưới nó (Controller -> Service -> Repository). Nghiêm cấm vòng lặp phụ thuộc (Circular Dependency) hoặc gọi nhảy tầng (Ví dụ: Controller trực tiếp chọc xuống Repository).
* **Isolate Domain Logic:** Tầng Service phải hoàn toàn thuần khiết, độc lập với các giao thức HTTP truyền thông hoặc cấu trúc lưu trữ vật lý của Database.

## 2. Tiêu Chuẩn Thiết Kế REST API (REST API Standards)
* **Tính Đồng nhất (Uniform Interface):** Sử dụng danh từ số nhiều cho URIs (ví dụ: `/api/v1/resources`, `/api/v1/users`). Sử dụng đúng các HTTP Methods (`GET` để đọc, `POST` để tạo, `PUT` để cập nhật toàn bộ, `PATCH` để cập nhật một phần, `DELETE` để xóa).
* **Mã Trạng thái Chuẩn (HTTP Status Codes):**
  * `200 OK` cho truy vấn thành công.
  * `201 Created` cho tạo mới thành công.
  * `400 Bad Request` cho lỗi dữ liệu đầu vào.
  * `401 Unauthorized` cho thiếu hoặc sai token xác thực.
  * `403 Forbidden` cho lỗi phân quyền hợp lệ nhưng không có quyền truy cập tài nguyên.
  * `404 Not Found` cho tài nguyên không tồn tại.
  * `409 Conflict` cho lỗi vi phạm ràng buộc dữ liệu nghiệp vụ.
* **Cấu trúc Response Đồng nhất:** Mọi phản hồi lỗi phải tuân theo cấu trúc JSON chuẩn chứa `timestamp`, `status`, `error`, `message`, và `traceId`.

## 3. Kiểm Tra Dữ Liệu Đầu Vào (Request Validation)
* **Chặn Lỗi Sớm (Fail-Fast Boundary):** Tất cả các Request Payload (`RequestBody`, `PathVariable`, `RequestParam`) phải được kiểm tra tính hợp lệ ngay tại tầng Controller trước khi chạm vào tầng Service.
* **Type-Safe Validation:** Sử dụng các validation schema mạnh mẽ trong hệ sinh thái Node.js/NestJS như `Zod`, `Joi` hoặc `class-validator` kết hợp với các Pipes hoặc Middleware tương ứng.

## 4. Quản Lý Ngoại Lệ Toàn Cục (Global Exception Handling)
* **Tập Trung Hóa (Centralization):** Sử dụng các cơ chế quản lý ngoại lệ tập trung (như Exception Filters trong NestJS hoặc Error Middleware trong Express) để bắt toàn bộ runtime exceptions.
* **Tuyệt đối Không Nuốt Lỗi (No Silent Catches):** Nghiêm cấm việc bọc `try-catch` đơn thuần rồi bỏ trống hoặc chỉ in log ra console mà không ném lại hoặc xử lý dứt điểm.
* **Bảo Mật Thông Tin Lỗi:** Không bao giờ trả về toàn bộ Stack Trace hoặc cấu trúc câu lệnh SQL thô về phía Client trên môi trường Production để tránh rò rỉ lỗ hổng bảo mật.

## 5. Quy Định Về DTO (Data Transfer Object)
* **Tách Biệt Payload:** Không bao giờ sử dụng trực tiếp các Database Entities (như các Model của Prisma hoặc TypeORM) làm đối tượng nhận dữ liệu từ Request hoặc trả về trong Response API.
* **Kiểu Dữ Liệu Tĩnh:** Mọi DTO phải định nghĩa rõ ràng kiểu dữ liệu của từng trường (Strongly Typed) bằng cách sử dụng các TypeScript Interfaces hoặc Classes cố định.
* **Mapping Kỷ Luật:** Việc chuyển đổi giữa Entity và DTO phải diễn ra rõ ràng thông qua các thư viện mapper hoặc viết hàm biến đổi tường minh, tránh các logic chuyển đổi chậm chạp khi chạy.

## 6. Thiết Kế Cơ Sở Dữ Liệu Chuẩn (Database Normalization & Integrity)
* **Ràng Buộc Toàn Vẹn:** Luôn định nghĩa rõ ràng các khóa chính (Primary Key), khóa ngoại (Foreign Key), ràng buộc duy nhất (Unique Constraints), và ràng buộc kiểm tra (Check Constraints) trực tiếp dưới Database Engine.
* **Chuẩn Hóa Dữ Liệu:** Đảm bảo cấu trúc bảng đạt tối thiểu chuẩn 3NF đối với các tác vụ giao dịch lõi (OLTP) để tránh trùng lặp dữ liệu và bất thường khi cập nhật.

## 7. Triệt Tiêu Vấn Đề Truy Vấn N+1 (N+1 Query Prevention)
* **Eager Loading Kỷ Luật:** Khi truy xuất một thực thể có quan hệ với các thực thể khác, mặc định ORM phải cấu hình `Lazy Loading`. Tuy nhiên, tại các hàm tìm kiếm hoặc lấy chi tiết, bắt buộc phải sử dụng `include` hoặc `join` tường minh (trong Prisma/TypeORM) để gộp lệnh, triệt tiêu hoàn toàn lỗi N+1 Queries.
* **Đo Lường & Giám Sát:** Luôn bật chế độ hiển thị SQL thô trên môi trường Development để theo dõi số lượng câu lệnh thực thi xuống Database trên mỗi Request.

## 8. Quản Lý Phụ Thuộc (Dependency Inversion Principle)
* **Lập Trình Hướng Giao Diện:** Tầng Controller phụ thuộc vào Interface của tầng Service, tầng Service phụ thuộc vào Interface của tầng Repository. Không phụ thuộc trực tiếp vào các class triển khai cụ thể (Concrete Classes).
* **Constructor Injection:** Luôn ưu tiên cơ chế Inject phụ thuộc thông qua hàm khởi tạo (Constructor) để đảm bảo code dễ dàng Unit Test độc lập.

## 9. Cô Lập Logic Nghiệp Vụ (Business Logic Isolation)
* **Pure Service Layer:** Tầng Service không được chứa bất kỳ mã nguồn nào phụ thuộc vào các thư viện giao diện hoặc xử lý luồng mạng ngoại lai.
* **State Mutability:** Mọi thay đổi trạng thái của dữ liệu phải được xác thực chặt chẽ qua các quy tắc nghiệp vụ (Business Rules) quy định trong Service trước khi thực hiện lưu trữ xuống DB.

## 10. Nguyên Tắc Thiết Kế Mã Nguồn Sạch (Clean Code Standards)
* **Kích Thước Hàm Tiêu Chuẩn:** Mỗi hàm/method chỉ nên làm một việc duy nhất (Single Responsibility Principle) và không nên dài quá 50 dòng code.
* **Đặt Tên Có Ý Nghĩa:** Tên hàm, tên biến phải thể hiện rõ mục đích, sử dụng tiếng Anh chuẩn mực ngành phần mềm (ví dụ: `calculateLoyaltyPoints` thay vì `calcPts`).

## 11. Quản Lý Tài Nguyên Hệ Thống (Resource Management)
* **Giải Phóng Bộ Nhớ:** Mọi tài nguyên mạng, luồng đọc/ghi file, kết nối I/O bắt buộc phải được đóng dứt điểm sau khi sử dụng thông qua các khối block giải phóng tự động.

---

## 12. Xử Lý Bất Đồng Bộ & Tác Vụ Nền (Asynchronous Processing & Background Tasks)
* **Infrastructure Pragmatism:** Tránh các heavy message brokers (như Kafka/RabbitMQ) trừ khi hệ thống thật sự yêu cầu stream event chéo service ở quy mô khổng lồ.
* **Database-as-a-Queue:** Đối với background jobs nội bộ, triển khai Database-as-a-Queue rõ ràng với `WITH (UPDLOCK, READPAST)` để tránh deadlocks và triệt tiêu đụng độ I/O giữa các worker chạy song song.
* **Redis Streams:** Nếu yêu cầu xử lý bất đồng bộ thông lượng cao và đã có Redis, mặc định sử dụng Redis Streams với Consumer Groups thay vì các lists thông thường.
* **Zero API Blocking:** Luồng thực thi chính của API KHÔNG BAO GIỜ được chờ các event I/O bên ngoài. Sử dụng Transactional Outbox pattern để lưu trữ các event một cách nguyên tử (atomically) nếu cần đảm bảo việc gửi đi (guaranteed delivery).

## 13. Bảo Mật & Kiểm Soát Truy Cập (Hybrid Model)
* **Boundary RBAC:** Triển khai Role-Based Access Control (RBAC) ở tầng controller/routing ngoài cùng (thông qua Guards/Middleware) để từ chối các request ngay lập tức với chi phí thấp.
* **Core ABAC:** Triển khai Attribute-Based Access Control (ABAC) sâu bên trong tầng Service để xác thực quyền sở hữu dữ liệu và các policy dựa trên trạng thái (ví dụ: validate `userId` so với `resourceOwnerId`).
* **Strict Enforcement:** Luôn ném lỗi `403 Forbidden` rõ ràng khi vi phạm policy ABAC. KHÔNG BAO GIỜ để lộ trạng thái dữ liệu nội bộ khi phân quyền thất bại.

## 14. Chiến Lược Caching & Hủy Cache (Caching & Invalidation)
* **Default Pattern:** Áp dụng **Cache-Aside** pattern cho các tác vụ đọc nhiều (read-heavy) để tối ưu bộ nhớ và đảm bảo fallback.
* **Event-Driven Invalidation:** Việc xóa cache (Invalidation) BẮT BUỘC phải tách rời khỏi request thread chính. KHÔNG BAO GIỜ tạo lệnh xóa cache trực tiếp (ví dụ: `redis.del()`) ngay trong core Services.
* **Eventual Consistency:** Áp dụng **Transactional Outbox** pattern. API chính chỉ thay đổi database và lưu sự kiện invalidation một cách nguyên tử. Việc dọn cache phải được xử lý bất đồng bộ bởi background workers hoặc CDC.

## 15. Logging & Giám Sát (Structured & Traceable)
* **Chỉ Dùng JSON Structured Logging:** KHÔNG BAO GIỜ sử dụng log chuỗi văn bản thông thường. Tất cả log phải có cấu trúc và xuất ra chuẩn JSON.
* **Mandatory Distributed Tracing:** Mọi log BẮT BUỘC phải tự động đính kèm `traceId` hoặc `correlationId` thông qua `AsyncLocalStorage` trong Node.js.
* **Proactive Execution Logging:** Tự động inject các log tại các chốt chặn quan trọng trong luồng thực thi chính.
* **Error Payload Standard:** Các block Exception/Catch BẮT BUỘC trigger `logger.error` chứa payload JSON chi tiết (bao gồm input, request body, params gây ra lỗi) kèm theo root cause rõ ràng cho hệ thống ELK/Datadog.

## 16. Quản Lý Cấu Hình & Secrets (Type-Safe & Fail-Fast)
* **Strict Centralization:** KHÔNG BAO GIỜ gọi thẳng raw environment variables (ví dụ: `process.env.VAR`) trực tiếp vào Business Logic/Service layers.
* **Type-Safe Binding:** Toàn bộ cấu hình phải được load vào các class/object có định nghĩa type rõ ràng và được validate bởi ConfigServices dùng `Zod` hoặc `class-validator` trong Node.js.
* **Fail-Fast on Startup:** Ứng dụng BẮT BUỘC phải crash ngay trong lúc startup nếu biến môi trường bị thiếu hoặc sai định dạng. Cấm ép kiểu thủ công từ string.

## 17. Quản Lý Database Schema & Migrations
* **Zero Auto-Sync:** KHÔNG BAO GIỜ sử dụng tính năng auto-sync của ORM trên production (ví dụ: `prisma db push`, `synchronize: true` của TypeORM).
* **Strict Versioned Migrations:** Mọi thay đổi schema (DDL) BẮT BUỘC quản lý qua các migration scripts có version (ví dụ: Prisma Migrations, TypeORM Migrations cho Node.js).
* **Mandatory Output:** Mỗi khi tạo/cập nhật Model class, bạn BẮT BUỘC phải tạo ra raw SQL hoặc mã migration `up()`/`down()` rõ ràng để áp dụng an toàn vào DB.

## 18. Khả Năng Phục Hồi & Tích Hợp API Ngoài (Resilience)
* **Zero Raw Calls:** KHÔNG BAO GIỜ gọi HTTP raw kèm `try-catch` đơn giản. Nghiêm cấm không giới hạn timeout hoặc retry vô hạn gây cạn kiệt thread pool.
* **Mandatory Resilience Patterns:** Mọi tích hợp external service BẮT BUỘC bọc bằng cơ chế fault-tolerance (ví dụ: dùng `opossum` hoặc `axios-retry` trong Node.js).
* **Circuit Breaker & Backoff:** Bắt buộc áp dụng Circuit Breakers. Chỉ Retry với lỗi mạng chập chờn bằng **Exponential Backoff with Jitter**. KHÔNG BAO GIỜ retry lỗi logic (ví dụ: 400, 403).
* **Graceful Degradation (Strict Fallback):** Bắt buộc có cơ chế Fallback. Nếu external service lỗi, KHÔNG BAO GIỜ ném lỗi 500 cho client.
* **Fallback Execution:** Log lại lỗi kèm `traceId`, trả về cache mặc định, hoặc đẩy tác vụ thất bại vào Background Queue (Eventual Consistency) trong khi vẫn trả về response thành công cho luồng chính.

## 19. Xử Lý Khối Lượng Lớn & Quản Lý Bộ Nhớ (Large Datasets)
* **Zero OOM Tolerance:** KHÔNG BAO GIỜ load toàn bộ table không phân trang vào memory (ví dụ: `findAll()` vô hạn).
* **No N+1 Updates:** KHÔNG BAO GIỜ dùng vòng lặp `for/foreach` để chạy từng câu lệnh `save()` hoặc `update()`.
* **Strategy 1 (DB Bulk):** Chuyển việc tính toán xuống DB bằng Bulk Updates hoặc Raw SQL (`UPDATE ... SET ... WHERE ...`).
* **Strategy 2 (Keyset Pagination):** Nếu cần logic API/Backend cho từng record, chia thành chunk nhỏ (100-500 records). BẮT BUỘC dùng **Keyset Pagination** (`WHERE id > last_id`) thay vì `OFFSET/LIMIT`.
* **Strategy 3 (Cursor-Based Streaming):** Để export data lớn (CSV/Excel) không đổi state, BẮT BUỘC dùng Database Cursors (ví dụ: cursor streams của Node.js) và dọn rác (garbage-collected) ngay lập tức tránh rò rỉ bộ nhớ.

## 20. Versioning API & Khả Năng Tương Thích Ngược
* **Zero Implicit Breaking Changes:** KHÔNG BAO GIỜ sửa endpoint hiện tại làm hỏng client cũ. Tuyệt đối CẤM: xóa response field, đổi data type (int sang string), hoặc thêm tham số REQUIRED mới vào payload hiện tại.
* **Evolutionary Design (Additions Only):** Mặc định nâng cấp theo hướng cộng dồn. Nếu thay field, BẮT BUỘC gắn `@Deprecated` vào field cũ trên DTO, giữ logic chạy fallback và thêm field mới.
* **Explicit Versioning:** Chỉ làm Breaking Changes khi được cho phép. Nếu có, áp dụng **URI Versioning** (`/api/v2/`) hoặc **Header Versioning**. KHÔNG BAO GIỜ ghi đè lên `v1` Controller/Service cũ.

## 21. Xác Thực & Vòng Đời Token (Strict Security)
* **Zero LocalStorage/XSS Vulnerability:** KHÔNG BAO GIỜ trả về Access/Refresh tokens qua response body JSON để lưu ở `localStorage` hoặc `sessionStorage` của client.
* **Stateful/Hybrid JWT Architecture:** Access Tokens phải ngắn hạn (ví dụ: 15 phút) và Refresh Tokens dài hạn. Refresh Tokens BẮT BUỘC lưu trạng thái (stateful) trong Database/Redis để có thể thu hồi.
* **Secure Cookie Delivery ONLY:** BẮT BUỘC trả token cho client độc quyền qua header `Set-Cookie` cấu hình bảo mật nghiêm ngặt: `HttpOnly`, `Secure` (HTTPS), và `SameSite=Strict` (hoặc `Lax`).
* **Active Revocation (Redis Blacklist):** Implement logout thật phía server. Khi logout hoặc ban tài khoản, xóa ngay Refresh Token khỏi DB VÀ đẩy ID (JTI) của Access Token hiện tại vào Redis Blacklist với TTL bằng đúng thời gian sống còn lại của token.

## 22. Kiến Trúc Upload File (Direct-to-Cloud)
* **Zero Backend Bottleneck:** KHÔNG BAO GIỜ triển khai upload file `multipart/form-data` truyền thống đi qua RAM hoặc ổ cứng của Backend Router/Controller.
* **Mandatory Pre-signed URLs:** BẮT BUỘC dùng kiến trúc Direct-to-Cloud (Bypass Backend) cho file storage (S3, MinIO, GCS).
* **Execution Flow:**
  1. Backend xác thực request và cấp URL Pre-signed PUT ngắn hạn (ví dụ: 5 phút).
  2. Client upload nhị phân trực tiếp lên Cloud.
  3. Backend cập nhật state database thông qua Cloud Webhook/Event notifications an toàn hoặc Client Callback được kiểm tra gắt gao.
* **Strict Bucket Privacy:** Các bucket BẮT BUỘC phải ở chế độ private. Cấm quyền ghi công khai (public write).

## 23. Kiến Trúc Tìm Kiếm (Hybrid Full-Text Search)
* **Zero Wildcard Table Scans:** KHÔNG BAO GIỜ viết query `LIKE '%keyword%'` trên các table core giao dịch lớn để tránh Full Table Scans.
* **Hybrid Architecture Enforcement:**
  * Dataset nhỏ/Admin: Chấp nhận dùng index hoặc tính năng Full-Text Search Native của Database.
  * Core Catalog/End-User API: BẮT BUỘC sử dụng Dedicated Search Engine (ví dụ: Elasticsearch, Typesense, Meilisearch) để handle fuzzy matching, typo và xếp hạng hiệu năng cao.
* **Asynchronous Data Sync:** API chính KHÔNG ĐƯỢC ghi trực tiếp vào Search Engine. Bắt buộc dùng **Transactional Outbox / CDC** pattern: thay đổi DB kích hoạt sự kiện cho background workers đồng bộ vào Search Index (Eventual Consistency).

## 24. Lập Lịch Phân Tán & Cron Jobs (Distributed Scheduling)
* **Zero Blind Scheduling:** KHÔNG BAO GIỜ dùng `node-cron` hay `setInterval` trong môi trường đa bản sao (multi-replica) mà thiếu cơ chế lock để tránh việc chạy trùng lặp.
* **No Heavy In-App Schedulers:** Core API nodes không được chạy tác vụ cron xử lý dữ liệu nặng ngay trên RAM của nó.
* **Light Tasks (Distributed Lock):** Tác vụ nhẹ (ví dụ: quét cache, ping): Bắt buộc dùng khóa phân tán bằng **Redis-based locks** (như `Redlock` cho Node.js) để tránh I/O của DB. Chỉ dùng lock bằng Database nếu không có Redis.
* **Heavy/Core Business Tasks (Dedicated Scheduler):** Tác vụ nặng: Tách hẳn ra khỏi API hướng người dùng. BẮT BUỘC dùng clustered schedulers như **BullMQ với Redis** (cho Node.js) hoặc cloud-events (AWS EventBridge) trigger webhooks bảo mật.

## 25. Transactions & Kỷ Luật Connection Pooling
* **No Connection Bleeding:** KHÔNG BAO GIỜ mở transactions DB bọc qua các I/O network chậm chạp (như gọi payment gateway, gửi email). Giữ transactions càng nhỏ càng tốt.
* **Infrastructure Snapshot/Isolation Assumption:** Mặc định các query phải chạy trên nền isolation level được tối ưu như Read Committed Snapshot Isolation (RCSI).
* **Explicit Isolation Overrides:** Cập nhật có rủi ro cao (Payment, số dư): Bắt buộc override isolation lên Repeatable Read hoặc dùng Pessimistic Locks (Khóa bi quan) để triệt tiêu race conditions. Query Report cực lớn có thể downgrade xuống Read Uncommitted (dirty reads) nếu nghiệp vụ chấp nhận.
* **Fail-Fast Connection Pooling:** Áp dụng pooling nghiêm ngặt (như cấu hình pool của Prisma/TypeORM) với Connection timeout bị giới hạn ở mức `2000ms` - `3000ms` để Circuit Breaker nổ ngay lập tức khi DB kiệt quệ. Giải phóng connection lập tức sau khi xong.

## 26. Query SARGable & Lập Chỉ Mục Chủ Động (SARGable & Proactive Indexing)
* **Strict SARGability:** KHÔNG BAO GIỜ viết query Non-SARGable. TUYỆT ĐỐI CẤM bọc column database trong function, toán học, nối chuỗi ở bên trái mệnh đề `WHERE` hoặc `JOIN` (ví dụ: dùng `WHERE date >= '2026-01-01' AND date < '2027-01-01'`, không dùng `WHERE YEAR(date) = 2026`).
* **No DB-Level Formatting:** Dùng cấu hình collation của DB (như Case-Insensitive) thay vì dùng runtime functions như `LOWER()` hoặc `UPPER()`.
* **Proactive Indexing:** Bất cứ khi nào viết query có `WHERE`, `JOIN` hoặc `ORDER BY`, bạn BẮT BUỘC tạo file migration chứa `CREATE INDEX` tương ứng.
* **Composite Index Optimization:** Tối ưu index đa cột: Cột dùng toán tử bằng (`=`) BẮT BUỘC đứng trước, cột dùng toán tử khoảng (`>`, `<`, `BETWEEN`) đứng sau.

## 27. Giao Tiếp Thời Gian Thực (WebSockets/SSE)
* **Zero In-Memory State:** KHÔNG BAO GIỜ quản lý state WebSocket (sessions, rooms) bằng in-memory arrays hoặc maps nội bộ khiến server không thể scale ngang.
* **No Server-to-Server RPC for Real-time:** KHÔNG BAO GIỜ gọi HTTP trực tiếp giữa các backend nodes để định tuyến thông báo real-time.
* **Mandatory Pub/Sub Backplane:** BẮT BUỘC dùng kiến trúc Pub/Sub (Redis Pub/Sub, Kafka) làm backplane cho mọi event broadcasting thời gian thực.
* **Execution Flow:** Các Nodes giữ local sockets -> Sub vào chung 1 Redis channel -> Khi có event, node publish vào Redis -> Node đang giữ kết nối của client đó nhận event và emit xuống dưới. Ưu tiên dùng `@socket.io/redis-adapter` trong Node.js để trừu tượng hóa độ phức tạp này.

## 28. Chiến Lược Xóa & Lưu Trữ Dữ Liệu (Data Deletion & Archiving)
* **Zero Soft-Delete Bloat:** KHÔNG BAO GIỜ dùng chuẩn Soft Delete (cột `is_deleted` hoặc `deleted_at`) trên các bảng giao dịch core khổng lồ gây hỏng index và full table scans.
* **Core Data (Archiving Architecture):** Với entity kinh doanh quan trọng, BẮT BUỘC thực thi kiến trúc Archiving trong 1 transaction nguyên tử: `INSERT` data sang bảng lịch sử (Archive table) và sau đó xóa cứng (physical `DELETE`) khỏi bảng chính.
* **Satellite Data (Controlled Hard Delete):** Với bảng cấu hình nhỏ, cho phép `DELETE` cứng, nhưng BẮT BUỘC qua business validation nghiêm ngặt. Nếu kẹt khóa ngoại, abort ngay và ném `409 Conflict` kèm payload rõ ràng.

## 29. Chiến Lược Automation Testing & Đảm Bảo Chất Lượng
* **Zero False Safety:** KHÔNG BAO GIỜ mock Database hoặc Redis (qua Jest Mocks) khi đang test các core services giao dịch, update số lượng lớn, hoặc test khóa (locks).
* **No In-Memory DB Substitutes:** TUYỆT ĐỐI CẤM dùng các In-memory DB (như SQLite trong Node.js) để giả lập môi trường Production, vì chúng không tái tạo đúng transaction locks và isolation levels.
* **Hybrid Testing Pyramid (Mandatory Enforcement):**
  * **Pure Logic (Unit Tests):** Dùng mock (như `Jest`) ĐỘC QUYỀN cho logic thuật toán thuần túy không có I/O.
  * **Core Transactions (TestContainers):** Integration tests BẮT BUỘC dùng **TestContainers** (Khởi chạy Docker DB/Redis thật, chạy Migration, thực thi I/O thật, và check state).
  * **External Resilience (Mock Servers):** BẮT BUỘC dùng internal HTTP mock servers (như `nock` hoặc `MSW` cho Node.js) để giả lập cố ý các lỗi network (503, timeouts) nhằm xác nhận hệ thống xuống cấp an toàn (graceful degradation).