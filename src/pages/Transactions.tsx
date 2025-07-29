import React, { useState, useEffect, useRef } from "react";
import {
  useDatabase,
  Transaction,
  TransactionItem,
} from "../context/DatabaseContext";
import { useSettings } from "../hooks/useSettings";
import {
  Search,
  Filter,
  CreditCard,
  DollarSign,
  Calendar,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ClipboardList,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Voucher } from "../components/Voucher";
import { useReactToPrint } from "react-to-print";

// TransactionDetails component
interface TransactionDetailsProps {
  transactionId: number;
  onClose: () => void;
}

export interface ItemsWithProducts extends TransactionItem {
  product?: any;
  productName?: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionId,
  onClose,
}) => {
  const { db } = useDatabase();
  const { businessSettings } = useSettings();
  const [transaction, setTransaction] = useState<Transaction | undefined>(
    undefined
  );
  const [items, setItems] = useState<ItemsWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTransactionDetails = async () => {
      if (!db) return;

      try {
        setLoading(true);

        // Get transaction
        const tx = await db.get("transactions", transactionId);
        setTransaction(tx);

        // Get transaction items
        const txItemsTx = db.transaction("transactionItems", "readonly");
        const txItemsIndex = txItemsTx.store.index("by-transaction");
        const txItems = await txItemsIndex.getAll(transactionId);

        // Get products for each item
        const productsMap = new Map();
        const productsTx = db.transaction("products", "readonly");

        for (const item of txItems) {
          if (!productsMap.has(item.productId)) {
            const product = await productsTx.store.get(item.productId);
            if (product) {
              productsMap.set(item.productId, product);
            }
          }
        }

        // Combine items with product data
        const itemsWithProducts: ItemsWithProducts[] = txItems.map((item) => ({
          ...item,
          product: productsMap.get(item.productId),
          productName:
            productsMap.get(item.productId)?.name || "Unknown Product",
        }));

        setItems(itemsWithProducts);
      } catch (error) {
        console.error("Error loading transaction details:", error);
        toast.error("Failed to load transaction details.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactionDetails();
  }, [db, transactionId]);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p className="text-center text-red-600">Transaction not found</p>
          <div className="mt-4 flex justify-center">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transaction Details</h2>
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={handlePrint}
              title="Print Receipt"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={onClose}
              title="Close"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-medium">#{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>
                {format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold">
                {businessSettings.currencySymbol}
                {transaction.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="flex items-center">
                {transaction.paymentMethod === "cash" ? (
                  <>
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    Cash
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-1 text-blue-600" />
                    Card
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : transaction.paymentStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {transaction.paymentStatus.charAt(0).toUpperCase() +
                  transaction.paymentStatus.slice(1)}
              </span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{transaction.customerName}</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-medium text-lg mb-3">Items</h3>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.productName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {businessSettings.currencySymbol}
                    {item.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                    {businessSettings.currencySymbol}
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subtotal
                </th>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-right text-xs font-medium text-gray-900"
                >
                  {businessSettings.currencySymbol}
                  {(
                    transaction.total -
                    transaction.tax +
                    transaction.discount
                  ).toFixed(2)}
                </th>
              </tr>
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tax
                </th>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-right text-xs font-medium text-gray-900"
                >
                  {businessSettings.currencySymbol}
                  {transaction.tax.toFixed(2)}
                </th>
              </tr>
              {transaction.discount > 0 && (
                <tr>
                  <th
                    colSpan={2}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Discount
                  </th>
                  <th
                    colSpan={2}
                    className="px-3 py-2 text-right text-xs font-medium text-gray-900"
                  >
                    -{businessSettings.currencySymbol}
                    {transaction.discount.toFixed(2)}
                  </th>
                </tr>
              )}
              <tr>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-left text-sm font-medium text-gray-900 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  colSpan={2}
                  className="px-3 py-2 text-right text-sm font-medium text-gray-900"
                >
                  {businessSettings.currencySymbol}
                  {transaction.total.toFixed(2)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="hidden">
        <div ref={receiptRef}>
          <Voucher
            cart={items.map((item) => ({
              ...item,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            }))}
            subtotal={
              transaction.total - transaction.tax + transaction.discount
            }
            tax={transaction.tax}
            discount={transaction.discount}
            total={transaction.total}
            customerName={transaction.customerName}
          />
        </div>
      </div>
    </div>
  );
};

// Main Transactions component
const Transactions: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { businessSettings } = useSettings();
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "all"
  >("week");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "pending" | "cancelled"
  >("all");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Pagination controls
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      if (!db) return;

      try {
        const allTransactions = await db.getAll("transactions");

        // Sort by date (newest first by default)
        allTransactions.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortDirection === "desc"
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        });

        setTransactions(allTransactions);
        filterTransactions(
          allTransactions,
          searchTerm,
          dateRange,
          statusFilter
        );
      } catch (error) {
        console.error("Error loading transactions:", error);
        toast.error("Failed to load transaction data.");
      }
    };

    if (db && !isLoading) {
      loadTransactions();
    }
  }, [db, isLoading, sortDirection]);

  useEffect(() => {
    filterTransactions(transactions, searchTerm, dateRange, statusFilter);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, dateRange, statusFilter, transactions]);

  // Filter transactions based on search, date range, and status
  const filterTransactions = (
    transactions: Transaction[],
    search: string,
    date: "today" | "week" | "month" | "all",
    status: "all" | "paid" | "pending" | "cancelled"
  ) => {
    let filtered = [...transactions];

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.customerName?.toLowerCase().includes(lowerSearch) ||
          tx.id?.toString().includes(search)
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (date === "today") {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= today;
      });
    } else if (date === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);

      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= weekStart;
      });
    } else if (date === "month") {
      const monthStart = new Date(today);
      monthStart.setMonth(today.getMonth() - 1);

      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= monthStart;
      });
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((tx) => tx.paymentStatus === status);
    }

    setFilteredTransactions(filtered);
  };

  // Handle filter changes
  useEffect(() => {
    filterTransactions(transactions, searchTerm, dateRange, statusFilter);
  }, [searchTerm, dateRange, statusFilter, transactions]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const viewTransactionDetails = (id: number) => {
    setSelectedTransaction(id);
  };

  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by customer or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            className="btn-secondary md:flex-shrink-0 flex items-center justify-center"
            onClick={toggleSortDirection}
          >
            {sortDirection === "desc" ? (
              <>
                <ArrowDownWideNarrow className="w-4 h-4 mr-1" />
                Newest First
              </>
            ) : (
              <>
                <ArrowUpWideNarrow className="w-4 h-4 mr-1" />
                Oldest First
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{tx.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tx.customerName || "Walk-in Customer"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      {tx.paymentMethod === "cash" ? (
                        <span className="inline-flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                          Cash
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <CreditCard className="w-4 h-4 mr-1 text-blue-600" />
                          Card
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : tx.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.paymentStatus.charAt(0).toUpperCase() +
                          tx.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {businessSettings.currencySymbol}
                      {tx.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1"
                        onClick={() => viewTransactionDetails(tx.id!)}
                      >
                        <ClipboardList className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No transactions found. Adjust your filters or process a
                    sale.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} entries
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === number
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Transactions
              </h3>
              <p className="text-2xl font-semibold">
                {filteredTransactions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <p className="text-2xl font-semibold">
                {businessSettings.currencySymbol}
                {filteredTransactions
                  .reduce((sum, tx) => sum + tx.total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Avg Transaction
              </h3>
              <p className="text-2xl font-semibold">
                {businessSettings.currencySymbol}
                {filteredTransactions.length > 0
                  ? (
                      filteredTransactions.reduce(
                        (sum, tx) => sum + tx.total,
                        0
                      ) / filteredTransactions.length
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction !== null && (
        <TransactionDetails
          transactionId={selectedTransaction}
          onClose={closeTransactionDetails}
        />
      )}
    </div>
  );
};

export default Transactions;
