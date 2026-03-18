export interface TravellerDetail {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  seatNo: string;
}

export interface CancellationPolicy {
  id: string;
  timeRange: string;
  refundPercentage: string;
  refundAmount: string;
}

export interface TicketData {
  id: string;
  // Header
  operatorContact: string;
  operatorPhone2: string;
  pnr: string;
  ticketId: string;
  orderId: string;
  // Journey
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  departureDate: string;
  arrivalTime: string;
  arrivalDate: string;
  // Operator
  busOperatorName: string;
  driverContact: string;
  driverContact2: string;
  vehicleNumber: string;
  // Points
  boardingPoint: string;
  boardingAddress: string;
  droppingPoint: string;
  droppingAddress: string;
  reportingTime: string;
  boardingTime: string;
  // Bus
  busType: string;
  busClass: string;
  // Travellers
  travellers: TravellerDetail[];
  // Fare
  baseFare: number;
  travellerCount: number;
  operatorGST: number;
  travelInsurance: number;
  serviceCharge: number;
  totalAmount: number;
  currency: string;
  // Cancellation
  cancellationPolicies: CancellationPolicy[];
  serviceStartTime: string;
  // Footer
  footerNote: string;
  // Meta
  createdAt: string;
  updatedAt: string;
}

export const defaultTicket: TicketData = {
  id: crypto.randomUUID(),
  operatorContact: '',
  operatorPhone2: '',
  pnr: '',
  ticketId: '',
  orderId: '',
  departureCity: 'DEPARTURE CITY',
  arrivalCity: 'ARRIVAL CITY',
  departureTime: '11:20 PM',
  departureDate: new Date().toISOString().split('T')[0],
  arrivalTime: '7:00 AM',
  arrivalDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  busOperatorName: 'Bus Operator Name',
  driverContact: '',
  driverContact2: '',
  vehicleNumber: '',
  boardingPoint: 'Boarding Point Name',
  boardingAddress: 'Boarding Point Address',
  droppingPoint: 'Dropping Point Name',
  droppingAddress: 'Dropping Point Address',
  reportingTime: '11:05 PM',
  boardingTime: '11:20 PM',
  busType: 'Sleeper',
  busClass: 'AC',
  travellers: [
    { id: crypto.randomUUID(), name: 'Passenger Name', gender: 'Male', age: 25, seatNo: 'A1' },
  ],
  baseFare: 0,
  travellerCount: 1,
  operatorGST: 0,
  travelInsurance: 0,
  serviceCharge: 0,
  totalAmount: 0,
  currency: '₹',
  cancellationPolicies: [
    { id: crypto.randomUUID(), timeRange: 'Before departure', refundPercentage: '50%', refundAmount: '₹ 0' },
  ],
  serviceStartTime: '10:45 PM',
  footerNote: 'This is an e-ticket. Please carry a valid ID proof during travel.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
