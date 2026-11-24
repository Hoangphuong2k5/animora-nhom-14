// Entity sản phẩm + danh mục, theo đúng schema Animora v1.5 mới
// (dbo.products / dbo.product_categories, file Animora_v1.5__1___1.sql).
// Đã BỎ HẲN so với bản v1.6 (không giữ tương thích ngược):
//  - products.slug: BỎ (dùng product_code làm mã hiển thị — D4(a));
//  - products.images (JSON nhiều ảnh): BỎ — chỉ còn 1 thumbnail_url;
//  - product_categories.slug / parent_id: BỎ — danh mục phẳng (D5);
//  - products.rating / rating_count: BỎ — không còn cột tổng hợp (D3(a));
//  - name -> product_name; price -> unit_price; category_id -> product_category_id;
//    status ('active'/'hidden') -> is_hidden (BIT).
//  - Mới: product_code (bắt buộc), sku NOT NULL (bắt buộc — PRD-04/05),
//    unit_name + product_type (NOT NULL), cost_price, target_species_codes,
//    stock_quantity + defective_quantity (tồn nằm ngay trên products),
//    default_supplier_id, lead_time_days, safety_stock_days, row_version.
import { EntitySchema } from 'typeorm';

const ProductCategoryEntity = new EntitySchema({
  name: 'ProductCategory',
  tableName: 'product_categories',
  columns: {
    product_category_id: { type: 'int', primary: true, generated: 'increment' },
    category_name: { type: 'nvarchar', length: 150, nullable: false },
    description: { type: 'nvarchar', length: 500, nullable: true },
    is_active: { type: 'bit', default: true },
  },
});

const ProductEntity = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    product_id: { type: 'bigint', primary: true, generated: 'increment' },
    sku: { type: 'nvarchar', length: 60, nullable: false },
    product_code: { type: 'nvarchar', length: 40, nullable: false }, // VD: PRD-20261124-000001
    product_category_id: { type: 'int', nullable: false },
    product_name: { type: 'nvarchar', length: 250, nullable: false },
    brand: { type: 'nvarchar', length: 150, nullable: true },
    unit_name: { type: 'nvarchar', length: 50, nullable: false }, // Viên, Hộp, Lọ...
    product_type: { type: 'nvarchar', length: 20, nullable: false }, // RETAIL, MEDICINE, VACCINE
    description: { type: 'nvarchar', length: 'MAX', nullable: true },
    thumbnail_url: { type: 'nvarchar', length: 1000, nullable: true },
    unit_price: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    cost_price: { type: 'decimal', precision: 15, scale: 2, nullable: true },
    requires_prescription: { type: 'bit', default: false },
    target_species_codes: { type: 'nvarchar', length: 100, nullable: true }, // VD: 'DOG,CAT'
    stock_quantity: { type: 'int', default: 0 },
    defective_quantity: { type: 'int', default: 0 },
    default_supplier_id: { type: 'bigint', nullable: true },
    lead_time_days: { type: 'int', default: 3 },
    safety_stock_days: { type: 'int', default: 7 },
    is_hidden: { type: 'bit', default: false },
    row_version: { type: 'int', default: 1 },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

export { ProductEntity, ProductCategoryEntity };
