export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface Student {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  countryOrigin: string; cityOrigin?: string; university?: string; career?: string; semester?: number;
  status: boolean; advisorId?: string; advisor?: any; createdAt: string;
}
export interface Document {
  id: string; studentId: string; type: string; name: string; description?: string; category?: string;
  fileUrl: string; fileSize?: number; fileType?: string; status: string; createdAt: string;
}
export interface Visa {
  id: string; studentId: string; visaType: string; visaNumber?: string; country: string;
  issueDate: string; expiryDate: string; status: string; computedStatus?: string; daysLeft?: number;
}
export interface PaymentPlan {
  id: string; studentId: string; concept: string; totalAmount: number; installments: number; startDate: string; status: string; installmentsList?: Installment[];
}
export interface Installment { id: string; planId: string; number: number; amount: number; dueDate: string; status: string; paidAt?: string; }
export interface Event {
  id: string; title: string; description?: string; eventDate: string; location?: string; qrCode: string; uniqueLink: string; reminderSent: boolean;
}
export interface Notification {
  id: string; userId: string; type: string; title: string; message: string; read: boolean; createdAt: string;
}
export interface DashboardSummary {
  students: { total: number; active: number; newThisMonth: number };
  documents: { total: number; pending: number };
  visas: { expiringIn90Days: number; expired: number };
  payments: { pending: number; overdue: number; totalAmount: number };
  events: { next7Days: number; total: number };
  users?: { total: number };
}
