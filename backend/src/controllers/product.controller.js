// Controller sản phẩm + danh mục (PRD-01–05).
import * as productService from '../services/product.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return successResponse(res, result.data, 'Lấy danh sách sản phẩm thành công', 200, result.pagination);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return successResponse(res, product, 'Lấy thông tin sản phẩm thành công');
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await productService.listCategories();
  return successResponse(res, categories, 'Lấy danh sách danh mục thành công');
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await productService.createCategory(req.body);
  return successResponse(res, category, 'Tạo danh mục thành công', 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await productService.updateCategory(req.params.id, req.body);
  return successResponse(res, category, 'Cập nhật danh mục thành công');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await productService.deleteCategory(req.params.id);
  return successResponse(res, result, 'Xóa danh mục thành công');
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return successResponse(res, product, 'Thêm sản phẩm thành công', 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user.id);
  return successResponse(res, product, 'Cập nhật sản phẩm thành công');
});

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
