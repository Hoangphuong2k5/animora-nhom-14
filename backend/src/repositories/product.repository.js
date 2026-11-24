// Repository sản phẩm + danh mục — theo schema Animora v1.5 mới.
// Đã BỎ HẲN: findBySlug (products.slug đã bỏ), countChildCategories
// (product_categories.parent_id đã bỏ), mọi join inventory_batches
// (tồn nằm ngay trên products.stock_quantity).
// Tồn kho đọc trực tiếp products.stock_quantity + defective_quantity.
import { AppDataSource } from '../config/data-source.js';
import { ProductEntity, ProductCategoryEntity } from '../entities/product.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getProductRepo = (manager = null) => (manager || AppDataSource).getRepository(ProductEntity);
const getCategoryRepo = (manager = null) => (manager || AppDataSource).getRepository(ProductCategoryEntity);

const findProductById = async (productId, manager = null) => {
  return getProductRepo(manager).findOne({ where: { product_id: Number(productId) } });
};

const findProductBySku = async (sku, excludeId = null, manager = null) => {
  const queryBuilder = getProductRepo(manager).createQueryBuilder('p');
  queryBuilder.where('p.sku = :sku', { sku });
  if (excludeId) {
    queryBuilder.andWhere('p.product_id != :excludeId', { excludeId: Number(excludeId) });
  }
  return queryBuilder.getOne();
};

const searchProducts = async ({ q, category_id, page = 1, limit = 20, sort = 'newest', only_visible = false }) => {
  const queryBuilder = getProductRepo().createQueryBuilder('p');
  if (only_visible) {
    queryBuilder.andWhere('p.is_hidden = :isHidden', { isHidden: false });
  }
  if (q) {
    queryBuilder.andWhere(
      '(p.product_name LIKE :q OR p.description LIKE :q)',
      { q: `%${q}%` },
    );
  }
  if (category_id) {
    queryBuilder.andWhere('p.product_category_id = :categoryId', { categoryId: Number(category_id) });
  }
  if (sort === 'price_asc') {
    queryBuilder.orderBy('p.unit_price', 'ASC');
  } else if (sort === 'price_desc') {
    queryBuilder.orderBy('p.unit_price', 'DESC');
  } else {
    queryBuilder.orderBy('p.created_at', 'DESC');
  }

  const total = await queryBuilder.getCount();
  const products = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  const categories = await getCategoryRepo().find();
  const categoryNameMap = new Map(categories.map((category) => [category.product_category_id, category.category_name]));

  const items = products.map((product) => ({
    ...product,
    category_name: categoryNameMap.get(product.product_category_id) || null,
  }));
  return { data: items, total };
};

const getProductDetailWithStock = async (productId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT p.*, c.category_name AS category_name,
            p.stock_quantity AS stock_available, p.defective_quantity AS defective_quantity
     FROM dbo.products p
     LEFT JOIN dbo.product_categories c ON c.product_category_id = p.product_category_id
     WHERE p.product_id = @0`,
    [Number(productId)],
  );
  return rows[0] || null;
};

const createProduct = async (productData, manager = null) => {
  const product = getProductRepo(manager).create(productData);
  return getProductRepo(manager).save(product);
};

const updateProduct = async (productId, productData, manager = null) => {
  const repo = getProductRepo(manager);
  await repo.update({ product_id: Number(productId) }, productData);
  return findProductById(productId, manager);
};

// --- Danh mục (phẳng, không còn parent_id) ---

const listCategories = async (manager = null) => {
  return getCategoryRepo(manager).find({ order: { category_name: 'ASC' } });
};

const findCategoryById = async (categoryId, manager = null) => {
  return getCategoryRepo(manager).findOne({ where: { product_category_id: Number(categoryId) } });
};

const createCategory = async (categoryData, manager = null) => {
  const category = getCategoryRepo(manager).create(categoryData);
  return getCategoryRepo(manager).save(category);
};

const updateCategory = async (categoryId, categoryData, manager = null) => {
  const repo = getCategoryRepo(manager);
  await repo.update({ product_category_id: Number(categoryId) }, categoryData);
  return findCategoryById(categoryId, manager);
};

const deleteCategory = async (categoryId, manager = null) => {
  const repo = getCategoryRepo(manager);
  await repo.delete({ product_category_id: Number(categoryId) });
};

const countProductsByCategory = async (categoryId, manager = null) => {
  return getProductRepo(manager).count({ where: { product_category_id: Number(categoryId) } });
};

export {
  findProductById,
  findProductBySku,
  searchProducts,
  getProductDetailWithStock,
  createProduct,
  updateProduct,
  listCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  countProductsByCategory,
};
