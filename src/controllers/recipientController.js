const Recipient = require('../models/Recipient');
const Donor = require('../models/Donor');
const { generateHash } = require('../utils/blockchain');
const { findBestRecipientMatch } = require('../utils/allocation');

// @desc    Register a new recipient
// @route   POST /api/recipients
// @access  Private
exports.registerRecipient = async (req, res) => {
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
    const previousHash = await Recipient.getLatestBlockHash();
    
    // Create a recipient with the previous hash
    const recipientData = {
      ...req.body,
      previousHash
    };
    
    // Create the recipient record with blockchain data
    const recipient = await Recipient.create(recipientData);
    
    // Find potential donor matches
    const availableDonors = await Donor.find({ status: 'Available' });
    
    // Check each donor to find the best recipient match
    let bestDonorMatch = null;
    let highestScore = -1;
    
    for (const donor of availableDonors) {
      const recipients = [recipient]; // Only consider the newly registered recipient
      const match = findBestRecipientMatch(donor, recipients);
      
      if (match && match.score > highestScore) {
        highestScore = match.score;
        bestDonorMatch = donor;
      }
    }
    
    if (bestDonorMatch && highestScore > 0) {
      // Update the recipient with the allocation information
      recipient.status = 'Matched';
      recipient.allocatedDonor = bestDonorMatch._id;
      await recipient.save();
      
      // Update the donor with the allocation information
      await Donor.findByIdAndUpdate(bestDonorMatch._id, {
        status: 'Matched',
        allocatedTo: recipient._id
      });
      
      return res.status(201).json({
        success: true,
        data: recipient,
        match: {
          donor: bestDonorMatch,
          score: highestScore,
          message: 'Recipient has been matched to a donor'
        }
      });
    }
    
    return res.status(201).json({
      success: true,
      data: recipient,
      message: 'Recipient registered successfully, no matching donor found at this time'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all recipients
// @route   GET /api/recipients
// @access  Private
exports.getRecipients = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const recipients = await Recipient.find({}).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get a single recipient by hash ID
// @route   GET /api/recipients/:hash
// @access  Private
exports.getRecipientByHash = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const recipient = await Recipient.findOne({ hash: req.params.hash });
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update recipient urgency level
// @route   PUT /api/recipients/:hash/urgency
// @access  Private
exports.updateRecipientUrgency = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const { urgencyLevel } = req.body;
    
    if (!urgencyLevel || !['Low', 'Medium', 'High', 'Critical'].includes(urgencyLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid urgency level'
      });
    }
    
    const recipient = await Recipient.findOne({ hash: req.params.hash });
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Update recipient urgency
    recipient.urgencyLevel = urgencyLevel;
    await recipient.save();
    
    // If urgency is increased and no donor is allocated, try finding a match
    if ((urgencyLevel === 'High' || urgencyLevel === 'Critical') && 
        recipient.status === 'Waiting') {
      const availableDonors = await Donor.find({ status: 'Available' });
      
      if (availableDonors.length > 0) {
        // Check each donor for a potential match
        let bestDonorMatch = null;
        let highestScore = -1;
        
        for (const donor of availableDonors) {
          const recipients = [recipient];
          const match = findBestRecipientMatch(donor, recipients);
          
          if (match && match.score > highestScore) {
            highestScore = match.score;
            bestDonorMatch = donor;
          }
        }
        
        if (bestDonorMatch && highestScore > 0) {
          // Update the recipient with the allocation information
          recipient.status = 'Matched';
          recipient.allocatedDonor = bestDonorMatch._id;
          await recipient.save();
          
          // Update the donor with the allocation information
          await Donor.findByIdAndUpdate(bestDonorMatch._id, {
            status: 'Matched',
            allocatedTo: recipient._id
          });
          
          return res.status(200).json({
            success: true,
            data: recipient,
            match: {
              donor: bestDonorMatch,
              score: highestScore,
              message: 'Recipient has been matched to a donor due to urgency update'
            }
          });
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      data: recipient,
      message: 'Recipient urgency updated successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 