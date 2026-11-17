import cron from 'node-cron';
import { AppDataSource } from '../config/data-source.js';
import notificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';
import { runWithTrace } from '../utils/traceContext.js';

/**
 * INV-06: Low Stock Alert Cron Job (AnimoraDB: ProductVariants + Products + Users/Roles)
 */
async function scanAndNotifyLowStock() {
  return runWithTrace(async () => {
    if (!AppDataSource.isInitialized) return { alertedCount: 0 };

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockRes = await queryRunner.query(`
        DECLARE @res INT;
        EXEC @res = sp_getapplock
          @Resource = 'animora_cron_low_stock_lock',
          @LockMode = 'Exclusive',
          @LockOwner = 'Transaction',
          @LockTimeout = 0;
        SELECT @res AS lock_status;
      `);

      if (!lockRes[0] || Number(lockRes[0].lock_status) < 0) {
        await queryRunner.rollbackTransaction();
        logger.info('LowStockJob skipped: another instance holds the distributed lock');
        return { alertedCount: 0, skipped: true };
      }

      const lowStockProducts = await queryRunner.query(`
        SELECT pv.ProductVariantID AS id, p.ProductName AS name, pv.VariantName AS variant_name,
               pv.SKU AS sku, pv.StockQuantity AS stock, pv.ReorderLevel AS low_stock_threshold
        FROM dbo.ProductVariants pv
        INNER JOIN dbo.Products p ON p.ProductID = pv.ProductID
        WHERE pv.IsActive = 1
          AND p.ProductStatus = N'Active'
          AND pv.StockQuantity <= pv.ReorderLevel
      `);

      if (lowStockProducts.length === 0) {
        await queryRunner.commitTransaction();
        return { alertedCount: 0 };
      }

      const staffAndAdmins = await queryRunner.query(`
        SELECT u.UserID AS id
        FROM dbo.Users u
        INNER JOIN dbo.Roles r ON r.RoleID = u.RoleID
        WHERE r.RoleName IN (N'Admin', N'Manager')
          AND u.AccountStatus = N'Active'
      `);

      await queryRunner.commitTransaction();

      let alertedCount = 0;
      for (const product of lowStockProducts) {
        const displayName = product.variant_name
          ? `${product.name} (${product.variant_name})`
          : product.name;
        const title = `Cảnh báo sắp hết hàng: ${displayName} (${product.sku})`;
        const content = `Sản phẩm "${displayName}" (SKU: ${product.sku}) hiện chỉ còn ${product.stock} sản phẩm (ngưỡng cảnh báo tối thiểu: ${product.low_stock_threshold}). Vui lòng kiểm tra và tạo PO nhập thêm hàng.`;

        for (const recipient of staffAndAdmins) {
          const alreadySent = await notificationService.hasRecentSystemAlert(
            recipient.id,
            title,
            24
          );
          if (!alreadySent) {
            await notificationService.sendSystemAlert({
              user_id: recipient.id,
              title,
              content,
              type: 'system',
              ref_type: 'ProductVariant',
              ref_id: product.id,
            });
            alertedCount += 1;
          }
        }
      }

      logger.info('LowStockJob completed', {
        lowStockProductCount: lowStockProducts.length,
        alertedCount,
      });
      return { alertedCount };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      logger.error('LowStockJob failed', {
        errorName: error.name,
        message: error.message,
        stack: error.stack,
      });
      return { alertedCount: 0, error: error.message };
    } finally {
      await queryRunner.release();
    }
  });
}

function startLowStockJob() {
  return cron.schedule('0 */6 * * *', async () => {
    await scanAndNotifyLowStock();
  });
}

export {
  scanAndNotifyLowStock,
  startLowStockJob,
};
export default {
  scanAndNotifyLowStock,
  startLowStockJob,
};
