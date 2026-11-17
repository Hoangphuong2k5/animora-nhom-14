import { AppDataSource } from '../config/data-source.js';
import {
  BookingEntity,
  PaymentMethodEntity,
  PaymentEntity,
} from '../entities/booking.entity.js';
import { CustomerProfileEntity, UserEntity } from '../entities/user.entity.js';
import ApiError from '../utils/ApiError.js';

/**
 * PaymentRepository ánh xạ với AnimoraDB_Complete_ver1_5_Clean.sql (bao gồm Stored Procedures)
 */
class PaymentRepository {
  constructor(dataSource = AppDataSource) {
    this.dataSource = dataSource;
  }

  getRepo(entity, manager = null) {
    return manager ? manager.getRepository(entity) : this.dataSource.getRepository(entity);
  }

  async resolveCustomerByUserId(userId) {
    const cpRepo = this.getRepo(CustomerProfileEntity);
    let profile = await cpRepo.findOne({ where: { UserID: Number(userId) } });
    if (profile) return profile;

    const user = await this.getRepo(UserEntity).findOne({ where: { UserID: Number(userId) } });
    if (!user) return null;

    profile = await cpRepo.save(
      cpRepo.create({
        UserID: Number(userId),
        FullName: user.Email.split('@')[0],
      })
    );
    return profile;
  }

  async findMethodByCode(methodCode) {
    return await this.getRepo(PaymentMethodEntity).findOne({
      where: { MethodCode: methodCode, IsActive: true },
    });
  }

  async findAppointmentById(appointmentId) {
    return await this.getRepo(BookingEntity).findOne({
      where: { AppointmentID: Number(appointmentId) },
    });
  }

  async findOrderById(orderId) {
    const rows = await this.dataSource.query(
      `SELECT OrderID, CustomerID, OrderCode, TotalAmount, OrderStatus
       FROM dbo.Orders WHERE OrderID = @0`,
      [Number(orderId)]
    );
    return rows[0] || null;
  }

  async hasSuccessfulPaymentForTarget({ appointmentId = null, orderId = null }) {
    if (!appointmentId && !orderId) return false;
    const rows = await this.dataSource.query(
      `SELECT TOP (1) PaymentID
       FROM dbo.Payments
       WHERE PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
         AND ((@0 IS NOT NULL AND AppointmentID = @0) OR (@1 IS NOT NULL AND OrderID = @1))`,
      [appointmentId ? Number(appointmentId) : null, orderId ? Number(orderId) : null]
    );
    return Array.isArray(rows) && rows.length > 0;
  }

  async createPaymentRequestViaSp({
    customerId,
    paymentMethodId,
    paymentCode,
    amount,
    idempotencyKey,
    appointmentId = null,
    orderId = null,
  }) {
    const rows = await this.dataSource.query(
      `EXEC dbo.usp_CreatePaymentRequest
         @CustomerID = @0,
         @PaymentMethodID = @1,
         @PaymentCode = @2,
         @Amount = @3,
         @IdempotencyKey = @4,
         @AppointmentID = @5,
         @OrderID = @6`,
      [
        Number(customerId),
        Number(paymentMethodId),
        paymentCode,
        Number(amount),
        idempotencyKey,
        appointmentId ? Number(appointmentId) : null,
        orderId ? Number(orderId) : null,
      ]
    );
    return rows[0] || null;
  }

  async processGatewayCallbackViaSp({
    paymentCode,
    gatewayName,
    gatewayTransactionCode,
    gatewayStatus,
    transactionAmount,
    rawResponse = null,
  }) {
    const rows = await this.dataSource.query(
      `EXEC dbo.usp_ProcessPaymentGatewayCallback
         @PaymentCode = @0,
         @GatewayName = @1,
         @GatewayTransactionCode = @2,
         @GatewayStatus = @3,
         @TransactionAmount = @4,
         @RawResponse = @5`,
      [
        paymentCode,
        gatewayName,
        gatewayTransactionCode,
        gatewayStatus,
        Number(transactionAmount),
        rawResponse,
      ]
    );
    return rows[0] || null;
  }

