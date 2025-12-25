
import React from 'react';
import { Card, Transaction, Promotion } from './types';
import { formatHKD } from './utils';

interface Props {
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  transactions: Transaction[];
  promotions: Promotion[];
}

const SummaryTab: React.FC<Props> = ({ cards, setCards, transactions, promotions }) => {
  const calculateCardCashback = (card: Card) => {
    const cardTxs = transactions.filter((tx: Transaction) => tx.cardId === card.id && tx.status === 'Confirmed');
    const earned = cardTxs.reduce((acc: number, tx: Transaction) => {
      if (tx.isRedemption || tx.isCashbackIn) return acc;
      return acc + (tx.amount * (tx.rebatePercent / 100));
    }, 0);
    const manualCredits = cardTxs.reduce((acc: number, tx: Transaction) => tx.isCashbackIn ? acc + tx.amount : acc, 0);
    const redeemed = cardTxs.reduce((acc: number, tx: Transaction) => tx.isRedemption ? acc + tx.amount : acc, 0);
    return card.manualOverride ?? (card.startingCashback + earned + manualCredits - redeemed);
  };

  const activePromos = promotions.filter(p => new Date(p.endDate) >= new Date());

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      <section className="space-y-4">
        <h2 className="text-xl font-light text-[#2d2d2d]">Wallet Balance</h2>
        <div className="bg-white rounded-2xl border border-[#e8e6e1] minimal-shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#fcfbf7] border-b border-[#e8e6e1]">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#717171] font-normal">Card Name</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#717171] font-normal text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6e1]">
              {cards.map(card => (
                <tr key={card.id}>
                  <td className="px-4 py-4 text-xs">{card.name}</td>
                  <td className="px-4 py-4 text-right">
                    <input 
                      type="number" step="0.01" 
                      value={calculateCardCashback(card).toFixed(2)}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setCards(prev => prev.map(c => c.id === card.id ? { ...c, manualOverride: isNaN(val) ? undefined : val } : c));
                      }}
                      className="w-24 bg-transparent text-right outline-none focus:text-[#b4a088] text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-[#717171] italic">* Only confirmed transactions contribute to the balance.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-light text-[#2d2d2d]">Promo Progress</h2>
        <div className="space-y-4">
          {activePromos.map(promo => {
            const relevantTxs = transactions.filter(tx => {
              const txDate = new Date(tx.date);
              return tx.status === 'Confirmed' && txDate >= new Date(promo.startDate) && txDate <= new Date(promo.endDate) &&
                     (promo.eligibleCardIds.length === 0 || promo.eligibleCardIds.includes(tx.cardId)) &&
                     (promo.targetMerchantTypes.includes('All') || tx.merchantTypes.some(mt => promo.targetMerchantTypes.includes(mt)));
            });
            const spending = relevantTxs.reduce((acc, tx) => acc + tx.amount, 0);
            const target = promo.targetAmount || 0;
            const progress = target > 0 ? Math.min(100, (spending / target) * 100) : 100;
            return (
              <div key={promo.id} className="p-4 bg-white rounded-2xl border border-[#e8e6e1] minimal-shadow space-y-3">
                <div className="flex justify-between items-start">
                  <div><h4 className="text-xs font-semibold text-[#2d2d2d]">{promo.title}</h4><p className="text-[9px] text-[#717171] mt-1">{promo.startDate.slice(5)} to {promo.endDate.slice(5)}</p></div>
                  <div className="text-[10px] text-[#b4a088] font-bold">+{promo.additionalRebate}% Rebate</div>
                </div>
                {target > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]"><span className="text-[#717171]">Spent: ${formatHKD(spending)}</span><span className="text-[#2d2d2d]">Goal: ${formatHKD(target)}</span></div>
                    <div className="h-1.5 bg-[#fcfbf7] rounded-full overflow-hidden border"><div className="h-full bg-[#b4a088]" style={{ width: `${progress}%` }}></div></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SummaryTab;
