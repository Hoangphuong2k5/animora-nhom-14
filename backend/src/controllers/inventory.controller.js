import defaultInventoryService from '../services/inventory.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * InventoryController (clauden_node_js.md Rules 2, 8, 9)
 * - Constructor Dependency Injection
 * - Thin controller layer delegating all business & transaction logic to InventoryService
 */
class InventoryController {
  constructor(inventoryService = defaultInventoryService) {
    this.inventoryService = inventoryService;

    this.createSupplier = this.createSupplier.bind(this);
    this.updateSupplier = this.updateSupplier.bind(this);
    this.lockOrUnlockSupplier = this.lockOrUnlockSupplier.bind(this);
    this.listSuppliers = this.listSuppliers.bind(this);
    this.getSupplierById = this.getSupplierById.bind(this);
    this.upsertSupplierPrice = this.upsertSupplierPrice.bind(this);
    this.getSupplierPrices = this.getSupplierPrices.bind(this);
    this.createPurchaseOrder = this.createPurchaseOrder.bind(this);
    this.listPurchaseOrders = this.listPurchaseOrders.bind(this);
    this.getPurchaseOrderById = this.getPurchaseOrderById.bind(this);
    this.updatePurchaseOrderStatus = this.updatePurchaseOrderStatus.bind(this);
    this.supplierRespondPurchaseOrder = this.supplierRespondPurchaseOrder.bind(this);
    this.supplierUpdateShippingStatus = this.supplierUpdateShippingStatus.bind(this);
    this.createGoodsReceipt = this.createGoodsReceipt.bind(this);
    this.listGoodsReceipts = this.listGoodsReceipts.bind(this);
    this.adjustInventory = this.adjustInventory.bind(this);
    this.listInventoryBatches = this.listInventoryBatches.bind(this);
    this.allocateStockFefo = this.allocateStockFefo.bind(this);
  }

  async createSupplier(req, res, next) {
    try {
      const data = await this.inventoryService.createSupplier(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Tạo nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const data = await this.inventoryService.updateSupplier(
        Number(req.params.id),
        req.body,
        req.user
      );
      return sendSuccess(res, {
        message: 'Cập nhật thông tin nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async lockOrUnlockSupplier(req, res, next) {
    try {
      const data = await this.inventoryService.updateSupplierStatus(
        Number(req.params.id),
        req.body.status
      );
      return sendSuccess(res, {
        message: 'Cập nhật trạng thái nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listSuppliers(req, res, next) {
    try {
      const data = await this.inventoryService.listSuppliers(req.query);
      return sendSuccess(res, {
        message: 'Lấy danh sách nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const data = await this.inventoryService.getSupplierById(Number(req.params.id));
      return sendSuccess(res, {
        message: 'Lấy chi tiết nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async upsertSupplierPrice(req, res, next) {
    try {
      const data = await this.inventoryService.upsertSupplierPrice(
        Number(req.params.id),
        req.body,
        req.user
      );
      return sendSuccess(res, {
        message: 'Cập nhật bảng báo giá nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getSupplierPrices(req, res, next) {
    try {
      const data = await this.inventoryService.getSupplierPrices(Number(req.params.id));
      return sendSuccess(res, {
        message: 'Lấy bảng báo giá nhà cung cấp thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createPurchaseOrder(req, res, next) {
    try {
      const data = await this.inventoryService.createPurchaseOrder(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Tạo đơn đặt hàng (PO) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listPurchaseOrders(req, res, next) {
    try {
      const data = await this.inventoryService.listPurchaseOrders(req.query);
      return sendSuccess(res, {
        message: 'Lấy danh sách đơn đặt hàng (PO) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getPurchaseOrderById(req, res, next) {
    try {
      const data = await this.inventoryService.getPurchaseOrderById(Number(req.params.id));
      return sendSuccess(res, {
        message: 'Lấy chi tiết đơn đặt hàng (PO) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updatePurchaseOrderStatus(req, res, next) {
    try {
      const data = await this.inventoryService.updatePurchaseOrderStatus(
        Number(req.params.id),
        req.body.status,
        req.user
      );
      return sendSuccess(res, {
        message: 'Cập nhật trạng thái đơn đặt hàng (PO) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async supplierRespondPurchaseOrder(req, res, next) {
    try {
      const data = await this.inventoryService.updatePurchaseOrderStatus(
        Number(req.params.id),
        req.body.status,
        req.user
      );
      return sendSuccess(res, {
        message: 'Nhà cung cấp phản hồi đơn đặt hàng (PO) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async supplierUpdateShippingStatus(req, res, next) {
    try {
      const data = await this.inventoryService.updatePurchaseOrderStatus(
        Number(req.params.id),
        req.body.status,
        req.user
      );
      return sendSuccess(res, {
        message: 'Cập nhật trạng thái đang giao hàng (shipping) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createGoodsReceipt(req, res, next) {
    try {
      const data = await this.inventoryService.createGoodsReceipt(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Tạo phiếu nhập kho (GR) và sinh lô hàng (Batch) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listGoodsReceipts(req, res, next) {
    try {
      const data = await this.inventoryService.listGoodsReceipts(req.query);
      return sendSuccess(res, {
        message: 'Lấy danh sách phiếu nhập kho (GR) thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async adjustInventory(req, res, next) {
    try {
      const data = await this.inventoryService.adjustInventory(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Điều chỉnh tồn kho theo lô thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listInventoryBatches(req, res, next) {
    try {
      const data = await this.inventoryService.listInventoryBatches(req.query);
      return sendSuccess(res, {
        message: 'Lấy danh sách lô hàng theo thứ tự FEFO thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async allocateStockFefo(req, res, next) {
    try {
      const data = await this.inventoryService.allocateStockFefo(req.body, req.user?.id || 1);
      return sendSuccess(res, {
        message: 'Trừ tồn kho tự động theo nguyên tắc FEFO thành công',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}

const defaultInventoryController = new InventoryController();

export { defaultInventoryController, InventoryController };
export default defaultInventoryController;
