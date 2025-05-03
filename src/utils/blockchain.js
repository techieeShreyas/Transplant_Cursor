const crypto = require('crypto');

// Generate a SHA256 hash of the given data
const generateHash = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(typeof data === 'object' ? JSON.stringify(data) : String(data));
  return hash.digest('hex');
};

// Generate a unique record ID based on key fields
const generateRecordHash = (record) => {
  // Extract key fields for hashing
  const { bloodType, organType, hospital } = record;
  const timestamp = new Date().toISOString();
  
  // Create a string from key fields
  const dataString = `${bloodType}${organType}${hospital}${timestamp}`;
  
  // Return the hash of this string
  return generateHash(dataString);
};

// Validate blockchain integrity by checking hash links
const validateBlockchain = (records) => {
  for (let i = 1; i < records.length; i++) {
    const currentBlock = records[i];
    const previousBlock = records[i - 1];
    
    // Verify the previous hash reference
    if (currentBlock.previousHash !== previousBlock.hash) {
      return {
        valid: false,
        message: `Chain broken at record ${i}: Previous hash mismatch`
      };
    }
    
    // Recalculate the hash to verify it hasn't been tampered with
    const calculatedHash = generateHash({
      ...currentBlock,
      hash: undefined // Exclude the hash itself from the calculation
    });
    
    if (calculatedHash !== currentBlock.hash) {
      return {
        valid: false,
        message: `Chain broken at record ${i}: Hash mismatch`
      };
    }
  }
  
  return {
    valid: true,
    message: 'Blockchain integrity verified'
  };
};

module.exports = {
  generateHash,
  generateRecordHash,
  validateBlockchain
}; 