import defaultNotificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class NotificationController {
  constructor(notificationService = defaultNotificationService) {
    this.notificationService = notificationService;

    this.list = asyncHandler(this.list.bind(this));
    this.unreadCount = asyncHandler(this.unreadCount.bind(this));
    this.markAsRead = asyncHandler(this.markAsRead.bind(this));
    this.markAllAsRead = asyncHandler(this.markAllAsRead.bind(this));
  }

  async list(req, res) {
    const result = await this.notificationService.listMyNotifications(req.user.id, req.query);
    return paginatedResponse(
      res,
      result.items,
      result.page,
      result.limit,
      result.total,
      'Lấy danh sách thông báo thành công'
    );
  }

  async unreadCount(req, res) {
    const data = await this.notificationService.getUnreadCount(req.user.id);
    return successResponse(res, data, 'Lấy số thông báo chưa đọc thành công');
  }

  async markAsRead(req, res) {
    const data = await this.notificationService.markAsRead(req.user.id, req.params.id);
    return successResponse(res, data, 'Đã đánh dấu đã đọc');
  }

  async markAllAsRead(req, res) {
    const data = await this.notificationService.markAllAsRead(req.user.id);
    return successResponse(res, data, 'Đã đánh dấu tất cả là đã đọc');
  }
}

const defaultNotificationController = new NotificationController();
export { defaultNotificationController, NotificationController };
export default defaultNotificationController;
