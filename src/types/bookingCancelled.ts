export interface BookingCancelledData {
  id: string;
  // Header
  headerTitle: string;
  headerNote: string;
  // Operator
  operatorName: string;
  busDetails: string; // e.g. "2+1, BHARAT BENZ SLEEPER/SEATER, AC, NON-VI..."
  // Journey
  fromCity: string;
  toCity: string;
  duration: string;
  departureTime: string;
  departureDate: string;
  arrivalTime: string;
  arrivalDate: string;
  // Passenger
  passengerName: string;
  status: string; // "Refunded", "Cancelled", etc.
  // IDs
  orderId: string;
  ticketNo: string;
  // Vehicle
  busNumber: string;
  // Booking
  bookedOn: string;
  // Refund Summary
  totalAmountLabel: string;
  totalAmount: string;
  travellerCount: number;
  refundableAmount: string;
  refundProcessed: string;
  ticketBookedOn: string;
  // Meta
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultBookingCancelled: BookingCancelledData = {
  id: crypto.randomUUID(),
  headerTitle: 'Booking Cancelled',
  headerNote: 'NOTE: Refund will be credited to the original payment source',
  operatorName: 'Shri Krishna Travels(Jai Shree Gan...)',
  busDetails: '2+1, BHARAT BENZ SLEEPER/SEATER, AC, NON-VI...',
  fromCity: 'Moradabad',
  toCity: 'Jaipur',
  duration: '09h 45m',
  departureTime: '10:30 PM',
  departureDate: 'Mar 19',
  arrivalTime: '08:15 AM',
  arrivalDate: 'Mar 20',
  passengerName: 'Ankit Jangid',
  status: 'Refunded',
  orderId: '26773740632',
  ticketNo: '1142108',
  busNumber: 'UK08PA3080',
  bookedOn: '19 March 2026, 04:16 PM',
  totalAmountLabel: 'Total Amount Paid',
  totalAmount: '766.39',
  travellerCount: 1,
  refundableAmount: '766.39',
  refundProcessed: '766.39',
  ticketBookedOn: '19 March 2026, 04:16 PM',
  currency: '₹',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
