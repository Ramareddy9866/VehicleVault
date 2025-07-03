// Format a date as DD/MM/YY
export const formatDateDDMMYY = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d)) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

// Check service status by next date
export const getServiceStatus = (nextServiceDate) => {
  if (!nextServiceDate) {
    return { label: 'N/A', color: 'default', isPlaceholder: true };
  }
  const today = new Date();
  const serviceDate = new Date(nextServiceDate);
  if (isNaN(serviceDate.getTime())) {
    return { label: 'N/A', color: 'default', isPlaceholder: true };
  }
  const daysUntilService = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntilService < 0) {
    return { label: 'N/A', color: 'default', isPlaceholder: true, isOverdue: true };
  } else if (daysUntilService <= 7) {
    return { label: 'Due Soon', color: 'warning' };
  } else {
    return { label: 'Scheduled', color: 'success' };
  }
}; 