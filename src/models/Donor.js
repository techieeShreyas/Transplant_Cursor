const mongoose = require('mongoose');
const { generateHash } = require('../utils/blockchain');

const DonorSchema = new mongoose.Schema({
  // Blockchain fields
  hash: {
    type: String,
    required: true,
    unique: true
  },
  previousHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Personal information
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Medical information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  organType: {
    type: String,
    enum: ['Heart'],
    default: 'Heart'
  },
  hlaType: {
    type: String
  },
  
  // Administrative information
  hospital: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  // Status information
  status: {
    type: String,
    enum: ['Available', 'Matched', 'Transplanted'],
    default: 'Available'
  },
  
  // Matching information
  allocatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient'
  }
});

// Pre-save hook to handle blockchain aspects if hash is not provided
DonorSchema.pre('save', function(next) {
  if (this.isNew && !this.hash) {
    const blockData = {
      name: this.name,
      bloodType: this.bloodType,
      organType: this.organType,
      hospital: this.hospital,
      timestamp: new Date().toISOString()
    };
    
    this.hash = generateHash(blockData);
  }
  
  next();
});

// Static method to create a genesis block
DonorSchema.statics.createGenesisBlock = async function() {
  const genesisExists = await this.findOne({ previousHash: 'genesis' });
  
  if (!genesisExists) {
    const genesisBlock = new this({
      name: 'Genesis Donor',
      age: 0,
      gender: 'Other',
      bloodType: 'O-',
      organType: 'Heart',
      hlaType: 'N/A',
      hospital: 'System',
      hash: generateHash('genesis_donor_block'),
      previousHash: 'genesis',
      status: 'Available'
    });
    
    await genesisBlock.save();
    console.log('Genesis donor block created');
    return genesisBlock;
  }
  
  return genesisExists;
};

// Static method to get latest block hash
DonorSchema.statics.getLatestBlockHash = async function() {
  const latestBlock = await this.findOne().sort({ createdAt: -1 });
  return latestBlock ? latestBlock.hash : 'genesis';
};

const Donor = mongoose.model('Donor', DonorSchema);

module.exports = Donor; 