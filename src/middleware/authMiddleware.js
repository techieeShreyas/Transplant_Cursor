// Middleware to check if user is authenticated
exports.protect = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }
  
  next();
};

// Middleware to restrict access based on user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }
    
    next();
  };
};

// Middleware to simulate blockchain integrity check
exports.verifyBlockchainIntegrity = (model) => {
  return async (req, res, next) => {
    try {
      // In a production system, this would perform an actual blockchain integrity check
      // For demonstration purposes, we'll just check if the model exists
      if (!model) {
        return res.status(500).json({
          success: false,
          message: 'Blockchain model unavailable'
        });
      }
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Error verifying blockchain integrity'
      });
    }
  };
}; 