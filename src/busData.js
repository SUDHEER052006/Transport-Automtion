// Master route list for GCET transport.
// Bus numbers, meter readings and live status are filled in by the
// Watch Tower (guard) during the day — they start empty/idle here so the
// data shape is consistent everywhere it is read.
const routeNames = [
  'Route 1', 'Route 2', 'Route 3', 'Route 4A', 'Route 4B', 'Route 5',
  'Route 6', 'Route 7', 'Route 8', 'Route 9', 'Route 10', 'Route 11',
  'Route 12', 'Route 13', 'Route 14', 'Route 15', 'Route 16', 'Route 17',
  'Route 18', 'Route 20', 'Route 21', 'Route 23', 'Route 24', 'Route 27',
  'Route 28', 'Route 29', 'Route 31', 'Route 33', 'Route 34', 'Route 35A',
  'Route 35B', 'Route 36', 'Route 37', 'Route 39',
];

export const allBuses = routeNames.map((routeName, i) => ({
  id: i + 1,
  routeName,
  busNo: '',
  startPoint: '',
  endPoint: 'GCET Campus',
  status: 'Idle',
  inTime: null,
  outTime: null,
  inReading: null,
  outReading: null,
}));
