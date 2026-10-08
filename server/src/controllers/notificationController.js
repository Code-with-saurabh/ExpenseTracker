const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.json({ success: true, data: items, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const item = await Notification.findOne({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    item.read = true;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const item = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
