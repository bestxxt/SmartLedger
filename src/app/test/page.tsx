"use client";

import { BillCard } from "@/components/BillCard";
import { Transaction } from "@/types/transaction";


export default function Test() {
  const transaction: Transaction = {
    id: "1234567890",
    "amount": 320,
    "type": "expense",
    "category": "Apparel",
    "subcategory": "Shoes",
    "timestamp": new Date("2025-05-04T06:33:24.251Z"),
    "note": "Paid for new shoes at Nike in Shanghai",
    "currency": "JPY",
    "tags": [
      "Nike",
      "Shanghai"
    ],
    "location": "Shanghai",
    "emoji": "👟"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <BillCard transaction={transaction} />
    </div>
  );
}