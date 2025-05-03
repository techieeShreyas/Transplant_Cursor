const express = require('express');
const { 
  registerRecipient, 
  getRecipients, 
  getRecipientByHash, 
  updateRecipientUrgency 
} = require('../controllers/recipientController');
const { protect, verifyBlockchainIntegrity } = require('../middleware/authMiddleware');
const Recipient = require('../models/Recipient');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
router.use(verifyBlockchainIntegrity(Recipient));

router.route('/')
  .post(registerRecipient)
  .get(getRecipients);

router.route('/:hash')
  .get(getRecipientByHash);

router.route('/:hash/urgency')
  .put(updateRecipientUrgency);

module.exports = router; 