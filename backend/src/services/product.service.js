// Service sản phẩm + danh mục (PRD-01–05) — theo schema Animora v1.5 mới.
// Đã BỎ HẲN so với bản cũ: toSlug/uniqueSlug (products.slug đã bỏ),
// toImagesJson (products.images đã bỏ), countChildCategories
// (product_categories.parent_id đã bỏ), join inventory_batches
// (tồn nằm ngay trên products.stock_quantity), products.rating/rating_count.
// PRD-01: xem danh sách (chỉ hàng đang hiện, lọc/tìm/sắp xếp).
// PRD-02: xem chi tiết + tồn kho thực tế.
// PRD-03: xem danh mục. PRD-04: quản lý danh mục (admin).
// PRD-05: thêm/sửa sản phẩm (admin, ghi audit log vào system_audit_logs).
import { AppDataSource } from '../config/data-source.js';
import * as productRepository from '../repositories/product.repository.js';
import * as petRepository from '../repositories/pet-phuong.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';

// PRD-01: Danh sách sản phẩm (chỉ hàng đang hiện).
const listProducts = async (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const result = await productRepository.searchProducts({
    q: query.q || null,
    category_id: query.category_id || null,
    page,
    limit,
    sort: query.sort || 'newest',
    only_visible: true,
  });
  return {
    data: result.data,
    pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) },
  };
};

// PRD-02: Chi tiết sản phẩm + tồn kho.
const getProductById = async (productId) => {
  const product = await productRepository.getProductDetailWithStock(productId);
  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm', 'PRODUCT_NOT_FOUND');
  }
  return product;
};

// PRD-03: Danh sách danh mục (phẳng).
const listCategories = async () => productRepository.listCategories();

// PRD-04: Tạo danh mục (admin).
const createCategory = async (payload) => {
  return productRepository.createCategory({
    category_name: payload.category_name,
    description: payload.description || null,
    is_active: payload.is_active === undefined ? true : !!payload.is_active,
  });
};

// PRD-04: Sửa danh mục (admin).
const updateCategory = async (categoryId, payload) => {
  const category = await productRepository.findCategoryById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Không tìm thấy danh mục', 'CATEGORY_NOT_FOUND');
  }
  const patch = {};
  if (payload.category_name !== undefined) patch.category_name = payload.category_name;
  if (payload.description !== undefined) patch.description = payload.description;
  if (payload.is_active !== undefined) patch.is_active = !!payload.is_active;
  return productRepository.updateCategory(categoryId, patch);
};

// PRD-04: Xóa danh mục (admin) — chỉ xóa khi không còn sản phẩm.
const deleteCategory = async (categoryId) => {
  const category = await productRepository.findCategoryById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Không tìm thấy danh mục', 'CATEGORY_NOT_FOUND');
  }
  const productCount = await productRepository.countProductsByCategory(categoryId);
  if (productCount > 0) {
    throw new ApiError(409, 'Không thể xóa danh mục vì vẫn còn sản phẩm', 'CATEGORY_HAS_PRODUCTS');
  }
  await productRepository.deleteCategory(categoryId);
  return { deleted: true };
};

// PRD-05: Thêm sản phẩm (admin). sku + unit_name bắt buộc theo schema.
const createProduct = async (payload) => {
  const category = await productRepository.findCategoryById(payload.product_category_id);
  if (!category) {
    throw new ApiError(404, 'Không tìm thấy danh mục', 'CATEGORY_NOT_FOUND');
  }
  const duplicateSku = await productRepository.findProductBySku(payload.sku);
  if (duplicateSku) {
    throw new ApiError(409, 'SKU đã tồn tại', 'DUPLICATE_SKU');
  }

  return productRepository.createProduct({
    sku: payload.sku,
    product_code: generateCode('PRD'),
    product_category_id: Number(payload.product_category_id),
    product_name: payload.product_name,
    brand: payload.brand || null,
    unit_name: payload.unit_name,
    product_type: payload.product_type || 'RETAIL',
    description: payload.description || null,
    thumbnail_url: payload.thumbnail_url || null,
    unit_price: Number(payload.unit_price),
    cost_price: payload.cost_price !== undefined && payload.cost_price !== null ? Number(payload.cost_price) : null,
    requires_prescription: payload.requires_prescription ? true : false,
    target_species_codes: payload.target_species_codes || null,
    stock_quantity: payload.stock_quantity ? Number(payload.stock_quantity) : 0,
    defective_quantity: payload.defective_quantity ? Number(payload.defective_quantity) : 0,
    default_supplier_id: payload.default_supplier_id ? Number(payload.default_supplier_id) : null,
    lead_time_days: payload.lead_time_days ? Number(payload.lead_time_days) : 3,
    safety_stock_days: payload.safety_stock_days ? Number(payload.safety_stock_days) : 7,
    is_hidden: payload.is_hidden ? true : false,
  });
};

