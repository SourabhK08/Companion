/**
 * Mock data for the Wallet page.
 *
 * ⚠️  DEV ONLY — Replace with real API calls when backend is ready.
 * Matches: GET /api/users/me/wallet
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  subtitle: string;
  type: "payment" | "add-money" | "refund";
  amount: number;
  status: "success" | "pending" | "failed";
}

export interface WalletData {
  balance: number;
  walletId: string;
  totalDeposited: number;
  totalSpent: number;
  totalTransactions: number;
}

export const walletData: WalletData = {
  balance: 2450,
  walletId: "MDP12345678",
  totalDeposited: 5000,
  totalSpent: 2550,
  totalTransactions: 12,
};

export const transactions: Transaction[] = [
  {
    id: "txn-001",
    date: "28 Jun 2025, 06:45 PM",
    description: "Booking Payment",
    subtitle: "Ananya Sharma • Coffee Experience",
    type: "payment",
    amount: -799,
    status: "success",
  },
  {
    id: "txn-002",
    date: "25 Jun 2025, 03:12 PM",
    description: "Money Added",
    subtitle: "UPI (Google Pay)",
    type: "add-money",
    amount: 1000,
    status: "success",
  },
  {
    id: "txn-003",
    date: "20 Jun 2025, 11:08 AM",
    description: "Booking Payment",
    subtitle: "Isha Verma • Café Hopping",
    type: "payment",
    amount: -699,
    status: "success",
  },
  {
    id: "txn-004",
    date: "15 Jun 2025, 07:22 PM",
    description: "Money Added",
    subtitle: "UPI (PhonePe)",
    type: "add-money",
    amount: 500,
    status: "success",
  },
  {
    id: "txn-005",
    date: "10 Jun 2025, 12:16 PM",
    description: "Refund Received",
    subtitle: "Booking Cancelled • Priya Singh",
    type: "refund",
    amount: 399,
    status: "success",
  },
  {
    id: "txn-006",
    date: "05 Jun 2025, 09:30 PM",
    description: "Booking Payment",
    subtitle: "Tiya Ghosh • Movie Night",
    type: "payment",
    amount: -1199,
    status: "success",
  },
];
