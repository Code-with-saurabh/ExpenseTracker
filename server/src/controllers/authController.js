const User = require('../models/User');
const { seedCategories } = require('../utils/defaultCategories');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  currency: user.currency,
  monthlyIncome: user.monthlyIncome,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    await seedCategories(user._id);

    res.status(201).json({ success: true, token: user.getSignedJwtToken(), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, token: user.getSignedJwtToken(), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyIncome, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};
