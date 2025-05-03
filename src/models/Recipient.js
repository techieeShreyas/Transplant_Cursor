const mongoose = require('mongoose');
const { generateHash } = require('../utils/blockchain');

const RecipientSchema = new mongoose.Schema({
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
  
  // Medical urgency
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  
  // Medical condition details
  diagnosis: {
    type: String,
    required: true
  },
  
  // Status information
  status: {
    type: String,
    enum: ['Waiting', 'Matched', 'Transplanted'],
    default: 'Waiting'
  },
  
  // Matching information
  allocatedDonor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }
});

// Pre-save hook to handle blockchain aspects if hash is not provided
RecipientSchema.pre('save', function(next) {
  if (this.isNew && !this.hash) {
    const blockData = {
      name: this.name,
      bloodType: this.bloodType,
      organType: this.organType,
      hospital: this.hospital,
      urgencyLevel: this.urgencyLevel,
      timestamp: new Date().toISOString()
    };
    
    this.hash = generateHash(blockData);
  }
  
  next();
});

// Static method to create a genesis block
RecipientSchema.statics.createGenesisBlock = async function() {
  const genesisExists = await this.findOne({ previousHash: 'genesis' });
  
  if (!genesisExists) {
    const genesisBlock = new this({
      name: 'Genesis Recipient',
      age: 0,
      gender: 'Other',
      bloodType: 'AB+',
      organType: 'Heart',
      hlaType: 'N/A',
      hospital: 'System',
      hash: generateHash('genesis_recipient_block'),
      previousHash: 'genesis',
      urgencyLevel: 'Low',
      diagnosis: 'System Genesis',
      status: 'Waiting'
    });
    
    await genesisBlock.save();
    console.log('Genesis recipient block created');
    return genesisBlock;
  }
  
  return genesisExists;
};

// Static method to get latest block hash
RecipientSchema.statics.getLatestBlockHash = async function() {
  const latestBlock = await this.findOne().sort({ createdAt: -1 });
  return latestBlock ? latestBlock.hash : 'genesis';
};

const Recipient = mongoose.model('Recipient', RecipientSchema);

module.exports = Recipient; 