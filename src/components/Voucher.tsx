import React from "react";
import { CartItem } from "../hooks/useSales";
import { useSettings } from "../hooks/useSettings";
import { ItemsWithProducts } from "../pages/Transactions";

interface ReceiptProps {
  cart: ItemsWithProducts[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerName?: string;
}

export const Voucher: React.FC<ReceiptProps> = ({
  cart,
  subtotal,
  tax,
  discount,
  total,
  customerName,
}) => {
  const { businessSettings } = useSettings();

  return (
    <div className="p-8 max-w-md mx-auto bg-white">
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
            <span className="flex-1">{item.product.name}</span>
            <div className="flex space-x-4">
              <span className="w-10 text-right">{item.quantity}</span>
              <span className="w-14 text-right">{item.price.toFixed(2)}</span>
              <span className="w-16 text-right">{item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-1 text-sm">
          <span>Subtotal:</span>
          <span>
            {businessSettings.currencySymbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-1 text-sm">
          <span>Tax (10%):</span>
          <span>
            {businessSettings.currencySymbol}
            {tax.toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between mb-1 text-sm">
            <span>Discount:</span>
            <span>
              -{businessSettings.currencySymbol}
              {discount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between font-bold mt-2">
          <span>Total:</span>
          <span>
            {businessSettings.currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-6">
        <p>Thank you for shopping with us!</p>
        <p>Please come again</p>
      </div>
    </div>
  );
};

// "use client";
// import React from "react";
// import { put,del } from "@vercel/blob";

// const Page = () => {
//   const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];

//     if (!file) return;
//     const { url } = await put("articles/blob.png", file, {
//       access: "public",
//       //   token: process.env?.BLOB_READ_WRITE_TOKEN,
//       token: "vercel_blob_rw_L38xsthkTiDuuJ7x_HgBjPnEgtabZB3qiuPIDDpsLoPDyYo",
//     });
//     del("articles/blob.png")
//     console.log(url);
//   };
//   return (
//     <div>
//       storage Page
//       <input type="file" name="image" onChange={handleOnChange} id="" />
//     </div>
//   );
// };

// export default Page;
