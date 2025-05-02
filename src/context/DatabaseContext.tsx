import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define database schema
interface MiniMarketDB extends DBSchema {
  products: {
    key: number;
    value: Product;
    indexes: { 'by-barcode': string; 'by-category': number };
  };
  categories: {
    key: number;
    value: Category;
  };
  suppliers: {
    key: number;
    value: Supplier;
  };
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': Date };
  };
  transactionItems: {
    key: number;
    value: TransactionItem;
    indexes: { 'by-transaction': number };
  };
  stock: {
    key: number;
    value: StockItem;
    indexes: { 'by-product': number };
  };
}

// Define types
export interface Product {
  id?: number;
  name: string;
  barcode: string;
  description: string;
  price: number;
  cost: number;
  categoryId: number;
  supplierId: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id?: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  total: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionItem {
  id?: number;
  transactionId: number;
  productId: number;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  createdAt: Date;
}

export interface StockItem {
  id?: number;
  productId: number;
  quantity: number;
  updatedAt: Date;
}

// Create context
interface DatabaseContextType {
  db: IDBPDatabase<MiniMarketDB> | null;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isLoading: true,
  error: null,
});

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<IDBPDatabase<MiniMarketDB> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<MiniMarketDB>('mini-market-pos', 1, {
          upgrade(db) {
            // Create stores if they don't exist
            if (!db.objectStoreNames.contains('products')) {
              const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
              productStore.createIndex('by-barcode', 'barcode', { unique: true });
              productStore.createIndex('by-category', 'categoryId');
            }

            if (!db.objectStoreNames.contains('categories')) {
              db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('suppliers')) {
              db.createObjectStore('suppliers', { keyPath: 'id', autoIncrement: true });
            }

            if (!db.objectStoreNames.contains('transactions')) {
              const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
              transactionStore.createIndex('by-date', 'createdAt');
            }

            if (!db.objectStoreNames.contains('transactionItems')) {
              const transactionItemsStore = db.createObjectStore('transactionItems', { keyPath: 'id', autoIncrement: true });
              transactionItemsStore.createIndex('by-transaction', 'transactionId');
            }

            if (!db.objectStoreNames.contains('stock')) {
              const stockStore = db.createObjectStore('stock', { keyPath: 'id', autoIncrement: true });
              stockStore.createIndex('by-product', 'productId', { unique: true });
            }
          },
        });

        setDb(database);
        seedInitialData(database);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error initializing database'));
      } finally {
        setIsLoading(false);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Seed initial data if empty
  const seedInitialData = async (database: IDBPDatabase<MiniMarketDB>) => {
    // Check if categories are empty
    const categoryCount = await database.count('categories');
    
    if (categoryCount === 0) {
      const defaultCategories: Omit<Category, 'id'>[] = [
        { name: 'Beverages', description: 'Drinks, juices, water', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Snacks', description: 'Chips, cookies, candy', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Dairy', description: 'Milk, cheese, yogurt', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Bakery', description: 'Bread, pastries', createdAt: new Date(), updatedAt: new Date() },
      ];
      
      const tx = database.transaction('categories', 'readwrite');
      for (const category of defaultCategories) {
        await tx.store.add(category);
      }
      await tx.done;
    }
    
    // Check if suppliers are empty
    const supplierCount = await database.count('suppliers');
    
    if (supplierCount === 0) {
      const defaultSuppliers: Omit<Supplier, 'id'>[] = [
        {
          name: 'ABC Foods',
          contactPerson: 'John Smith',
          phone: '555-123-4567',
          email: 'john@abcfoods.com',
          address: '123 Main St',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'XYZ Beverages',
          contactPerson: 'Jane Doe',
          phone: '555-987-6543',
          email: 'jane@xyzbev.com',
          address: '456 Market St',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const tx = database.transaction('suppliers', 'readwrite');
      for (const supplier of defaultSuppliers) {
        await tx.store.add(supplier);
      }
      await tx.done;
    }
    
    // Check if products are empty
    const productCount = await database.count('products');
    
    if (productCount === 0) {
      // Add some sample products once categories and suppliers exist
      const categories = await database.getAll('categories');
      const suppliers = await database.getAll('suppliers');
      
      if (categories.length > 0 && suppliers.length > 0) {
        const defaultProducts: Omit<Product, 'id'>[] = [
          {
            name: 'Mineral Water 500ml',
            barcode: '8901234567890',
            description: 'Refreshing mineral water',
            price: 1.99,
            cost: 0.75,
            categoryId: categories[0].id!,
            supplierId: suppliers[1].id!,
            imageUrl: 'https://images.pexels.com/photos/2995299/pexels-photo-2995299.jpeg?auto=compress&cs=tinysrgb&w=200',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Potato Chips 150g',
            barcode: '8901234567891',
            description: 'Crispy salted potato chips',
            price: 2.99,
            cost: 1.25,
            categoryId: categories[1].id!,
            supplierId: suppliers[0].id!,
            imageUrl: 'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg?auto=compress&cs=tinysrgb&w=200',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            name: 'Milk 1L',
            barcode: '8901234567892',
            description: 'Fresh whole milk',
            price: 3.49,
            cost: 2.10,
            categoryId: categories[2].id!,
            supplierId: suppliers[0].id!,
            imageUrl: 'https://images.pexels.com/photos/2480468/pexels-photo-2480468.jpeg?auto=compress&cs=tinysrgb&w=200',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        const tx = database.transaction('products', 'readwrite');
        for (const product of defaultProducts) {
          await tx.store.add(product);
        }
        await tx.done;
        
        // Add initial stock for these products
        const addedProducts = await database.getAll('products');
        const stockTx = database.transaction('stock', 'readwrite');
        
        for (const product of addedProducts) {
          await stockTx.store.add({
            productId: product.id!,
            quantity: 20,
            updatedAt: new Date()
          });
        }
        await stockTx.done;
      }
    }
  };

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Additional hooks for CRUD operations can be added here