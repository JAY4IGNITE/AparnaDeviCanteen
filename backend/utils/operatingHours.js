/**
 * Operating Hours Utility for Aparnadevi Canteen
 * Timings are not fixed; ordering is controlled directly by Admin activation.
 */

function checkOperatingHours() {
  return {
    isOpen: true,
    operatingHoursText: 'Admin-Controlled Live Service'
  };
}

module.exports = {
  checkOperatingHours
};