// PRD-05: Sửa sản phẩm (admin), ghi audit log (best-effort).
const updateProduct = async (productId, payload, adminId) => {
  const oldProduct = await productRepository.findProductById(productId);
  if (!oldProduct) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm', 'PRODUCT_NOT_FOUND');
  }

  if (payload.sku) {
    const duplicateSku = await productRepository.findProductBySku(payload.sku, productId);
    if (duplicateSku) {
      throw new ApiError(409, 'SKU đã tồn tại', 'DUPLICATE_SKU');
    }
  }
  if (payload.product_category_id) {
    const category = await productRepository.findCategoryById(payload.product_category_id);
    if (!category) {
      throw new ApiError(404, 'Không tìm thấy danh mục', 'CATEGORY_NOT_FOUND');
    }
  }

  const patch = {};
  if (payload.sku !== undefined) patch.sku = payload.sku;
  if (payload.product_name !== undefined) patch.product_name = payload.product_name;
  if (payload.brand !== undefined) patch.brand = payload.brand;
  if (payload.unit_name !== undefined) patch.unit_name = payload.unit_name;
  if (payload.product_type !== undefined) patch.product_type = payload.product_type;
  if (payload.description !== undefined) patch.description = payload.description;
  if (payload.thumbnail_url !== undefined) patch.thumbnail_url = payload.thumbnail_url;
  if (payload.unit_price !== undefined) patch.unit_price = Number(payload.unit_price);
  if (payload.cost_price !== undefined) patch.cost_price = payload.cost_price === null ? null : Number(payload.cost_price);
  if (payload.requires_prescription !== undefined) patch.requires_prescription = !!payload.requires_prescription;
  if (payload.target_species_codes !== undefined) patch.target_species_codes = payload.target_species_codes;
  if (payload.stock_quantity !== undefined) patch.stock_quantity = Number(payload.stock_quantity);
  if (payload.defective_quantity !== undefined) patch.defective_quantity = Number(payload.defective_quantity);
  if (payload.default_supplier_id !== undefined) {
    patch.default_supplier_id = payload.default_supplier_id ? Number(payload.default_supplier_id) : null;
  }
  if (payload.lead_time_days !== undefined) patch.lead_time_days = Number(payload.lead_time_days);
  if (payload.safety_stock_days !== undefined) patch.safety_stock_days = Number(payload.safety_stock_days);
  if (payload.product_category_id !== undefined) patch.product_category_id = Number(payload.product_category_id);
  if (payload.is_hidden !== undefined) patch.is_hidden = !!payload.is_hidden;
  patch.row_version = (oldProduct.row_version || 1) + 1;

  const updated = await productRepository.updateProduct(productId, patch);

  // Ghi audit log (không làm hỏng việc sửa nếu ghi lỗi).
  try {
    await petRepository.createAuditLog({
      actor_user_id: adminId,
      actor_role: 'AD',
      audit_group: 'WAREHOUSE_SHOP_PO',
      action_type: 'UPDATE_PRODUCT',
      entity_name: 'product',
      entity_id: productId,
      old_values: JSON.stringify(oldProduct),
      new_values: JSON.stringify(updated),
      reason: null,
      ip_address: null,
    });
  } catch (error) {
    // Bỏ qua lỗi ghi audit.
  }

  return updated;
};

export {
  listProducts,
  getProductById,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
};