  async syncAppointmentPaymentStatus(appointmentId, paymentTiming) {
    const nextStatus = paymentTiming === 'Prepaid' ? 'Prepaid_Paid' : 'Paid';
    await this.getRepo(BookingEntity).update(
      { AppointmentID: Number(appointmentId) },
      { PaymentStatus: nextStatus, UpdatedAt: new Date() }
    );
  }

  async findPaymentById(paymentId, manager = null) {
    const qb = (manager ? manager.createQueryBuilder() : this.dataSource.createQueryBuilder())
      .select([
        'p.PaymentID AS PaymentID',
        'p.CustomerID AS CustomerID',
        'p.AppointmentID AS AppointmentID',
        'p.OrderID AS OrderID',
        'p.PaymentMethodID AS PaymentMethodID',
        'p.PaymentCode AS PaymentCode',
        'p.Amount AS Amount',
        'p.PaymentStatus AS PaymentStatus',
        'p.PaidAt AS PaidAt',
        'p.ConfirmedByUserID AS ConfirmedByUserID',
        'p.ConfirmedAt AS ConfirmedAt',
        'p.CreatedAt AS CreatedAt',
        'pm.MethodCode AS MethodCode',
        'pm.MethodName AS MethodName',
      ])
      .from(PaymentEntity, 'p')
      .leftJoin(PaymentMethodEntity, 'pm', 'pm.PaymentMethodID = p.PaymentMethodID')
      .where('p.PaymentID = :id', { id: Number(paymentId) });
    const row = await qb.getRawOne();
    return row || null;
  }

