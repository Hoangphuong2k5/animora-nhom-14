// Routes sản phẩm + danh mục (PRD-01, PRD-02, PRD-03, PRD-04, PRD-05).
// URL giữ nguyên bản cũ.
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì các
// đường dẫn đã đầy đủ: /products, /categories, /admin/products, /admin/categories
// (xem patches/routes-index.patch.txt).
// Xem/tìm kiếm sản phẩm và danh mục là công khai; tạo/sửa/xóa cần quyền admin.
import express from 'express';
const router = express.Router();
import * as productController from '../../controllers/product.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
} from '../../validators/product.validator.js';
import { ROLES } from '../../utils/constants.js';

// [PRD-01] Tìm kiếm/lọc/phân trang sản phẩm (công khai)
router.get('/products', productController.listProducts);
// [PRD-02] Chi tiết sản phẩm + tồn kho (công khai)
router.get('/products/:id', productController.getProductById);
// [PRD-03] Danh sách danh mục (công khai)
router.get('/categories', productController.listCategories);

// [PRD-04] Admin quản lý danh mục
router.post('/admin/categories', verifyToken, authorizeRoles(ROLES.ADMIN), validate(createCategorySchema), productController.createCategory);
router.put('/admin/categories/:id', verifyToken, authorizeRoles(ROLES.ADMIN), validate(updateCategorySchema), productController.updateCategory);
router.delete('/admin/categories/:id', verifyToken, authorizeRoles(ROLES.ADMIN), productController.deleteCategory);

// [PRD-04] Admin tạo sản phẩm
router.post('/admin/products', verifyToken, authorizeRoles(ROLES.ADMIN), validate(createProductSchema), productController.createProduct);
// [PRD-05] Admin cập nhật sản phẩm
router.put('/admin/products/:id', verifyToken, authorizeRoles(ROLES.ADMIN), validate(updateProductSchema), productController.updateProduct);

export default router;
