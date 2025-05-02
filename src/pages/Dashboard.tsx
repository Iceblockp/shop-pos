import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  DollarSign, BarChart2, Calendar, Clock
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [productCount, setProductCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });
  
  const [salesData, setSalesData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
      },
    ],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!db) return;
      
      try {
        // Create a single transaction for all read operations
        const tx = db.transaction(['products', 'stock', 'transactions', 'categories'], 'readonly');
        const productsStore = tx.objectStore('products');
        const stockStore = tx.objectStore('stock');
        const transactionsStore = tx.objectStore('transactions');
        const categoriesStore = tx.objectStore('categories');
        const txIndex = transactionsStore.index('by-date');

        // Fetch all data within the transaction
        const [
          products,
          stockItems,
          categories
        ] = await Promise.all([
          productsStore.getAll(),
          stockStore.getAll(),
          categoriesStore.getAll()
        ]);

        // Get today's transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTx = await txIndex.getAll(IDBKeyRange.lowerBound(today));

        // Get past week's transactions for sales data
        const pastWeekTx: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          const dailyTransactions = await txIndex.getAll(IDBKeyRange.bound(date, nextDay));
          pastWeekTx.push({
            date: format(date, 'EEE'),
            transactions: dailyTransactions
          });
        }

        // Wait for transaction to complete
        await tx.done;

        // Now process the data
        setProductCount(products.length);
        
        const lowStock = stockItems.filter(item => item.quantity < 5);
        setLowStockCount(lowStock.length);
        
        setTodayTransactions(todayTx.length);
        setTodaySales(todayTx.reduce((sum, tx) => sum + tx.total, 0));
        
        const recentTx = todayTx.slice(0, 5).map(tx => ({
          id: tx.id,
          date: format(tx.createdAt, 'HH:mm'),
          total: tx.total,
          status: tx.paymentStatus
        }));
        
        setRecentTransactions(recentTx);
        
        // Process category data
        const categoryLabels = categories.map(c => c.name);
        const categoryCounts = categories.map(category => 
          products.filter(p => p.categoryId === category.id).length
        );
        
        const backgroundColors = [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ];
        
        setCategoryData({
          labels: categoryLabels,
          datasets: [
            {
              data: categoryCounts,
              backgroundColor: backgroundColors.slice(0, categories.length),
            },
          ],
        });
        
        // Process sales data
        const salesValues = pastWeekTx.map(day => 
          day.transactions.reduce((sum, tx) => sum + tx.total, 0)
        );
        
        setSalesData({
          labels: pastWeekTx.map(day => day.date),
          datasets: [
            {
              label: 'Sales',
              data: salesValues,
              backgroundColor: 'rgba(37, 99, 235, 0.6)',
            },
          ],
        });
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    if (db && !isLoading) {
      loadDashboardData();
    }
    
  }, [db, isLoading]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-semibold">{productCount}</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <p className="text-2xl font-semibold">{lowStockCount}</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Today's Sales</p>
            <p className="text-2xl font-semibold">${todaySales.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="text-2xl font-semibold">{todayTransactions}</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Weekly Sales</h2>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Last 7 days
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `$${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Categories</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                },
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-blue-600 hover:text-blue-800">
            View all
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{tx.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {tx.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ${tx.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                    No transactions today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <a href="/sales" className="card flex flex-col items-center p-5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="font-medium">New Sale</h3>
        </a>
        
        <a href="/products" className="card flex flex-col items-center p-5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-medium">Add Product</h3>
        </a>
        
        <a href="/inventory" className="card flex flex-col items-center p-5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-3">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="font-medium">Update Stock</h3>
        </a>
        
        <a href="/transactions" className="card flex flex-col items-center p-5 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-medium">View Reports</h3>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;