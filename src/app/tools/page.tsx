'use client';

import { useState, useEffect } from 'react';
import PageReveal from '@/components/ui/PageReveal';

// ── Currency data ──────────────────────────────────────────────────────────
const CURRENCIES = [
  'USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','SEK','NZD','MXN','SGD','HKD','NOK','KRW',
  'TRY','INR','RUB','BRL','ZAR','THB','IDR','MYR','PHP','AED','SAR','COP','PEN','CLP','NGN',
  'KES','GHS','EGP','MAD','TWD','VND','PKR','BDT','ILS','PLN','CZK','HUF','RON','BGN','HRK',
  'DKK','ISK','UAH','GEL','ARS','BOB','PYG','UYU','DOP','GTQ','HNL','NIO','CRC','PAB','JMD',
  'TTD','BBD','BZD','LKR','MMK','KHR','LAK','MNT','NPR','OMR','QAR','BHD','KWD','JOD','LBP',
  'TND','DZD','LYD','SDG','ETB','TZS','UGX','RWF','MZN','ZMW','BWP','NAD','MUR','SCR','MVR',
  'BND','FJD','PGK','WST','TOP','SBD','VUV','XAF','XOF','XPF',
];

// ── Language data ──────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' }, { code: 'pt', label: 'Portuguese' }, { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' }, { code: 'ko', label: 'Korean' }, { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' }, { code: 'ru', label: 'Russian' }, { code: 'hi', label: 'Hindi' },
  { code: 'tr', label: 'Turkish' }, { code: 'nl', label: 'Dutch' }, { code: 'pl', label: 'Polish' },
  { code: 'sv', label: 'Swedish' }, { code: 'id', label: 'Indonesian' }, { code: 'th', label: 'Thai' },
  { code: 'vi', label: 'Vietnamese' }, { code: 'uk', label: 'Ukrainian' }, { code: 'he', label: 'Hebrew' },
  { code: 'ro', label: 'Romanian' }, { code: 'cs', label: 'Czech' }, { code: 'hu', label: 'Hungarian' },
  { code: 'ms', label: 'Malay' }, { code: 'da', label: 'Danish' }, { code: 'fi', label: 'Finnish' },
  { code: 'el', label: 'Greek' }, { code: 'bg', label: 'Bulgarian' }, { code: 'hr', label: 'Croatian' },
];

