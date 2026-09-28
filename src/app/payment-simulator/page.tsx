'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';

function PaymentSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const referenceNumber = searchParams.get('ref') || 'UNKNOWN';
  const amount = searchParams.get('amount') || '0';

  const handleSimulatePayment = async () => {
    // In a real PayMongo flow, the gateway handles this.
    // For our simulation, we just redirect back to the student portal.
    router.push(`/?ref=${referenceNumber}&payment=success`);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Fake PayMongo Header */}
        <div className="bg-[#17C172] p-5 flex items-center justify-between text-white">
          <div className="font-black text-xl tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-[#17C172] rounded-full"></div>
            </div>
            paymongo<span className="text-white/60 text-sm ml-2 font-medium">Checkout Simulator</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-500 font-medium">St. Francis College</p>
            <h2 className="text-3xl font-black text-gray-900">₱{parseInt(amount).toLocaleString()}.00</h2>
            <p className="text-xs text-gray-400 font-mono">Ref: {referenceNumber}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSimulatePayment}
              className="w-full p-4 border-2 border-gray-200 rounded-lg flex items-center gap-3 hover:border-[#17C172] hover:bg-green-50 transition-colors text-left"
            >
              <Smartphone className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-bold text-gray-900">Pay with GCash / Maya</div>
                <div className="text-xs text-gray-500">Instant mobile wallet payment</div>
              </div>
            </button>

            <button
              onClick={handleSimulatePayment}
              className="w-full p-4 border-2 border-gray-200 rounded-lg flex items-center gap-3 hover:border-[#17C172] hover:bg-green-50 transition-colors text-left"
            >
              <CreditCard className="w-6 h-6 text-gray-700" />
              <div>
                <div className="font-bold text-gray-900">Credit / Debit Card</div>
                <div className="text-xs text-gray-500">Visa, Mastercard, JCB</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400 gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Secured by PayMongo Testing Environment
        </div>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );
}

export default function PaymentSimulator() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Simulator...</div>}>
      <PaymentSimulatorContent />
    </Suspense>
  );
}
