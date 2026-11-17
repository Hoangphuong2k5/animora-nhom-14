-- ============================================================================
-- Migration: Anti-duplicate Appointments, Adoption & Idempotent Payment Reuse
-- Date: 2026-11-17
-- Safe to run repeatedly on existing AnimoraDB (ver 1.5)
-- ============================================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Appointments_Pet_Time' AND object_id = OBJECT_ID(N'dbo.Appointments')
)
BEGIN
    CREATE INDEX IX_Appointments_Pet_Time
        ON dbo.Appointments(PetID, AppointmentAt, AppointmentEndAt)
        INCLUDE (AppointmentStatus, PaymentTiming, PaymentStatus, PaymentExpiresAt);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Appointments_Status_PaymentExpiry' AND object_id = OBJECT_ID(N'dbo.Appointments')
)
BEGIN
    CREATE INDEX IX_Appointments_Status_PaymentExpiry
        ON dbo.Appointments(AppointmentStatus, PaymentTiming, PaymentStatus, PaymentExpiresAt)
        WHERE AppointmentStatus = N'Pending' AND PaymentTiming = N'Prepaid' AND PaymentStatus = N'Prepaid_Pending';
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CreatePaymentRequest
    @CustomerID BIGINT,
    @PaymentMethodID INT,
    @PaymentCode NVARCHAR(100),
    @Amount DECIMAL(18,2),
    @IdempotencyKey NVARCHAR(150),
    @AppointmentID BIGINT = NULL,
    @OrderID BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ((@AppointmentID IS NULL AND @OrderID IS NULL) OR (@AppointmentID IS NOT NULL AND @OrderID IS NOT NULL))
        THROW 51101, N'Một Payment phải thuộc đúng một lịch hẹn hoặc một đơn hàng.', 1;
    IF @Amount <= 0 OR NULLIF(LTRIM(RTRIM(@IdempotencyKey)), N'') IS NULL
        THROW 51102, N'Số tiền hoặc IdempotencyKey không hợp lệ.', 1;

    DECLARE @PaymentID BIGINT, @ExistingCustomerID BIGINT, @ExistingAppointmentID BIGINT,
            @ExistingOrderID BIGINT, @ExistingAmount DECIMAL(18,2), @ExistingMethodID INT,
            @ExistingStatus NVARCHAR(30),
            @TargetAppStatus NVARCHAR(30), @TargetPayTiming NVARCHAR(10),
            @TargetPayStatus NVARCHAR(20), @TargetPayExpiresAt DATETIME2(0),
            @TargetOrderStatus NVARCHAR(30);

    BEGIN TRY
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        BEGIN TRANSACTION;

        IF @AppointmentID IS NOT NULL
        BEGIN
            SELECT @TargetAppStatus = AppointmentStatus,
                   @TargetPayTiming = PaymentTiming,
                   @TargetPayStatus = PaymentStatus,
                   @TargetPayExpiresAt = PaymentExpiresAt
            FROM dbo.Appointments WITH (UPDLOCK, HOLDLOCK)
            WHERE AppointmentID = @AppointmentID;

            IF @TargetAppStatus IS NULL
                THROW 51113, N'Không tìm thấy lịch hẹn cần thanh toán.', 1;
            IF @TargetAppStatus IN (N'Cancelled', N'Rejected', N'NoShow')
                THROW 51111, N'Không thể thanh toán cho lịch hẹn đã hủy hoặc bị từ chối.', 1;
            IF @TargetPayTiming = N'Prepaid' AND @TargetPayStatus = N'Prepaid_Pending'
               AND @TargetPayExpiresAt IS NOT NULL AND @TargetPayExpiresAt < SYSDATETIME()
                THROW 51114, N'Thời hạn giữ chỗ thanh toán trả trước của lịch hẹn đã hết.', 1;
            IF @TargetPayStatus IN (N'Prepaid_Paid', N'Paid', N'Refunded')
                THROW 51110, N'Giao dịch này đã được thanh toán hoặc hoàn tiền trước đó.', 1;
        END
        ELSE
        BEGIN
            SELECT @TargetOrderStatus = OrderStatus
            FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK)
            WHERE OrderID = @OrderID;

            IF @TargetOrderStatus IS NULL
                THROW 51113, N'Không tìm thấy đơn hàng cần thanh toán.', 1;
            IF @TargetOrderStatus = N'Cancelled'
                THROW 51111, N'Không thể thanh toán cho đơn hàng đã hủy.', 1;
        END;

        IF EXISTS (
            SELECT 1 FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
              AND ((@AppointmentID IS NOT NULL AND AppointmentID = @AppointmentID)
                   OR (@OrderID IS NOT NULL AND OrderID = @OrderID))
        )
            THROW 51110, N'Giao dịch này đã được thanh toán trước đó.', 1;

        SELECT @PaymentID = k.PaymentID
        FROM dbo.PaymentIdempotencyKeys k WITH (UPDLOCK, HOLDLOCK)
        WHERE k.IdempotencyKey = @IdempotencyKey;

        IF @PaymentID IS NOT NULL
        BEGIN
            SELECT @ExistingCustomerID = CustomerID, @ExistingAppointmentID = AppointmentID,
                   @ExistingOrderID = OrderID, @ExistingAmount = Amount, @ExistingMethodID = PaymentMethodID,
                   @ExistingStatus = PaymentStatus
            FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK) WHERE PaymentID = @PaymentID;

            IF @ExistingCustomerID <> @CustomerID
               OR ISNULL(@ExistingAppointmentID, -1) <> ISNULL(@AppointmentID, -1)
               OR ISNULL(@ExistingOrderID, -1) <> ISNULL(@OrderID, -1)
               OR @ExistingAmount <> @Amount OR @ExistingMethodID <> @PaymentMethodID
                THROW 51103, N'IdempotencyKey đã được sử dụng cho yêu cầu thanh toán khác.', 1;

            IF @ExistingStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
                THROW 51110, N'Giao dịch này đã được thanh toán trước đó.', 1;

            IF @ExistingStatus IN (N'Failed', N'Cancelled', N'Duplicate')
                THROW 51112, N'IdempotencyKey gắn với giao dịch đã thất bại hoặc bị hủy.', 1;
        END
        ELSE
        BEGIN
            SELECT TOP (1) @PaymentID = PaymentID
            FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
            WHERE PaymentStatus = N'Pending'
              AND CustomerID = @CustomerID
              AND ((@AppointmentID IS NOT NULL AND AppointmentID = @AppointmentID) OR (@OrderID IS NOT NULL AND OrderID = @OrderID));

            IF @PaymentID IS NOT NULL
            BEGIN
                UPDATE dbo.Payments
                SET PaymentMethodID = @PaymentMethodID,
                    Amount = @Amount,
                    PaymentCode = @PaymentCode
                WHERE PaymentID = @PaymentID AND PaymentStatus = N'Pending';
            END
            ELSE
            BEGIN
                INSERT INTO dbo.Payments(CustomerID, AppointmentID, OrderID, PaymentMethodID, PaymentCode, Amount, PaymentStatus)
                VALUES (@CustomerID, @AppointmentID, @OrderID, @PaymentMethodID, @PaymentCode, @Amount, N'Pending');
                SET @PaymentID = SCOPE_IDENTITY();
            END;

            INSERT INTO dbo.PaymentIdempotencyKeys(IdempotencyKey, PaymentID) VALUES (@IdempotencyKey, @PaymentID);
        END;

        COMMIT TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        SELECT * FROM dbo.Payments WHERE PaymentID = @PaymentID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        THROW;
    END CATCH;
END;
GO