// ── Time zone cities ───────────────────────────────────────────────────────
const TZ_CITIES = [
  { city: 'New York', tz: 'America/New_York' }, { city: 'Los Angeles', tz: 'America/Los_Angeles' },
  { city: 'Chicago', tz: 'America/Chicago' }, { city: 'London', tz: 'Europe/London' },
  { city: 'Paris', tz: 'Europe/Paris' }, { city: 'Berlin', tz: 'Europe/Berlin' },
  { city: 'Amsterdam', tz: 'Europe/Amsterdam' }, { city: 'Rome', tz: 'Europe/Rome' },
  { city: 'Madrid', tz: 'Europe/Madrid' }, { city: 'Lisbon', tz: 'Europe/Lisbon' },
  { city: 'Istanbul', tz: 'Europe/Istanbul' }, { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' }, { city: 'Bangkok', tz: 'Asia/Bangkok' },
  { city: 'Singapore', tz: 'Asia/Singapore' }, { city: 'Hong Kong', tz: 'Asia/Hong_Kong' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' }, { city: 'Seoul', tz: 'Asia/Seoul' },
  { city: 'Sydney', tz: 'Australia/Sydney' }, { city: 'Auckland', tz: 'Pacific/Auckland' },
  { city: 'São Paulo', tz: 'America/Sao_Paulo' }, { city: 'Mexico City', tz: 'America/Mexico_City' },
  { city: 'Bogotá', tz: 'America/Bogota' }, { city: 'Lima', tz: 'America/Lima' },
  { city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' }, { city: 'Santiago', tz: 'America/Santiago' },
  { city: 'Cairo', tz: 'Africa/Cairo' }, { city: 'Nairobi', tz: 'Africa/Nairobi' },
  { city: 'Lagos', tz: 'Africa/Lagos' }, { city: 'Johannesburg', tz: 'Africa/Johannesburg' },
  { city: 'Bali', tz: 'Asia/Makassar' }, { city: 'Medellín', tz: 'America/Bogota' },
  { city: 'Taipei', tz: 'Asia/Taipei' }, { city: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur' },
  { city: 'Ho Chi Minh', tz: 'Asia/Ho_Chi_Minh' }, { city: 'Chiang Mai', tz: 'Asia/Bangkok' },
  { city: 'Toronto', tz: 'America/Toronto' }, { city: 'Vancouver', tz: 'America/Vancouver' },
  { city: 'Denver', tz: 'America/Denver' }, { city: 'Honolulu', tz: 'Pacific/Honolulu' },
];

// ── Plug type data ─────────────────────────────────────────────────────────
const PLUG_DATA: Record<string, { types: string[]; voltage: string; frequency: string }> = {
  'United States': { types: ['A','B'], voltage: '120V', frequency: '60Hz' },
  'Canada': { types: ['A','B'], voltage: '120V', frequency: '60Hz' },
  'Mexico': { types: ['A','B'], voltage: '127V', frequency: '60Hz' },
  'United Kingdom': { types: ['G'], voltage: '230V', frequency: '50Hz' },
  'Ireland': { types: ['G'], voltage: '230V', frequency: '50Hz' },
  'France': { types: ['C','E'], voltage: '230V', frequency: '50Hz' },
  'Germany': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Spain': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Italy': { types: ['C','F','L'], voltage: '230V', frequency: '50Hz' },
  'Portugal': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Netherlands': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Belgium': { types: ['C','E'], voltage: '230V', frequency: '50Hz' },
  'Switzerland': { types: ['C','J'], voltage: '230V', frequency: '50Hz' },
  'Austria': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Sweden': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Norway': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Denmark': { types: ['C','E','F','K'], voltage: '230V', frequency: '50Hz' },
  'Greece': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Turkey': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Croatia': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Czech Republic': { types: ['C','E'], voltage: '230V', frequency: '50Hz' },
  'Hungary': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Poland': { types: ['C','E'], voltage: '230V', frequency: '50Hz' },
  'Romania': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Japan': { types: ['A','B'], voltage: '100V', frequency: '50/60Hz' },
  'South Korea': { types: ['C','F'], voltage: '220V', frequency: '60Hz' },
  'China': { types: ['A','C','I'], voltage: '220V', frequency: '50Hz' },
  'Taiwan': { types: ['A','B'], voltage: '110V', frequency: '60Hz' },
  'Hong Kong': { types: ['G'], voltage: '220V', frequency: '50Hz' },
  'Singapore': { types: ['G'], voltage: '230V', frequency: '50Hz' },
  'Thailand': { types: ['A','B','C','O'], voltage: '220V', frequency: '50Hz' },
  'Vietnam': { types: ['A','B','C'], voltage: '220V', frequency: '50Hz' },
  'Cambodia': { types: ['A','C','G'], voltage: '230V', frequency: '50Hz' },
  'Indonesia': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Malaysia': { types: ['G'], voltage: '240V', frequency: '50Hz' },
  'Philippines': { types: ['A','B','C'], voltage: '220V', frequency: '60Hz' },
  'India': { types: ['C','D','M'], voltage: '230V', frequency: '50Hz' },
  'Nepal': { types: ['C','D','M'], voltage: '230V', frequency: '50Hz' },
  'Australia': { types: ['I'], voltage: '230V', frequency: '50Hz' },
  'New Zealand': { types: ['I'], voltage: '230V', frequency: '50Hz' },
  'Brazil': { types: ['C','N'], voltage: '127/220V', frequency: '60Hz' },
  'Argentina': { types: ['C','I'], voltage: '220V', frequency: '50Hz' },
  'Chile': { types: ['C','L'], voltage: '220V', frequency: '50Hz' },
  'Colombia': { types: ['A','B'], voltage: '110V', frequency: '60Hz' },
  'Peru': { types: ['A','B','C'], voltage: '220V', frequency: '60Hz' },
  'Ecuador': { types: ['A','B'], voltage: '120V', frequency: '60Hz' },
  'Costa Rica': { types: ['A','B'], voltage: '120V', frequency: '60Hz' },
  'Panama': { types: ['A','B'], voltage: '120V', frequency: '60Hz' },
  'UAE': { types: ['C','D','G'], voltage: '220V', frequency: '50Hz' },
  'Saudi Arabia': { types: ['A','B','G'], voltage: '220V', frequency: '60Hz' },
  'South Africa': { types: ['C','D','M','N'], voltage: '230V', frequency: '50Hz' },
  'Morocco': { types: ['C','E'], voltage: '220V', frequency: '50Hz' },
  'Egypt': { types: ['C','F'], voltage: '220V', frequency: '50Hz' },
  'Kenya': { types: ['G'], voltage: '240V', frequency: '50Hz' },
  'Nigeria': { types: ['D','G'], voltage: '240V', frequency: '50Hz' },
  'Ghana': { types: ['D','G'], voltage: '230V', frequency: '50Hz' },
  'Georgia': { types: ['C','F'], voltage: '220V', frequency: '50Hz' },
  'Iceland': { types: ['C','F'], voltage: '230V', frequency: '50Hz' },
  'Israel': { types: ['C','H','M'], voltage: '230V', frequency: '50Hz' },
};

const PLUG_DESCRIPTIONS: Record<string, string> = {
  'A': 'Two flat parallel pins (US style)',
  'B': 'Two flat parallel + round ground (US grounded)',
  'C': 'Two round pins (Euro style)',
  'D': 'Three large round pins (triangle)',
  'E': 'Two round pins + hole for ground (France)',
  'F': 'Two round pins + side ground clips (Schuko)',
  'G': 'Three rectangular pins (UK style)',
  'H': 'Three pins in V shape (Israel)',
  'I': 'Two angled flat + ground (Australia)',
  'J': 'Three round pins (Switzerland)',
  'K': 'Three round pins (Denmark)',
  'L': 'Three round pins in a line (Italy)',
  'M': 'Three large round pins (South Africa)',
  'N': 'Three round pins (Brazil)',
  'O': 'Three round pins (Thailand)',
};

// ── Tab types ──────────────────────────────────────────────────────────────
type Tab = 'currency' | 'translate' | 'timezone' | 'weather' | 'plugs';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'currency',  icon: '💱', label: 'Currency' },
  { key: 'translate', icon: '🌐', label: 'Translate' },
  { key: 'timezone',  icon: '⏰', label: 'Time Zones' },
  { key: 'weather',   icon: '🌤', label: 'Weather' },
  { key: 'plugs',     icon: '🔌', label: 'Plug Types' },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('currency');

  // ── Currency state ────────────────────────────────────────────────────
  const [amount, setAmount]               = useState('1');
  const [fromCurrency, setFromCurrency]   = useState('USD');
  const [toCurrency, setToCurrency]       = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rate, setRate]                   = useState<number | null>(null);
  const [converting, setConverting]       = useState(false);
  const [rateUpdated, setRateUpdated]     = useState('');

  // ── Translate state ───────────────────────────────────────────────────
  const [inputText, setInputText]   = useState('');
  const [outputText, setOutputText] = useState('');
  const [fromLang, setFromLang]     = useState('en');
  const [toLang, setToLang]         = useState('es');
  const [translating, setTranslating] = useState(false);
  const [transError, setTransError] = useState('');

  // ── Time zone state ───────────────────────────────────────────────────
  const [tz1, setTz1] = useState(0);
  const [tz2, setTz2] = useState(3);
  const [now, setNow] = useState(new Date());

  // ── Weather state ─────────────────────────────────────────────────────
  const [weatherCity, setWeatherCity] = useState('');
  const [weather, setWeather]         = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError]     = useState('');

  // ── Plug type state ───────────────────────────────────────────────────
  const [plugCountry, setPlugCountry] = useState('United States');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Currency functions ────────────────────────────────────────────────
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

  // ── Translate functions ───────────────────────────────────────────────
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

  // ── Time zone helpers ─────────────────────────────────────────────────
  const formatTz = (tz: string) => {
    return now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  const formatTzDate = (tz: string) => {
    return now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
  };
  const getOffset = (tz: string) => {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    const parts = fmt.formatToParts(now);
    return parts.find(p => p.type === 'timeZoneName')?.value || '';
  };

  // ── Weather function ──────────────────────────────────────────────────
  const fetchWeather = async () => {
    if (!weatherCity.trim()) return;
    setWeatherLoading(true); setWeatherError(''); setWeather(null);
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(weatherCity.trim())}?format=j1`);
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      const current = data.current_condition?.[0];
      const area = data.nearest_area?.[0];
      if (!current) throw new Error('No data');
      setWeather({
        temp_c: current.temp_C,
        temp_f: current.temp_F,
        feels_c: current.FeelsLikeC,
        feels_f: current.FeelsLikeF,
        humidity: current.humidity,
        wind_kph: current.windspeedKmph,
        wind_mph: current.windspeedMiles,
        desc: current.weatherDesc?.[0]?.value || '',
        uv: current.uvIndex,
        visibility: current.visibility,
        city: area?.areaName?.[0]?.value || weatherCity,
        country: area?.country?.[0]?.value || '',
        forecast: data.weather?.slice(0, 3) || [],
      });
    } catch { setWeatherError('Could not find weather for that location.'); }
    setWeatherLoading(false);
  };

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
        .tab-row { display: flex; gap: 6px; margin-bottom: 28px; flex-wrap: wrap; }
        .tab-btn { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 14px; border-radius: 10px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; background: transparent; transition: all 0.2s; display: flex; align-items: center; gap: 5px; }
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
        .action-btn-main { width: 100%; background: #e8553a; color: #080808; border: none; border-radius: 10px; padding: 14px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; cursor: pointer; font-weight: 500; transition: opacity 0.2s; margin-bottom: 20px; }
        .action-btn-main:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .copy-btn { background: none; border: 1px solid #1a1a1a; color: #444; border-radius: 6px; padding: 5px 12px; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
        .copy-btn:hover { color: #e8553a; border-color: rgba(232,85,58,0.3); }
        .error-msg { font-family: 'DM Mono', monospace; font-size: 10px; color: #ff6b6b; letter-spacing: 0.1em; margin-top: 8px; }
        .tz-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; margin-bottom: 20px; }
        .tz-card { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; text-align: center; }
        .tz-time { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #e8553a; line-height: 1; margin-bottom: 4px; }
        .tz-date { font-family: 'DM Mono', monospace; font-size: 10px; color: #444; letter-spacing: 0.1em; margin-bottom: 8px; }
        .tz-city { font-family: 'DM Mono', monospace; font-size: 11px; color: #888; letter-spacing: 0.05em; }
        .tz-offset { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; margin-top: 4px; }
        .tz-select { width: 100%; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 8px; padding: 10px 12px; color: #fff; font-family: 'DM Mono', monospace; font-size: 11px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; margin-bottom: 16px; }
        .tz-all { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-top: 20px; }
        .tz-mini { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; }
        .tz-mini-city { font-family: 'DM Mono', monospace; font-size: 9px; color: #555; }
        .tz-mini-time { font-family: 'DM Mono', monospace; font-size: 11px; color: #ccc; }
        .weather-input-row { display: flex; gap: 10px; margin-bottom: 16px; }
        .weather-input { flex: 1; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 18px; color: #fff; font-family: 'DM Mono', monospace; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .weather-input:focus { border-color: #333; }
        .weather-input::placeholder { color: #2a2a2a; }
        .weather-card { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
        .weather-temp { font-family: 'Bebas Neue', sans-serif; font-size: 64px; color: #e8553a; line-height: 1; }
        .weather-desc { font-family: 'DM Mono', monospace; font-size: 12px; color: #888; letter-spacing: 0.1em; margin-top: 4px; text-transform: capitalize; }
        .weather-loc { font-family: 'DM Mono', monospace; font-size: 10px; color: #444; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
        .weather-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .weather-stat { display: flex; flex-direction: column; gap: 2px; }
        .weather-stat-label { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; letter-spacing: 0.2em; text-transform: uppercase; }
        .weather-stat-value { font-family: 'DM Mono', monospace; font-size: 13px; color: #ccc; }
        .weather-forecast { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .forecast-day { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px; text-align: center; }
        .forecast-date { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; letter-spacing: 0.1em; margin-bottom: 6px; }
        .forecast-temp { font-family: 'DM Mono', monospace; font-size: 12px; color: #ccc; }
        .forecast-desc { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; margin-top: 4px; }
        .plug-select { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 18px; color: #fff; font-family: 'DM Mono', monospace; font-size: 13px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; margin-bottom: 20px; }
        .plug-result { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; }
        .plug-types { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
        .plug-type-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 16px 20px; flex: 1; min-width: 120px; }
        .plug-type-letter { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #e8553a; line-height: 1; margin-bottom: 6px; }
        .plug-type-desc { font-family: 'DM Mono', monospace; font-size: 9px; color: #555; line-height: 1.5; }
        .plug-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .plug-spec { display: flex; flex-direction: column; gap: 2px; }
        .plug-spec-label { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; letter-spacing: 0.2em; text-transform: uppercase; }
        .plug-spec-value { font-family: 'DM Mono', monospace; font-size: 14px; color: #ccc; }
        .plug-note { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; letter-spacing: 0.1em; margin-top: 16px; line-height: 1.6; }
        @media (max-width: 600px) {
          .tools-page { padding: 64px 16px 140px; }
          .currency-row { flex-wrap: wrap; }
          .tz-grid { grid-template-columns: 1fr; gap: 10px; }
          .tz-all { grid-template-columns: 1fr 1fr; }
          .weather-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="tools-page">
        <p className="tools-eyebrow">Travel Utilities</p>
        <h1 className="tools-title">Travel<br /><em>tools.</em></h1>

        <div className="tab-row">
          {TABS.map(t => (
            <button key={t.key} className={`tab-btn${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Currency ──────────────────────────────────────────────── */}
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
            <button className="action-btn-main" onClick={convert} disabled={converting || !amount}>
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

        {/* ── Translate ─────────────────────────────────────────────── */}
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
            <button className="action-btn-main" onClick={translate} disabled={translating || !inputText.trim()}>
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

        {/* ── Time Zones ────────────────────────────────────────────── */}
        {activeTab === 'timezone' && (
          <div className="tool-card">
            <div className="tool-label">Compare two cities</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <select className="tz-select" value={tz1} onChange={e => setTz1(Number(e.target.value))}>
                {TZ_CITIES.map((c, i) => <option key={i} value={i}>{c.city}</option>)}
              </select>
              <select className="tz-select" value={tz2} onChange={e => setTz2(Number(e.target.value))}>
                {TZ_CITIES.map((c, i) => <option key={i} value={i}>{c.city}</option>)}
              </select>
            </div>
            <div className="tz-grid">
              <div className="tz-card">
                <div className="tz-time">{formatTz(TZ_CITIES[tz1].tz)}</div>
                <div className="tz-date">{formatTzDate(TZ_CITIES[tz1].tz)}</div>
                <div className="tz-city">{TZ_CITIES[tz1].city}</div>
                <div className="tz-offset">{getOffset(TZ_CITIES[tz1].tz)}</div>
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, color: '#333', textAlign: 'center' }}>⇄</div>
              <div className="tz-card">
                <div className="tz-time">{formatTz(TZ_CITIES[tz2].tz)}</div>
                <div className="tz-date">{formatTzDate(TZ_CITIES[tz2].tz)}</div>
                <div className="tz-city">{TZ_CITIES[tz2].city}</div>
                <div className="tz-offset">{getOffset(TZ_CITIES[tz2].tz)}</div>
              </div>
            </div>
            <div className="tool-label" style={{ marginTop: 24 }}>All cities</div>
            <div className="tz-all">
              {TZ_CITIES.map((c, i) => (
                <div key={i} className="tz-mini">
                  <span className="tz-mini-city">{c.city}</span>
                  <span className="tz-mini-time">{formatTz(c.tz).replace(':00 ', ' ').replace(' ', '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Weather ───────────────────────────────────────────────── */}
        {activeTab === 'weather' && (
          <div className="tool-card">
            <div className="tool-label">City or location</div>
            <div className="weather-input-row">
              <input className="weather-input" placeholder="e.g. Tokyo, Medellín, Bali..." value={weatherCity} onChange={e => setWeatherCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchWeather()} />
              <button className="action-btn-main" style={{ width: 'auto', marginBottom: 0, padding: '14px 24px' }} onClick={fetchWeather} disabled={weatherLoading || !weatherCity.trim()}>
                {weatherLoading ? '...' : '→'}
              </button>
            </div>
            {weatherError && <div className="error-msg">{weatherError}</div>}
            {weather && (
              <>
                <div className="weather-card">
                  <div className="weather-loc">📍 {weather.city}{weather.country ? `, ${weather.country}` : ''}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                    <div className="weather-temp">{weather.temp_c}°</div>
                    <div>
                      <div className="weather-desc">{weather.desc}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#333', marginTop: 2 }}>Feels like {weather.feels_c}°C / {weather.feels_f}°F</div>
                    </div>
                  </div>
                  <div className="weather-stats">
                    <div className="weather-stat"><span className="weather-stat-label">Humidity</span><span className="weather-stat-value">{weather.humidity}%</span></div>
                    <div className="weather-stat"><span className="weather-stat-label">Wind</span><span className="weather-stat-value">{weather.wind_kph} km/h</span></div>
                    <div className="weather-stat"><span className="weather-stat-label">UV Index</span><span className="weather-stat-value">{weather.uv}</span></div>
                    <div className="weather-stat"><span className="weather-stat-label">Visibility</span><span className="weather-stat-value">{weather.visibility} km</span></div>
                  </div>
                </div>
                {weather.forecast.length > 0 && (
                  <>
                    <div className="tool-label">3-Day Forecast</div>
                    <div className="weather-forecast">
                      {weather.forecast.map((day: any, i: number) => (
                        <div key={i} className="forecast-day">
                          <div className="forecast-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="forecast-temp">{day.mintempC}° — {day.maxtempC}°C</div>
                          <div className="forecast-desc">{day.hourly?.[4]?.weatherDesc?.[0]?.value || ''}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            {!weather && !weatherError && !weatherLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#1e1e1e', letterSpacing: '0.2em' }}>
                enter a city to check the weather
              </div>
            )}
          </div>
        )}

        {/* ── Plug Types ────────────────────────────────────────────── */}
        {activeTab === 'plugs' && (
          <div className="tool-card">
            <div className="tool-label">Select country</div>
            <select className="plug-select" value={plugCountry} onChange={e => setPlugCountry(e.target.value)}>
              {Object.keys(PLUG_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {PLUG_DATA[plugCountry] && (
              <div className="plug-result">
                <div className="plug-types">
                  {PLUG_DATA[plugCountry].types.map(t => (
                    <div key={t} className="plug-type-card">
                      <div className="plug-type-letter">Type {t}</div>
                      <div className="plug-type-desc">{PLUG_DESCRIPTIONS[t] || ''}</div>
                    </div>
                  ))}
                </div>
                <div className="plug-specs">
                  <div className="plug-spec">
                    <span className="plug-spec-label">Voltage</span>
                    <span className="plug-spec-value">{PLUG_DATA[plugCountry].voltage}</span>
                  </div>
                  <div className="plug-spec">
                    <span className="plug-spec-label">Frequency</span>
                    <span className="plug-spec-value">{PLUG_DATA[plugCountry].frequency}</span>
                  </div>
                </div>
                <div className="plug-note">
                  {plugCountry === 'United States' || PLUG_DATA[plugCountry].types.includes('A') || PLUG_DATA[plugCountry].types.includes('B')
                    ? 'US travelers: Your devices will work here without an adapter.'
                    : 'US travelers: You will need a travel adapter. Most modern chargers (phones, laptops) handle voltage differences automatically — check the label on your charger for "100-240V" to confirm.'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
    </PageReveal>
  );
}
