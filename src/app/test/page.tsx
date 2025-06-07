// src/app/test/page.tsx
'use client';

import { useState } from "react";
import EditForm from "@/components/EditForm";
import { EditableTransaction } from "@/models/transaction";

export default function TestChat() {
  const [formData, setFormData] = useState<EditableTransaction>({
    amount: 123,
    originalAmount: 123,
    currency: 'USD',
    originalCurrency: 'USD',
    type: 'expense',
    category: 'Other',
    timestamp: new Date(),
    note: 'test note',
    tags: [],
    location: 'test location',
    emoji: '💰',
  });
  

  return (
    <div>
      <EditForm formData={formData} onFormChange={setFormData} />
    </div>
  );
}