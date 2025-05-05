import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  CreditCard,
  DollarSign,
  ShoppingCart,
  QrCode,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useSales, CartItem } from "../hooks/useSales";
import { ProductCard } from "../components/ProductCard";
import { CartItem as CartItemComponent } from "../components/CartItem";
import { Receipt } from "../components/Receipt";
import { ProductWithStock } from "../hooks/useInventory";
import { useSettings } from "../hooks/useSettings";
import { toast } from "react-toastify";
import { BarcodeScan } from "../components/BarcodeScan";

const Sales: React.FC = () => {
  const { products, categories, isLoading, processCheckout } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>(
    []
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { businessSettings } = useSettings();

  const receiptRef = useRef<HTMLDivElement>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
    const cartTax = (cartSubtotal * businessSettings.taxRate) / 100; // Use tax rate from settings
    const cartTotal = cartSubtotal + cartTax - discount;

    setSubtotal(cartSubtotal);
    setTax(cartTax);
    setTotal(cartTotal);
  }, [cart, discount, businessSettings.taxRate]); // Add taxRate to dependencies

  const addToCart = (product: ProductWithStock) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        const item = updatedCart[existingItemIndex];

        // Check if adding one more would exceed stock
        if (item.quantity + 1 > product.stockQuantity) {
          toast.error(
            `Cannot exceed available stock (${product.stockQuantity} items)`
          );
          return prevCart;
        }

        item.quantity += 1;
        item.total = item.price * item.quantity;
        return updatedCart;
      }

      // Check if product has stock available
      if (product.stockQuantity < 1) {
        toast.error("This product is out of stock");
        return prevCart;
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          stock: product.stockQuantity,
          total: product.price,
        },
      ];
    });
  };

  const updateQuantity = (id: number | undefined, newQuantity: number) => {
    if (newQuantity < 1 || !id) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    );
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
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const success = await processCheckout({
      cart,
      total,
      tax,
      discount,
      paymentMethod,
      paymentStatus: "paid",
      customerName,
    });

    if (success) {
      handlePrint();
      clearCart();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleBarcodeScan = (barcode: string) => {
    console.log("code are", barcode, products);
    const product = products.find((p) => p.barcode == barcode);
    if (product) {
      if (product.stockQuantity > 0) {
        addToCart(product);
        setIsScannerOpen(false);
      } else {
        toast.error("This product is out of stock");
      }
    } else {
      toast.error("Product not found");
    }
  };

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
            <button
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsScannerOpen(true)}
            >
              <QrCode className="h-5 w-5 mr-2" />
              Scan Barcode
            </button>
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
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={() => addToCart(product)}
                  />
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
                  <CartItemComponent
                    key={item.id}
                    item={{ ...item, stock: item.stock }}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
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
            {/* Cart Summary */}
            // Update the cart summary section
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">
                  {businessSettings.currencySymbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Tax ({businessSettings.taxRate.toFixed(0)}%):
                </span>
                <span className="text-sm font-medium">
                  {businessSettings.currencySymbol}
                  {tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {businessSettings.currencySymbol}
                    {discount.toFixed(2)}
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
                  {businessSettings.currencySymbol}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
            {/* Checkout Form */}
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

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Scan Barcode</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsScannerOpen(false)}
              >
                ×
              </button>
            </div>
            <BarcodeScan
              onScan={handleBarcodeScan}
              onError={(error) => {
                console.error("Barcode scanning error:", error);
                toast.error("Failed to scan barcode. Please try again.");
              }}
            />
          </div>
        </div>
      )}

      {/* Hidden Receipt Template */}
      <div className="hidden">
        <div ref={receiptRef}>
          <Receipt
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            discount={discount}
            total={total}
            customerName={customerName}
          />
        </div>
      </div>
    </div>
  );
};

export default Sales;
