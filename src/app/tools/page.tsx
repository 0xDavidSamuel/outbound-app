'use client';

import { useState } from 'react';
import PageReveal from '@/components/ui/PageReveal';

const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','SEK','NZD','MXN','SGD','HKD','NOK','KRW','TRY','INR','RUB','BRL','ZAR','THB','IDR','MYR','PHP','AED','SAR','COP','PEN','CLP','NGN','KES','GHS','EGP','MAD','TWD','VND','PKR','BDT','ILS','PLN'];

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' }, { code: 'pt', label: 'Portuguese' }, { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' }, { code: 'ko', label: 'Korean' }, { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' }, { code: 'ru', label: 'Russian' }, { code: 'hi', label: 'Hindi' },
  { code: 'tr', label: 'Turkish' }, { code: 'nl', label: 'Dutch' }, { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' }, { code: 'id', label: 'Indonesian' }, { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' }, { code: 'uk', label: 'Ukrainian' }, { code: 'he', label: 'Hebrew' },
  { code: 'ro', label: 'Romanian' }, { code: 'cs', label: 'Czech' }, { code: 'hu', label: 'Hungarian' },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'currency' | 'translate'>('currency');

  const [amount, setAmount]               = useState('1');
  const [fromCurrency, setFromCurrency]   = useState('USD');
  const [toCurrency, setToCurrency]       = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate]                   = useState<number | null>(null);
  const [converting, setConverting]       = useState(false);
  const [rateUpdated, setRateUpdated]     = useState('');

  const [inputText, setInputText]   = useState('');
  const [outputText, setOutputText] = useState('');
  const [fromLang, setFromLang]     = useState('en');
  const [toLang, setToLang]         = useState('es');
  const [translating, setTranslating] = useState(false);
  const [transError, setTransError] = useState('');

  const convert = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setConverting(true);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
      const data = await res.json();
      const r = data.rates[toCurrency];
      setRate(r);
      setConvertedAmount(parseFloat(amount) * r);
      setRateUpdated(new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    } catch { setConvertedAmount(null); }
    setConverting(false);
  };

  const swapCurrencies = () => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); setConvertedAmount(null); setRate(null); };

  const translate = async () => {
    if (!inputText.trim()) return;
    setTranslating(true); setTransError(''); setOutputText('');
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromLang}|${toLang}`);
      const data = await res.json();
      if (data.responseStatus === 200) setOutputText(data.responseData.translatedText);
      else setTransError('Translation failed. Try again.');
    } catch { setTransError('Translation service unavailable.'); }
    setTranslating(false);
  };

  const swapLanguages = () => { setFromLang(toLang); setToLang(fromLang); setInputText(outputText); setOutputText(''); };

  return (
    <PageReveal>
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .tools-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 680px; margin: 0 auto; }
        .tools-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .tools-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 28px; }
        .tools-title em { color: #e8553a; font-style: normal; }
        .tab-row { display: flex; gap: 6px; margin-bottom: 28px; }
        .tab-btn { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 10px 20px; border-radius: 10px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.2s; }
        .tab-btn:hover { color: #888; border-color: #333; }
        .tab-btn.active { background: #e8553a; color: #080808; border-color: #e8553a; font-weight: 500; }
        .tool-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 16px; padding: 28px; }
        .tool-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.3em; color: #333; text-transform: uppercase; margin-bottom: 10px; }
        .currency-row { display: flex; align-items: stretch; gap: 10px; margin-bottom: 16px; }
        .amount-input { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 18px; color: #fff; font-family: 'Bebas Neue', sans-serif; font-size: 32px; outline: none; width: 100%; transition: border-color 0.2s; }
        .amount-input:focus { border-color: #333; }
        .amount-input::placeholder { color: #222; }
        .currency-select { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 0 14px; color: #fff; font-family: 'DM Mono', monospace; font-size: 13px; outline: none; cursor: pointer; min-width: 90px; appearance: none; -webkit-appearance: none; }
        .swap-btn { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 0 14px; color: #e8553a; font-size: 18px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .swap-btn:hover { background: #161616; }
        .convert-btn { width: 100%; background: #e8553a; color: #080808; border: none; border-radius: 10px; padding: 14px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; font-weight: 500; transition: opacity 0.2s; margin-bottom: 20px; }
        .convert-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .result-box { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px 24px; display: flex; flex-direction: column; gap: 6px; }
        .result-amount { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: #e8553a; line-height: 1; }
        .result-currency { font-family: 'DM Mono', monospace; font-size: 11px; color: #444; letter-spacing: 0.2em; text-transform: uppercase; }
        .result-rate { font-family: 'DM Mono', monospace; font-size: 10px; color: #2a2a2a; margin-top: 4px; }
        .quick-amounts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
        .quick-btn { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 6px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.15s; }
        .quick-btn:hover { color: #e8553a; border-color: rgba(232,85,58,0.3); }
        .lang-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .lang-select { flex: 1; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 12px 14px; color: #fff; font-family: 'DM Mono', monospace; font-size: 12px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .text-area { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 16px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 300; line-height: 1.6; outline: none; resize: none; min-height: 120px; transition: border-color 0.2s; margin-bottom: 12px; }
        .text-area:focus { border-color: #333; }
        .text-area::placeholder { color: #2a2a2a; }
        .text-area.output { color: #aaa; cursor: default; background: #0d0d0d; }
        .translate-btn { width: 100%; background: #e8553a; color: #080808; border: none; border-radius: 10px; padding: 14px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; font-weight: 500; transition: opacity 0.2s; margin-bottom: 14px; }
        .translate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .copy-btn { background: none; border: 1px solid #1a1a1a; color: #444; border-radius: 6px; padding: 5px 12px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .copy-btn:hover { color: #e8553a; border-color: rgba(232,85,58,0.3); }
        .error-msg { font-family: 'DM Mono', monospace; font-size: 10px; color: #ff6b6b; letter-spacing: 0.1em; margin-top: 8px; }
        .other-tools { margin-top: 28px; }
        .other-tools-title { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; margin-bottom: 16px; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .tool-link { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 16px; text-decoration: none; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .tool-link:hover { border-color: #2a2a2a; }
        .tool-link-icon { font-size: 20px; }
        .tool-link-desc { font-size: 11px; color: #444; line-height: 1.5; font-weight: 300; }
        .tool-link-arrow { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; transition: color 0.2s; }
        .tool-link:hover .tool-link-arrow { color: #e8553a; }
        @media (max-width: 600px) { .tools-page { padding: 64px 16px 140px; } .currency-row { flex-wrap: wrap; } }
      `}</style>

      <div className="tools-page">
        <p className="tools-eyebrow">Travel Utilities</p>
        <h1 className="tools-title">Travel<br /><em>tools.</em></h1>

        <div className="tab-row">
          <button className={`tab-btn${activeTab === 'currency' ? ' active' : ''}`} onClick={() => setActiveTab('currency')}>💱 Currency</button>
          <button className={`tab-btn${activeTab === 'translate' ? ' active' : ''}`} onClick={() => setActiveTab('translate')}>🌐 Translate</button>
        </div>

        {activeTab === 'currency' && (
          <div className="tool-card">
            <div className="tool-label">Amount</div>
            <div className="currency-row">
              <input className="amount-input" type="number" placeholder="0" value={amount} onChange={e => { setAmount(e.target.value); setConvertedAmount(null); }} />
              <select className="currency-select" value={fromCurrency} onChange={e => { setFromCurrency(e.target.value); setConvertedAmount(null); }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
              <button className="swap-btn" onClick={swapCurrencies} style={{ width: 38, height: 38 }}>⇅</button>
              <div style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
            </div>
            <div className="tool-label">Convert to</div>
            <div className="currency-row" style={{ marginBottom: 20 }}>
              <select className="currency-select" value={toCurrency} onChange={e => { setToCurrency(e.target.value); setConvertedAmount(null); }} style={{ flex: 1, padding: '14px 14px', fontSize: 14 }}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="convert-btn" onClick={convert} disabled={converting || !amount}>
              {converting ? 'Getting rate...' : `Convert ${fromCurrency} → ${toCurrency}`}
            </button>
            {convertedAmount !== null && (
              <div className="result-box">
                <div className="result-amount">{convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="result-currency">{toCurrency}</div>
                <div className="result-rate">1 {fromCurrency} = {rate?.toFixed(4)} {toCurrency}{rateUpdated && ` · Updated ${rateUpdated}`}</div>
              </div>
            )}
            <div className="quick-amounts">
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#2a2a2a', letterSpacing: '0.2em', textTransform: 'uppercase', alignSelf: 'center' }}>Quick:</span>
              {[100, 500, 1000, 5000, 10000].map(n => (
                <button key={n} className="quick-btn" onClick={() => { setAmount(String(n)); setConvertedAmount(null); }}>{n.toLocaleString()}</button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'translate' && (
          <div className="tool-card">
            <div className="lang-row">
              <select className="lang-select" value={fromLang} onChange={e => setFromLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button className="swap-btn" onClick={swapLanguages} style={{ width: 44, height: 44, flexShrink: 0 }}>⇄</button>
              <select className="lang-select" value={toLang} onChange={e => setToLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="tool-label">Text</div>
            <textarea className="text-area" placeholder="Type something to translate..." value={inputText} onChange={e => { setInputText(e.target.value); setOutputText(''); }} />
            <button className="translate-btn" onClick={translate} disabled={translating || !inputText.trim()}>
              {translating ? 'Translating...' : `Translate to ${LANGUAGES.find(l => l.code === toLang)?.label} →`}
            </button>
            {outputText && (
              <>
                <div className="tool-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Translation</span>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(outputText)}>Copy</button>
                </div>
                <textarea className="text-area output" value={outputText} readOnly />
              </>
            )}
            {transError && <div className="error-msg">{transError}</div>}
            <div style={{ marginTop: 16, fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#1e1e1e', letterSpacing: '0.15em' }}>Powered by MyMemory · 5000 chars/day free</div>
          </div>
        )}

        <div className="other-tools">
          <div className="other-tools-title">More tools</div>
          <div className="tools-grid">
            {[
              { icon: '🛂', name: 'Visa Check',    desc: 'Entry requirements by passport', url: 'https://www.sherpa.com/' },
              { icon: '🌤', name: 'Weather',        desc: 'Forecasts for any city',          url: 'https://www.windy.com/' },
              { icon: '💊', name: 'Travel Health',  desc: 'Vaccines & health advisories',    url: 'https://wwwnc.cdc.gov/travel' },
              { icon: '🔌', name: 'Power Plugs',    desc: 'Adapter guide by country',        url: 'https://www.worldstandards.eu/electricity/plugs-and-sockets/' },
              { icon: '📶', name: 'SIM Cards',      desc: 'Best local SIMs abroad',          url: 'https://www.prepaid-data-sim-card.fandom.com/' },
              { icon: '⏰', name: 'Time Zones',     desc: 'World clock & meeting planner',   url: 'https://www.timeanddate.com/worldclock/' },
            ].map(t => (
              <a key={t.name} className="tool-link" href={t.url} target="_blank" rel="noopener noreferrer">
                <div className="tool-link-icon">{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{t.name}</div>
                <div className="tool-link-desc">{t.desc}</div>
                <div className="tool-link-arrow">Open →</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
    </PageReveal>
  );
}
