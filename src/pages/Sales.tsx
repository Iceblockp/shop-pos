import React, { useState, useEffect, useRef } from "react";
import {
  useDatabase,
  Product,
  Transaction,
  TransactionItem,
} from "../context/DatabaseContext";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Printer,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";

interface CartItem extends Product {
  quantity: number;
  total: number;
}

const Sales: React.FC = () => {
  const { db, isLoading } = useDatabase();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">(
    "paid"
  );
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      if (!db) return;

      try {
        const productsData = await db.getAll("products");
        setProducts(productsData);
        setFilteredProducts(productsData);

        const categoriesData = await db.getAll("categories");
        setCategories(categoriesData.map((c) => ({ id: c.id!, name: c.name })));
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products.");
      }
    };

    if (db && !isLoading) {
      loadData();
    }
  }, [db, isLoading]);

  // Filter products based on search and category
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.barcode.includes(searchTerm)
        );
      }

      if (selectedCategory !== null) {
        filtered = filtered.filter((p) => p.categoryId === selectedCategory);
      }

      setFilteredProducts(filtered);
    }
  }, [searchTerm, selectedCategory, products]);

  // Calculate totals whenever cart changes
  useEffect(() => {
    const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const cartTax = cartSubtotal * 0.1; // 10% tax
    const cartTotal = cartSubtotal + cartTax - discount;

    setSubtotal(cartSubtotal);
    setTax(cartTax);
    setTotal(cartTotal);
  }, [cart, discount]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      // Check if product is already in cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product is already in cart
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];
        item.quantity += 1;
        item.total = item.price * item.quantity;
        return updatedCart;
      } else {
        // Add new product to cart
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            total: product.price,
          },
        ];
      }
    });
  };

  const updateQuantity = (id: number | undefined, newQuantity: number) => {
    if (newQuantity < 1 || !id) return;

    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: newQuantity,
            total: item.price * newQuantity,
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: number | undefined) => {
    if (!id) return;

    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName("");
    setPaymentMethod("cash");
    setPaymentStatus("paid");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty. Add items before checkout.");
      return;
    }

    if (!db) {
      toast.error("Database not available.");
      return;
    }

    try {
      // Create transaction
      const transaction: Omit<Transaction, "id"> = {
        total,
        tax,
        discount,
        paymentMethod,
        paymentStatus,
        customerName: customerName || undefined,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Start a transaction to ensure data consistency
      const tx = db.transaction(
        ["transactions", "transactionItems", "stock"],
        "readwrite"
      );

      // Add transaction
      const transactionId = await tx
        .objectStore("transactions")
        .add(transaction);

      // Add transaction items
      const itemsStore = tx.objectStore("transactionItems");
      const stockStore = tx.objectStore("stock");
      const stockIndex = stockStore.index("by-product");

      for (const item of cart) {
        // Add transaction item
        await itemsStore.add({
          transactionId,
          productId: item.id!,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          total: item.total,
          createdAt: new Date(),
        });

        // Update stock
        const stockItem = await stockIndex.get(item.id!);
        if (stockItem) {
          await stockStore.put({
            ...stockItem,
            quantity: stockItem.quantity - item.quantity,
            updatedAt: new Date(),
          });
        }
      }

      // Commit transaction
      await tx.done;

      toast.success("Sale completed successfully.");
      handlePrint();
      clearCart();
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to complete sale. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Product Selection */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory || ""}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow transition-shadow cursor-pointer flex flex-col"
                    onClick={() => addToCart(product)}
                  >
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-blue-600 font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Stock: {product.id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mb-2" />
                  <p>No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center ml-4">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="mx-2 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        className="ml-3 p-1 text-red-400 hover:text-red-600"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p>Your cart is empty</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax (10%):</span>
                <span className="text-sm font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    ${discount.toFixed(2)}
                  </span>
                  <button
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      const value = prompt("Enter discount amount:", "0");
                      if (value !== null) {
                        const amount = parseFloat(value);
                        if (!isNaN(amount) && amount >= 0) {
                          setDiscount(amount);
                        }
                      }
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-base font-medium">Total:</span>
                <span className="text-xl font-semibold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <div className="flex space-x-2">
                <div
                  className={`flex-1 p-2 border rounded-md text-center cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Cash</span>
                </div>
                <div
                  className={`flex-1 p-2 border rounded-md text-center cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Card</span>
                </div>
              </div>

              <button
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Complete Sale
              </button>

              <button
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:outline-none"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Template (hidden) */}
      <div className="hidden">
        <div ref={receiptRef} className="p-8 max-w-md mx-auto bg-white">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Mini Market POS</h2>
            <p className="text-gray-500">123 Market Street</p>
            <p className="text-gray-500">Tel: (123) 456-7890</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm">
              <span>Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            {customerName && (
              <div className="flex justify-between text-sm">
                <span>Customer:</span>
                <span>{customerName}</span>
              </div>
            )}
          </div>

          <div className="border-t border-b border-gray-200 py-2 mb-4">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Item</span>
              <div className="flex space-x-4">
                <span className="w-10 text-right">Qty</span>
                <span className="w-14 text-right">Price</span>
                <span className="w-16 text-right">Total</span>
              </div>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-1">
                <span className="flex-1">{item.name}</span>
                <div className="flex space-x-4">
                  <span className="w-10 text-right">{item.quantity}</span>
                  <span className="w-14 text-right">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="w-16 text-right">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-1 text-sm">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm mt-6">
            <p>Thank you for shopping with us!</p>
            <p>Please come again</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import ShoppingCart icon used in the empty cart message
import { ShoppingCart } from "lucide-react";

export default Sales;
