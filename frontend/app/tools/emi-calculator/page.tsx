'use client';
import { useState } from 'react';
import { Calculator, IndianRupee } from 'lucide-react';

function calcEMI(principal: number, rate: number, months: number): number {
  if (rate === 0) return principal / months;
  const r = rate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(5);

  const months = tenure * 12;
  const emi = calcEMI(loanAmount, rate, months);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Calculator size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">EMI Calculator</h1>
            <p className="text-slate-500 text-sm">Plan your car loan repayments</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Amount</label>
              <span className="text-sm font-bold text-blue-600">₹{fmt(loanAmount)}</span>
            </div>
            <input
              type="range" min={100000} max={10000000} step={50000}
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>₹1L</span><span>₹1 Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Interest Rate (p.a.)</label>
              <span className="text-sm font-bold text-blue-600">{rate}%</span>
            </div>
            <input
              type="range" min={6} max={18} step={0.5}
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>6%</span><span>18%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Tenure</label>
              <span className="text-sm font-bold text-blue-600">{tenure} years</span>
            </div>
            <input
              type="range" min={1} max={7} step={1}
              value={tenure}
              onChange={e => setTenure(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 yr</span><span>7 yrs</span>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="mt-5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
          <p className="text-sm text-blue-200 mb-1">Monthly EMI</p>
          <p className="text-4xl font-black mb-6">₹{fmt(emi)}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-xs text-blue-200">Principal</p>
              <p className="font-bold">₹{fmt(loanAmount)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-xs text-blue-200">Total Interest</p>
              <p className="font-bold">₹{fmt(totalInterest)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 col-span-2">
              <p className="text-xs text-blue-200">Total Payment ({tenure} yrs)</p>
              <p className="font-bold">₹{fmt(totalPayment)}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Indicative values only. Actual EMI may vary based on lender terms.
        </p>
      </div>
    </div>
  );
}
