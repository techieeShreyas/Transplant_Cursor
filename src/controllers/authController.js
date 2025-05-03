const User = require('../models/User');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create session for the user
    req.session.user = {
      id: user._id,
      hospitalName: user.hospitalName,
      hospitalId: user.hospitalId,
      email: user.email,
      role: user.role
    };
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        hospitalName: user.hospitalName,
        hospitalId: user.hospitalId,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not log out, please try again'
      });
    }
    
    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  try {
    const user = await User.findById(req.session.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        hospitalName: user.hospitalName,
        hospitalId: user.hospitalId,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Register a new hospital (admin only in a real system)
// @route   POST /api/auth/register
// @access  Public (for demo, would be Admin only in production)
exports.register = async (req, res) => {
  try {
    const { hospitalName, hospitalId, email, password, address, phone } = req.body;

    // Create user
    const user = await User.create({
      hospitalName,
      hospitalId,
      email,
      password,
      address,
      phone
    });

    // Create session for the user (auto-login)
    req.session.user = {
      id: user._id,
      hospitalName: user.hospitalName,
      hospitalId: user.hospitalId,
      email: user.email,
      role: user.role
    };

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      data: {
        id: user._id,
        hospitalName: user.hospitalName,
        hospitalId: user.hospitalId,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with that email, name, or ID already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 