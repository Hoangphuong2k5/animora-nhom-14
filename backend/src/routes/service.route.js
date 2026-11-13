const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createServiceSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
} = require("../validators/service.validator");
const { ROLES } = require("../utils/constants");

// [SVC-01] Xem danh sách và chi tiết dịch vụ (Public cho khách hàng & hệ thống)
router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getServiceById);

// [SVC-01] Admin quản lý danh mục dịch vụ
router.post(
  "/",
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(createServiceSchema),
  serviceController.createService,
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(updateServiceSchema),
  serviceController.updateService,
);

router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(updateServiceStatusSchema),
  serviceController.updateServiceStatus,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  serviceController.deleteService,
);

module.exports = router;