  async findPaymentsByCustomer(customerId, { page = 1, limit = 20 }) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'p.PaymentID AS PaymentID',
        'p.CustomerID AS CustomerID',
        'p.AppointmentID AS AppointmentID',
        'p.OrderID AS OrderID',
        'p.PaymentMethodID AS PaymentMethodID',
        'p.PaymentCode AS PaymentCode',
        'p.Amount AS Amount',
        'p.PaymentStatus AS PaymentStatus',
        'p.PaidAt AS PaidAt',
        'p.ConfirmedByUserID AS ConfirmedByUserID',
        'p.ConfirmedAt AS ConfirmedAt',
        'p.CreatedAt AS CreatedAt',
        'pm.MethodCode AS MethodCode',
        'pm.MethodName AS MethodName',
      ])
      .from(PaymentEntity, 'p')
      .leftJoin(PaymentMethodEntity, 'pm', 'pm.PaymentMethodID = p.PaymentMethodID')
      .where('p.CustomerID = :customerId', { customerId: Number(customerId) });

    const totalItems = await qb.getCount();
    const items = await qb
      .orderBy('p.CreatedAt', 'DESC')
      .offset((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .getRawMany();

    return { items, totalItems };
  }

  async markCashPaymentPaid(paymentId, confirmedByUserId) {
    const now = new Date();
    await this.getRepo(PaymentEntity).update(
      { PaymentID: Number(paymentId) },
      {
        PaymentStatus: 'Paid',
        PaidAt: now,
        ConfirmedByUserID: Number(confirmedByUserId),
        ConfirmedAt: now,
      }
    );
    return await this.findPaymentById(paymentId);
  }

  async confirmCashPaymentAtomic(paymentId, confirmedByUserId) {
    const run = async (manager) => {
      const lockedRows = await manager.query(
        `SELECT PaymentID, AppointmentID, OrderID, PaymentStatus
         FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
         WHERE PaymentID = @0`,
        [Number(paymentId)]
      );
      const payment = lockedRows[0];
      if (!payment) {
        throw new ApiError(404, 'Không tìm thấy giao dịch thanh toán', 'PAYMENT_NOT_FOUND');
      }
      if (payment.PaymentStatus === 'Paid') {
        throw new ApiError(409, 'Giao dịch này đã được xác nhận thanh toán trước đó', 'ALREADY_PAID');
      }
      if (payment.PaymentStatus !== 'Pending') {
        throw new ApiError(
          400,
          `Không thể xác nhận thu tiền cho giao dịch ở trạng thái "${payment.PaymentStatus}"`,
          'INVALID_PAYMENT_STATUS'
        );
      }

      const existingPaidRows = await manager.query(
        `SELECT TOP (1) PaymentID
         FROM dbo.Payments WITH (UPDLOCK, HOLDLOCK)
         WHERE PaymentID <> @0
           AND PaymentStatus IN (N'Paid', N'PartiallyRefunded', N'Refunded')
           AND ((@1 IS NOT NULL AND AppointmentID = @1) OR (@2 IS NOT NULL AND OrderID = @2))`,
        [
          Number(paymentId),
          payment.AppointmentID ? Number(payment.AppointmentID) : null,
          payment.OrderID ? Number(payment.OrderID) : null,
        ]
      );
      if (existingPaidRows.length > 0) {
        throw new ApiError(
          409,
          'Lịch hẹn hoặc đơn hàng này đã có giao dịch thanh toán thành công khác',
          'ALREADY_PAID'
        );
      }

      let appointmentTiming = null;
      if (payment.AppointmentID) {
        const appRows = await manager.query(
          `SELECT AppointmentStatus, PaymentTiming
           FROM dbo.Appointments WITH (UPDLOCK, HOLDLOCK)
           WHERE AppointmentID = @0`,
          [Number(payment.AppointmentID)]
        );
        const app = appRows[0];
        if (app && ['Cancelled', 'Rejected', 'NoShow'].includes(app.AppointmentStatus)) {
          throw new ApiError(
            400,
            'Không thể xác nhận thanh toán cho lịch hẹn đã hủy hoặc bị từ chối',
            'INVALID_BOOKING_STATUS'
          );
        }
        appointmentTiming = app?.PaymentTiming || 'Postpaid';
      } else if (payment.OrderID) {
        const orderRows = await manager.query(
          `SELECT OrderStatus FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK) WHERE OrderID = @0`,
          [Number(payment.OrderID)]
        );
        if (orderRows[0]?.OrderStatus === 'Cancelled') {
          throw new ApiError(
            400,
            'Không thể xác nhận thanh toán cho đơn hàng đã hủy',
            'INVALID_ORDER_STATUS'
          );
        }
      }

      const updateRes = await manager.query(
        `UPDATE dbo.Payments
         SET PaymentStatus = N'Paid',
             PaidAt = SYSDATETIME(),
             ConfirmedByUserID = @1,
             ConfirmedAt = SYSDATETIME()
         WHERE PaymentID = @0 AND PaymentStatus = N'Pending'`,
        [Number(paymentId), Number(confirmedByUserId)]
      );

      const affected = Array.isArray(updateRes) ? updateRes[1] : updateRes?.rowsAffected?.[0];
      if (affected === 0) {
        throw new ApiError(409, 'Giao dịch thanh toán đã được xử lý bởi thao tác khác', 'ALREADY_PROCESSED');
      }

      if (payment.AppointmentID) {
        const nextAppPaymentStatus = appointmentTiming === 'Prepaid' ? 'Prepaid_Paid' : 'Paid';
        await manager.query(
          `UPDATE dbo.Appointments
           SET PaymentStatus = @1, UpdatedAt = SYSDATETIME()
           WHERE AppointmentID = @0`,
          [Number(payment.AppointmentID), nextAppPaymentStatus]
        );
      }

      return await this.findPaymentById(paymentId, manager);
    };

    if (typeof this.dataSource?.createQueryRunner === 'function') {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction('SERIALIZABLE');
      try {
        const res = await run(queryRunner.manager);
        await queryRunner.commitTransaction();
        return res;
      } catch (err) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
    return await this.dataSource.transaction(run);
  }

  async findManagerAndAdminUserIds() {
    if (!this.dataSource || typeof this.dataSource.query !== 'function') return [];
    const rows = await this.dataSource.query(
      `SELECT u.UserID
       FROM dbo.Users u
       INNER JOIN dbo.Roles r ON r.RoleID = u.RoleID
       WHERE r.RoleName IN (N'Admin', N'Manager') AND u.AccountStatus = N'Active'`
    );
    return rows.map((r) => Number(r.UserID));
  }
}

const defaultPaymentRepository = new PaymentRepository();
export { defaultPaymentRepository, PaymentRepository };
export default defaultPaymentRepository;

