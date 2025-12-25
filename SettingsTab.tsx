
import React, { useState } from 'react';
import { Card, RebateConfig } from './types';
import { generateId } from './utils';

interface Props {
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  merchantTypes: string[];
  setMerchantTypes: React.Dispatch<React.SetStateAction<string[]>>;
  rebateConfigs: RebateConfig[];
  setRebateConfigs: React.Dispatch<React.SetStateAction<RebateConfig[]>>;
}

const SettingsTab: React.FC<Props> = ({ 
  cards, setCards, merchantTypes, setMerchantTypes, rebateConfigs, setRebateConfigs 
}) => {
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showAddMerchantInput, setShowAddMerchantInput] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  
  const [newCardName, setNewCardName] = useState('');
  const [newCardBalance, setNewCardBalance] = useState('');
  const [newBasicRebate, setNewBasicRebate] = useState('0');
  const [newMerchantRebates, setNewMerchantRebates] = useState<Record<string, string>>({});
  const [newMerchantType, setNewMerchantType] = useState('');

  const openEditModal = (card: Card) => {
    setEditingCardId(card.id);
    const config = rebateConfigs.find(rc => rc.cardId === card.id);
    setNewCardName(card.name);
    setNewCardBalance(card.startingCashback.toString());
    setNewBasicRebate(config?.basicRebate.toString() || '0');
    
    const mRebates: Record<string, string> = {};
    if (config?.merchantTypeRebates) {
      Object.entries(config.merchantTypeRebates).forEach(([key, val]) => {
        mRebates[key] = val.toString();
      });
    }
    setNewMerchantRebates(mRebates);
    setShowAddCardModal(true);
  };

  const handleSaveCard = () => {
    if (!newCardName) return alert("Card Name is required");
    const cid = editingCardId || generateId();
    const rebateVal = parseFloat(newBasicRebate) || 0;
    const balanceVal = parseFloat(newCardBalance) || 0;
    const merchantRebatesObj: Record<string, number> = {};
    merchantTypes.forEach((m: string) => {
      if (newMerchantRebates[m]) merchantRebatesObj[m] = parseFloat(newMerchantRebates[m]);
    });

    const newCard: Card = { id: cid, name: newCardName, startingCashback: balanceVal };
    const newConfig: RebateConfig = { cardId: cid, basicRebate: rebateVal, merchantTypeRebates: merchantRebatesObj };

    if (editingCardId) {
      setCards(cards.map(c => c.id === cid ? newCard : c));
      setRebateConfigs(rebateConfigs.map(rc => rc.cardId === cid ? newConfig : rc));
    } else {
      setCards([...cards, newCard]);
      setRebateConfigs([...rebateConfigs, newConfig]);
    }
    setShowAddCardModal(false);
  };

  const updateRebate = (cardId: string, field: 'basic' | string, value: string) => {
    const val = parseFloat(value) || 0;
    setRebateConfigs((prev: RebateConfig[]) => prev.map((rc: RebateConfig) => {
      if (rc.cardId !== cardId) return rc;
      if (field === 'basic') return { ...rc, basicRebate: val };
      return { ...rc, merchantTypeRebates: { ...rc.merchantTypeRebates, [field]: val } };
    }));
  };

  return (
    <div className="space-y-10 font-['Inter',sans-serif]">
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light text-[#2d2d2d]">Cards</h2>
          <button onClick={() => { setEditingCardId(null); setNewCardName(''); setShowAddCardModal(true); }} className="text-[10px] uppercase tracking-widest text-[#b4a088] font-bold border border-[#b4a088] px-3 py-1 rounded-full">+ Add Card</button>
        </div>
        <div className="space-y-3">
          {cards.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-[#e8e6e1] rounded-2xl minimal-shadow">
              <span className="text-xs font-normal">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#717171]">${c.startingCashback.toFixed(0)} start</span>
                <button onClick={() => openEditModal(c)} className="text-[#b4a088]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button onClick={() => confirm("Remove card?") && (setCards(cards.filter(card => card.id !== c.id)), setRebateConfigs(rebateConfigs.filter(r => r.cardId !== c.id)))} className="text-red-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" /></svg></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-light text-[#2d2d2d]">Merchant Types</h2>
          {!showAddMerchantInput && <button onClick={() => setShowAddMerchantInput(true)} className="text-[10px] uppercase tracking-widest text-[#b4a088] font-bold border border-[#b4a088] px-3 py-1 rounded-full">+ Add Type</button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {merchantTypes.map(m => <div key={m} className="px-3 py-1.5 bg-white border border-[#e8e6e1] rounded-full text-[10px] text-[#717171] flex items-center gap-2">{m}<button onClick={() => confirm(`Remove ${m}?`) && setMerchantTypes(merchantTypes.filter(i => i !== m))}>×</button></div>)}
          {showAddMerchantInput && <div className="flex items-center px-3 py-1 border border-[#b4a088] rounded-full bg-white"><input autoFocus placeholder="Name..." value={newMerchantType} onChange={e => setNewMerchantType(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setMerchantTypes([...merchantTypes, newMerchantType]), setNewMerchantType(''), setShowAddMerchantInput(false))} className="w-16 text-[9px] outline-none" /><button onClick={() => (setMerchantTypes([...merchantTypes, newMerchantType]), setNewMerchantType(''), setShowAddMerchantInput(false))} className="text-[#b4a088] ml-1 font-bold text-[10px]">OK</button></div>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-light text-[#2d2d2d]">Rebate Matrix</h2>
        <div className="space-y-6">
          {cards.map(c => {
            const defaultConfig: RebateConfig = { 
              cardId: c.id, 
              basicRebate: 0, 
              merchantTypeRebates: {} 
            };
            const config = rebateConfigs.find(rc => rc.cardId === c.id) || defaultConfig;
            const isCollapsed = collapsedCards.has(c.id);
            return (
              <div key={c.id} className="bg-white border border-[#e8e6e1] rounded-2xl p-4 minimal-shadow space-y-3">
                <div className="flex justify-between items-center border-b border-[#fcfbf7] pb-2 cursor-pointer" onClick={() => { const next = new Set(collapsedCards); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); setCollapsedCards(next); }}>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#b4a088] font-bold">{c.name}</h4>
                  <svg className={`w-3 h-3 text-[#717171] transition-transform ${isCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
                {!isCollapsed && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-[10px] text-[#717171] uppercase tracking-widest">Basic Rebate %</span><input type="number" step="0.01" value={config.basicRebate} onChange={e => updateRebate(c.id, 'basic', e.target.value)} className="w-16 text-right border-b outline-none text-[9px]" /></div>
                    {merchantTypes.map(m => (
                      <div key={m} className="flex justify-between items-center pl-2">
                        <span className="text-[9px] text-[#717171]">{m}</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          placeholder={config.basicRebate.toString()} 
                          value={(config.merchantTypeRebates as Record<string, number>)[m] ?? ''} 
                          onChange={e => updateRebate(c.id, m, e.target.value)} 
                          className="w-16 text-right border-b text-[#b4a088] outline-none text-[9px]" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#fcfbf7] w-full max-w-md h-[90vh] flex flex-col rounded-t-3xl overflow-hidden border border-[#e8e6e1] animate-in slide-in-from-bottom">
            <div className="px-6 py-4 border-b border-[#e8e6e1] bg-white shrink-0"><h3 className="text-[11px] font-light uppercase tracking-wider">{editingCardId ? 'Edit Card' : 'New Card'}</h3></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Card Name</label><input value={newCardName} onChange={e => setNewCardName(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-0.5 outline-none text-[9px]" /></div>
              <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Starting Balance</label><input type="number" value={newCardBalance} onChange={e => setNewCardBalance(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-0.5 outline-none text-[9px]" /></div>
              <div className="pt-4 border-t border-[#e8e6e1] space-y-4">
                <h4 className="text-[9px] uppercase tracking-widest text-[#b4a088] font-bold">Rebate Matrix</h4>
                <div><label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Basic Rebate %</label><input type="number" step="0.01" value={newBasicRebate} onChange={e => setNewBasicRebate(e.target.value)} className="w-full bg-white border border-[#e8e6e1] rounded-lg px-2 py-0.5 outline-none text-[9px]" /></div>
                <div className="space-y-2">
                  <label className="block text-[9px] uppercase tracking-widest text-[#717171] mb-1">Merchant Specific (%)</label>
                  {merchantTypes.map(m => (
                    <div key={m} className="flex justify-between items-center bg-white p-2 border border-[#e8e6e1] rounded-lg">
                      <span className="text-[9px] text-[#717171]">{m}</span>
                      <input type="number" step="0.01" placeholder={newBasicRebate} value={newMerchantRebates[m] || ''} onChange={e => setNewMerchantRebates({...newMerchantRebates, [m]: e.target.value})} className="w-16 text-right text-[9px] bg-white outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#e8e6e1] bg-white flex gap-3"><button onClick={() => setShowAddCardModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-[#717171] text-xs">Cancel</button><button onClick={handleSaveCard} className="flex-[2] px-4 py-2.5 rounded-xl bg-[#b4a088] text-white text-xs">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
