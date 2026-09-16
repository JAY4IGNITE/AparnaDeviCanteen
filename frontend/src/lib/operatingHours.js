/**
 * Operating Hours utility for Aparnadevi Canteen.
 * Timings are not fixed; online ordering is managed live by the canteen administrator.
 */

export function checkOperatingHours() {
  return {
    isOpen: true,
    operatingHoursText: 'Admin-Controlled Live Service',
    message: ''
  };
}
