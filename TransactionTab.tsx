
import React, { useState } from 'react';
import { Transaction, Card, RebateConfig, Status } from './types';
import { generateId, getTodayStr, formatHKD } from './utils';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cards: Card[];
  merchantTypes: string[];
  rebateConfigs: RebateConfig[];
}

const TransactionTab: React.FC<Props> = ({ transactions, setTransactions, cards, merchantTypes, rebateConfigs }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRedemption, setIsRedemption] = useState(false);
  const [isCashbackIn, setIsCashbackIn] = useState(false);

  const [date, setDate] = useState(getTodayStr());
  const [desc, setDesc] = useState('');
  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>('Pending');
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [rebateOverride, setRebateOverride] = useState<string>('');

  const calculateSuggestedRebate = (cid: string, merchants: string[]) => {
    const config = rebateConfigs.find(c => c.cardId === cid);
    if (!config) return 0;
    let maxRebate = config.basicRebate;
    merchants.forEach((m: string) => {
      if (config.merchantTypeRebates[m] !== undefined) maxRebate = Math.max(maxRebate, config.merchantTypeRebates[m]);
    });
    return maxRebate;
  };

  const handleSave = () => {
    if (!cardId || !amount || !desc) return alert("Required fields missing");
    const txData: Transaction = {
      id: editingId || generateId(),
      date, description: desc, cardId,
      amount: parseFloat(amount),
      status, merchantTypes: selectedMerchants,
      rebatePercent: (isRedemption || isCashbackIn) ? 0 : parseFloat(rebateOverride) || 0,
      isRedemption, isCashbackIn
    };
    if (editingId) setTransactions(transactions.map(t => t.id === editingId ? txData : t));
    else setTransactions([txData, ...transactions]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); setDate(getTodayStr()); setDesc(''); setCardId(''); setAmount(''); setStatus('Pending'); setSelectedMerchants([]); setRebateOverride(''); setIsRedemption(false); setIsCashbackIn(false);
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex justify-between items-center"><h2 className="text-xl font-light text-[#2d2d2d]">History</h2><button onClick={() => { resetForm(); setShowModal(true); }} className="bg-[#b4a088] text-white px-4 py-1.5 rounded-full text-xs font-normal">+ Add</button></div>
      <div className="bg-white rounded-2xl border border-[#e8e6e1] minimal-shadow overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfbf7] border-b text-[9px] uppercase tracking-wider text-[#717171]">
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Details</th>
                <th className="px-4 py-3 font-normal text-right">Amount</th>
                <th className="px-4 py-3 font-normal text-right">Rebate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6e1]">
              {transactions.map(tx => (
                <tr key={tx.id} onClick={() => {
                  setEditingId(tx.id); setDate(tx.date); setDesc(tx.description); setCardId(tx.cardId); setAmount(tx.amount.toString()); setStatus(tx.status); setSelectedMerchants(tx.merchantTypes); setRebateOverride(tx.rebatePercent.toString()); setIsRedemption(tx.isRedemption); setIsCashbackIn(!!tx.isCashbackIn); setShowModal(true);
                }} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-4 text-[10px] text-[#717171]">{tx.date.slice(5)}</td>
                  <td className="px-4 py-4"><div className="text-xs font-normal truncate max-w-[100px]">{tx.description}</div><div className="flex gap-2 mt-1"><span className="text-[8px] text-[#b4a088] uppercase tracking-tighter">{cards.find(c => c.id === tx.cardId)?.name}</span><span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${tx.status === 'Confirmed' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>{tx.status}</span></div></td>
                  <td className={`px-4 py-4 text-right text-xs ${tx.isRedemption ? 'text-red-400' : tx.isCashbackIn ? 'text-green-500' : ''}`}>{tx.isRedemption ? '-' : tx.isCashbackIn ? '+' : ''}${formatHKD(tx.amount)}</td>
                  <td className="px-4 py-4 text-right"><div className="text-[10px] text-[#b4a088] font-bold">{tx.rebatePercent > 0 ? `$${formatHKD(tx.amount * tx.rebatePercent / 100)}` : '-'}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#fcfbf7] w-full max-w-md flex flex-col h-[85vh] rounded-t-3xl border border-[#e8e6e1] animate-in slide-in-from-bottom">
            <div className="px-6 py-4 border-b border-[#e8e6e1] bg-white flex justify-between items-center"><h3 className="text-[11px] font-light uppercase tracking-wider">{editingId ? 'Edit Entry' : 'New Entry'}</h3><div className="flex gap-2"><label className="text-[8px] uppercase">Redeem <input type="checkbox" checked={isRedemption} onChange={e => (setIsRedemption(e.target.checked), e.target.checked && setIsCashbackIn(false))} /></label><label className="text-[8px] uppercase">Credit <input type="checkbox" checked={isCashbackIn} onChange={e => (setIsCashbackIn(e.target.checked), e.target.checked && setIsRedemption(false))} /></label></div></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-1 text-[11px]" /></div>
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Description</label><input value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-1 text-[11px]" /></div>
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Credit Card</label><select value={cardId} onChange={e => (setCardId(e.target.value), !isRedemption && !isCashbackIn && setRebateOverride(calculateSuggestedRebate(e.target.value, selectedMerchants).toString()))} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-1 text-[11px]">{cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Amount</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-1 text-[11px]" /></div>
              {!isRedemption && !isCashbackIn && (
                <>
                  <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Merchant Types</label><div className="flex flex-wrap gap-1">{merchantTypes.map(m => <button key={m} onClick={() => { const next = selectedMerchants.includes(m) ? selectedMerchants.filter(i => i !== m) : [...selectedMerchants, m]; setSelectedMerchants(next); setRebateOverride(calculateSuggestedRebate(cardId, next).toString()); }} className={`px-2 py-0.5 rounded-full text-[9px] border ${selectedMerchants.includes(m) ? 'bg-[#b4a088] text-white' : 'bg-white text-[#717171]'}`}>{m}</button>)}</div></div>
                  <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Rebate (%)</label><input type="number" step="0.01" value={rebateOverride} onChange={e => setRebateOverride(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-1 text-[11px]" /></div>
                </>
              )}
            </div>
            <div className="p-4 border-t bg-white flex gap-3"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-xs border rounded-xl">Cancel</button><button onClick={handleSave} className="flex-[2] px-4 py-2 text-xs bg-[#b4a088] text-white rounded-xl">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTab;
