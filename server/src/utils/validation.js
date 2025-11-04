const allowedDomains = ['uts.edu.co', 'correo.uts.edu.co'];

function isInstitutionalEmail(email) {
  const lower = String(email || '').toLowerCase().trim();
  const at = lower.lastIndexOf('@');
  if (at === -1) return false;
  const domain = lower.slice(at + 1);
  return allowedDomains.includes(domain);
}

module.exports = { allowedDomains, isInstitutionalEmail };





