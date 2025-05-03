const express = require('express');
const { 
  registerDonor, 
  getDonors, 
  getDonorByHash, 
  updateDonorStatus 
} = require('../controllers/donorController');
const { protect, verifyBlockchainIntegrity } = require('../middleware/authMiddleware');
const Donor = require('../models/Donor');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(verifyBlockchainIntegrity(Donor));

router.route('/')
  .post(registerDonor)
  .get(getDonors);

router.route('/:hash')
  .get(getDonorByHash);

router.route('/:hash/status')
  .put(updateDonorStatus);

module.exports = router; 