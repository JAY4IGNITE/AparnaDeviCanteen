/**
 * Operating Hours Utility for Aparnadevi Canteen
 * Canteen operates exclusively on Sundays from 8:00 AM to 8:00 PM IST (Asia/Kolkata).
 */

function checkOperatingHours(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find(p => p.type === type)?.value;

  const weekday = getPart('weekday'); // "Sun", "Mon", etc.
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);

  if (weekday !== 'Sun') {
    return {
      isOpen: false,
      reason: 'not_sunday',
      message: 'Aparnadevi Canteen operates exclusively on Sundays. Online ordering is closed Monday through Saturday.',
      operatingHoursText: 'Sundays only, 8:00 AM – 8:00 PM IST'
    };
  }

  const currentMinutes = hour * 60 + minute;
  const openMinutes = 8 * 60;   // 08:00 AM IST
  const closeMinutes = 20 * 60; // 08:00 PM IST

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      reason: 'outside_hours',
      message: 'Aparnadevi Canteen is open on Sundays from 8:00 AM to 8:00 PM IST. Ordering is currently closed.',
      operatingHoursText: 'Sundays only, 8:00 AM – 8:00 PM IST'
    };
  }

  return {
    isOpen: true,
    operatingHoursText: 'Sundays only, 8:00 AM – 8:00 PM IST'
  };
}

module.exports = {
  checkOperatingHours
};
