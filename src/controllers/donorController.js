const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const { generateHash } = require('../utils/blockchain');
const { findBestRecipientMatch } = require('../utils/allocation');

// @desc    Register a new donor
// @route   POST /api/donors
// @access  Private
exports.registerDonor = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Add hospital information from the logged-in user
    req.body.hospital = req.session.user.hospitalName;
    
    // Get latest block hash for blockchain integrity
    const previousHash = await Donor.getLatestBlockHash();
    
    // Create a donor with the previous hash
    const donorData = {
      ...req.body,
      previousHash
    };
    
    // Create the donor record with blockchain data
    const donor = await Donor.create(donorData);
    
    // Find potential recipient matches
    const availableRecipients = await Recipient.find({ status: 'Waiting' });
    const bestMatch = findBestRecipientMatch(donor, availableRecipients);
    
    if (bestMatch && bestMatch.score > 0) {
      // Update the donor with the allocation information
      donor.status = 'Matched';
      donor.allocatedTo = bestMatch.recipient._id;
      await donor.save();
      
      // Update the recipient with the allocation information
      await Recipient.findByIdAndUpdate(bestMatch.recipient._id, {
        status: 'Matched',
        allocatedDonor: donor._id
      });
      
      return res.status(201).json({
        success: true,
        data: donor,
        match: {
          recipient: bestMatch.recipient,
          score: bestMatch.score,
          message: 'Donor has been matched to a recipient'
        }
      });
    }
    
    return res.status(201).json({
      success: true,
      data: donor,
      message: 'Donor registered successfully, no matching recipient found at this time'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
exports.getDonors = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const donors = await Donor.find({}).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get a single donor by hash ID
// @route   GET /api/donors/:hash
// @access  Private
exports.getDonorByHash = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const donor = await Donor.findOne({ hash: req.params.hash });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update donor transplant status
// @route   PUT /api/donors/:hash/status
// @access  Private
exports.updateDonorStatus = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { status } = req.body;
    
    if (!status || !['Available', 'Matched', 'Transplanted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }
    
    const donor = await Donor.findOne({ hash: req.params.hash });
    
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    // Update donor status
    donor.status = status;
    await donor.save();
    
    // If status is Transplanted and there's an allocated recipient, update recipient status
    if (status === 'Transplanted' && donor.allocatedTo) {
      await Recipient.findByIdAndUpdate(donor.allocatedTo, {
        status: 'Transplanted'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: donor,
      message: 'Donor status updated successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 