// Compatibility check for blood types
const areBloodTypesCompatible = (donorType, recipientType) => {
  const compatibilityMap = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };

  return compatibilityMap[donorType]?.includes(recipientType) || false;
};

// Calculate matching score between donor and recipient
const calculateMatchScore = (donor, recipient) => {
  let score = 0;
  
  // Blood type compatibility is a must
  if (!areBloodTypesCompatible(donor.bloodType, recipient.bloodType)) {
    return -1; // Not compatible
  }
  
  // Age factor (closer age = higher score)
  const ageDifference = Math.abs(donor.age - recipient.age);
  score += 100 - Math.min(ageDifference, 100); // Max 100 points
  
  // Urgency factor
  if (recipient.urgencyLevel === 'Critical') score += 200;
  else if (recipient.urgencyLevel === 'High') score += 100;
  else if (recipient.urgencyLevel === 'Medium') score += 50;
  
  // HLA match approximation (simplified)
  if (donor.hlaType === recipient.hlaType) score += 150;
  
  // Time on waiting list (1 point per day, max 365)
  const waitDays = Math.floor((new Date() - new Date(recipient.registrationDate)) / (1000 * 60 * 60 * 24));
  score += Math.min(waitDays, 365);
  
  return score;
};

// Find the best recipient match for a donor
const findBestRecipientMatch = (donor, recipients) => {
  if (!recipients || recipients.length === 0) {
    return null;
  }
  
  let bestMatch = null;
  let highestScore = -1;
  
  recipients.forEach(recipient => {
    const score = calculateMatchScore(donor, recipient);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        recipient,
        score
      };
    }
  });
  
  return bestMatch;
};

module.exports = {
  areBloodTypesCompatible,
  calculateMatchScore,
  findBestRecipientMatch
}; 