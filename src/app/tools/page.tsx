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

// ── Visa data ──────────────────────────────────────────────────────────────
// Format: 'VF:days' = visa free, 'VOA:days' = visa on arrival, 'EV' = e-visa, 'VR' = visa required
type VisaReq = string;
const VISA_PASSPORTS = [
  'United States','United Kingdom','Canada','Australia','Germany','France','Netherlands',
  'Spain','Italy','Japan','South Korea','Brazil','Mexico','India','Colombia','Argentina',
  'South Africa','Nigeria','Philippines','Thailand','Singapore','New Zealand','Ireland',
  'Sweden','Portugal','Poland','Turkey','Israel','Chile','Indonesia',
];

const VISA_DESTINATIONS = [
  'Thailand','Indonesia','Vietnam','Cambodia','Philippines','Malaysia','Singapore','Japan',
  'South Korea','Taiwan','India','Nepal','Sri Lanka','China','Mongolia',
  'Mexico','Colombia','Costa Rica','Panama','Ecuador','Peru','Brazil','Argentina','Chile','Bolivia',
  'Portugal','Spain','France','Germany','Netherlands','Italy','Greece','Croatia','Czech Republic',
  'Hungary','Poland','Romania','Turkey','Georgia','Sweden','Norway','Denmark','Switzerland','Ireland','United Kingdom',
  'Morocco','Egypt','South Africa','Kenya','Tanzania','Ghana','Nigeria','Ethiopia',
  'UAE','Saudi Arabia','Jordan','Israel','Oman',
  'Australia','New Zealand','Fiji',
  'United States','Canada',
];

const VISA_DB: Record<string, Record<string, VisaReq>> = {
  'United States': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:90',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'EV','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'EV','Fiji':'VF:120',
    'Canada':'VF:180',
  },
  'United Kingdom': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:180','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Canada': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'EV','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'VF:180',
  },
  'Germany': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VF:90',
    'Portugal':'VF:∞','Spain':'VF:∞','France':'VF:∞','Netherlands':'VF:∞','Italy':'VF:∞','Greece':'VF:∞','Croatia':'VF:∞','Czech Republic':'VF:∞',
    'Hungary':'VF:∞','Poland':'VF:∞','Romania':'VF:∞','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:∞','Norway':'VF:∞','Denmark':'VF:∞','Switzerland':'VF:∞','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:90','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'France': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VF:90',
    'Portugal':'VF:∞','Spain':'VF:∞','Germany':'VF:∞','Netherlands':'VF:∞','Italy':'VF:∞','Greece':'VF:∞','Croatia':'VF:∞','Czech Republic':'VF:∞',
    'Hungary':'VF:∞','Poland':'VF:∞','Romania':'VF:∞','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:∞','Norway':'VF:∞','Denmark':'VF:∞','Switzerland':'VF:∞','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:90','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Australia': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'EV','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Japan': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'VF:15','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90',
    'South Korea':'VF:90','Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Brazil': {
    'Thailand':'VF:90','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:30','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'EV','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:90',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VF:90',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'VF:90','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:90','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Colombia': {
    'Thailand':'VR','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:30','Japan':'VR',
    'South Korea':'VR','Taiwan':'EV','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VR',
    'Mexico':'VF:180','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VF:90',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'VF:90','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VR',
    'Morocco':'VR','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VR','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'EV','Fiji':'VF:120','United States':'VR','Canada':'EV',
  },
  'India': {
    'Thailand':'VOA:15','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'EV','Singapore':'VR','Japan':'VR',
    'South Korea':'VR','Taiwan':'EV','Nepal':'VF:∞','Sri Lanka':'EV','China':'VR','Mongolia':'VR',
    'Mexico':'VR','Colombia':'VR','Costa Rica':'VR','Panama':'VR','Ecuador':'VR','Peru':'VR','Brazil':'VR','Argentina':'VR','Chile':'VR','Bolivia':'VR',
    'Portugal':'VR','Spain':'VR','France':'VR','Germany':'VR','Netherlands':'VR','Italy':'VR','Greece':'VR','Croatia':'VR','Czech Republic':'VR',
    'Hungary':'VR','Poland':'VR','Romania':'VR','Turkey':'EV','Georgia':'EV','Sweden':'VR','Norway':'VR','Denmark':'VR','Switzerland':'VR','Ireland':'VR','United Kingdom':'VR',
    'Morocco':'VOA:90','Egypt':'VOA:30','South Africa':'VR','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VR','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VR','Oman':'EV',
    'Australia':'EV','New Zealand':'VR','Fiji':'VF:120','United States':'VR','Canada':'VR',
  },
  'Nigeria': {
    'Thailand':'VOA:15','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VR','Singapore':'VR','Japan':'VR',
    'South Korea':'VR','Taiwan':'VR','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VR',
    'Mexico':'VR','Colombia':'VR','Costa Rica':'VR','Panama':'VR','Ecuador':'VR','Peru':'VR','Brazil':'VR','Argentina':'VR','Chile':'VR','Bolivia':'VR',
    'Portugal':'VR','Spain':'VR','France':'VR','Germany':'VR','Netherlands':'VR','Italy':'VR','Greece':'VR','Croatia':'VR','Czech Republic':'VR',
    'Hungary':'VR','Poland':'VR','Romania':'VR','Turkey':'EV','Georgia':'EV','Sweden':'VR','Norway':'VR','Denmark':'VR','Switzerland':'VR','Ireland':'VR','United Kingdom':'VR',
    'Morocco':'VR','Egypt':'VOA:30','South Africa':'VR','Kenya':'EV','Tanzania':'EV','Ghana':'VF:90','Ethiopia':'EV',
    'UAE':'VR','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VR','Oman':'EV',
    'Australia':'VR','New Zealand':'VR','Fiji':'VF:120','United States':'VR','Canada':'VR',
  },
  'Mexico': {
    'Thailand':'VR','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:30','Japan':'VR',
    'South Korea':'VR','Taiwan':'EV','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VR',
    'Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VR','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'VR','Canada':'EV',
  },
  'South Korea': {
    'Thailand':'VF:90','Indonesia':'VF:30','Vietnam':'VF:15','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:90','Japan':'VF:90',
    'Taiwan':'VF:90','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:30',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Argentina':'VF:90','Chile':'VF:90','Bolivia':'VR',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'EV','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:30','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:30','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'EV','Canada':'EV',
  },
  'Argentina': {
    'Thailand':'VR','Indonesia':'VF:30','Vietnam':'EV','Cambodia':'VOA:30','Philippines':'VF:30','Malaysia':'VF:90','Singapore':'VF:30','Japan':'VF:90',
    'South Korea':'VF:90','Taiwan':'EV','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VF:90',
    'Mexico':'VF:180','Colombia':'VF:90','Costa Rica':'VF:90','Panama':'VF:180','Ecuador':'VF:90','Peru':'VF:183','Brazil':'VF:90','Chile':'VF:90','Bolivia':'VF:90',
    'Portugal':'VF:90','Spain':'VF:90','France':'VF:90','Germany':'VF:90','Netherlands':'VF:90','Italy':'VF:90','Greece':'VF:90','Croatia':'VF:90','Czech Republic':'VF:90',
    'Hungary':'VF:90','Poland':'VF:90','Romania':'VF:90','Turkey':'VF:90','Georgia':'VF:365','Sweden':'VF:90','Norway':'VF:90','Denmark':'VF:90','Switzerland':'VF:90','Ireland':'VF:90','United Kingdom':'VF:180',
    'Morocco':'VF:90','Egypt':'VOA:30','South Africa':'VF:90','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VF:90','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VF:90','Oman':'EV',
    'Australia':'EV','New Zealand':'VF:90','Fiji':'VF:120','United States':'VR','Canada':'EV',
  },
  'Philippines': {
    'Thailand':'VF:30','Indonesia':'VF:30','Vietnam':'VF:21','Cambodia':'VOA:30','Malaysia':'VF:30','Singapore':'VF:30','Japan':'VR',
    'South Korea':'VR','Taiwan':'EV','India':'EV','Nepal':'VOA:30','Sri Lanka':'EV','China':'VR','Mongolia':'VR',
    'Mexico':'VR','Colombia':'VR','Costa Rica':'VR','Panama':'VR','Ecuador':'VR','Peru':'VR','Brazil':'VF:90','Argentina':'VR','Chile':'VR','Bolivia':'VR',
    'Portugal':'VR','Spain':'VR','France':'VR','Germany':'VR','Netherlands':'VR','Italy':'VR','Greece':'VR','Croatia':'VR','Czech Republic':'VR',
    'Hungary':'VR','Poland':'VR','Romania':'VR','Turkey':'EV','Georgia':'EV','Sweden':'VR','Norway':'VR','Denmark':'VR','Switzerland':'VR','Ireland':'VR','United Kingdom':'VR',
    'Morocco':'VR','Egypt':'VOA:30','South Africa':'VR','Kenya':'EV','Tanzania':'EV','Ghana':'VR','Nigeria':'VR','Ethiopia':'EV',
    'UAE':'VR','Saudi Arabia':'EV','Jordan':'VOA:30','Israel':'VR','Oman':'EV',
    'Australia':'VR','New Zealand':'VR','Fiji':'VF:120','United States':'VR','Canada':'VR',
  },
};

// Copy EU data for similar passports
['Netherlands','Spain','Italy','Sweden','Portugal','Poland','Ireland'].forEach(p => {
  if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Germany'] };
});
['New Zealand'].forEach(p => { if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Australia'] }; });
['Singapore'].forEach(p => { if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Japan'] }; });
['Chile'].forEach(p => { if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Argentina'] }; });
['Turkey'].forEach(p => {
  if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Mexico'] };
});
['South Africa'].forEach(p => { if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Colombia'] }; });
['Thailand','Indonesia'].forEach(p => { if (!VISA_DB[p]) VISA_DB[p] = { ...VISA_DB['Philippines'] }; });

function parseVisa(v: string): { type: string; days: string; color: string; label: string } {
  if (v.startsWith('VF:')) {
    const d = v.slice(3);
    return { type: 'visa_free', days: d === '∞' ? 'Unlimited' : `${d} days`, color: '#47ff8c', label: 'Visa Free' };
  }
  if (v.startsWith('VOA:')) return { type: 'voa', days: `${v.slice(4)} days`, color: '#47d4ff', label: 'Visa on Arrival' };
  if (v === 'EV') return { type: 'evisa', days: '', color: '#ffb74d', label: 'e-Visa' };
  return { type: 'required', days: '', color: '#ff6b6b', label: 'Visa Required' };
}

// ── SIM card data ──────────────────────────────────────────────────────────
interface SimInfo {
  carriers: { name: string; type: string; data: string; price: string; note?: string }[];
  esim: boolean;
  tip: string;
  buyAt: string;
}

const SIM_DATA: Record<string, SimInfo> = {
  'Thailand': {
    carriers: [
      { name: 'AIS', type: 'Tourist SIM', data: '30GB / 15 days', price: '~$9', note: 'Best coverage nationwide' },
      { name: 'TrueMove H', type: 'Tourist SIM', data: '30GB / 15 days', price: '~$9', note: 'Good in cities, weaker rural' },
      { name: 'DTAC', type: 'Happy Tourist', data: '15GB / 8 days', price: '~$6', note: 'Budget option' },
    ],
    esim: true, tip: 'Buy at airport 7-Eleven or carrier booth on arrival. Passport required.', buyAt: 'Airport, 7-Eleven, carrier stores',
  },
  'Indonesia': {
    carriers: [
      { name: 'Telkomsel', type: 'Tourist SIM', data: '25GB / 30 days', price: '~$7', note: 'Best coverage including islands' },
      { name: 'XL Axiata', type: 'Prepaid', data: '20GB / 30 days', price: '~$5', note: 'Good in Java & Bali' },
      { name: 'Indosat', type: 'Prepaid', data: '20GB / 30 days', price: '~$5', note: 'Decent urban coverage' },
    ],
    esim: true, tip: 'Must register SIM with passport at point of sale. Telkomsel is king for Bali.', buyAt: 'Airport counters, Indomaret/Alfamart',
  },
  'Vietnam': {
    carriers: [
      { name: 'Viettel', type: 'Tourist SIM', data: '30GB / 30 days', price: '~$5', note: 'Best nationwide coverage' },
      { name: 'Mobifone', type: 'Tourist SIM', data: '30GB / 30 days', price: '~$5', note: 'Good in cities' },
      { name: 'Vinaphone', type: 'Prepaid', data: '20GB / 30 days', price: '~$4', note: 'Budget pick' },
    ],
    esim: true, tip: 'Extremely cheap data. Buy at airport or any phone shop. Passport required.', buyAt: 'Airport booths, phone shops everywhere',
  },
  'Japan': {
    carriers: [
      { name: 'IIJmio', type: 'Travel SIM', data: '20GB / 15 days', price: '~$25', note: 'Data only, no calls' },
      { name: 'Mobal', type: 'Japan SIM', data: '10GB / 30 days', price: '~$30', note: 'Includes JP phone number' },
      { name: 'Ubigi (eSIM)', type: 'eSIM', data: '10GB / 30 days', price: '~$16', note: 'No physical SIM needed' },
    ],
    esim: true, tip: 'Japan SIMs are pricier. eSIM or pocket WiFi often better value. Buy at airport.', buyAt: 'Airport vending machines, BIC Camera, online pre-order',
  },
  'South Korea': {
    carriers: [
      { name: 'KT', type: 'Prepaid SIM', data: 'Unlimited / 5 days', price: '~$18', note: 'Major carrier, best LTE' },
      { name: 'SK Telecom', type: 'Tourist SIM', data: 'Unlimited / 5 days', price: '~$20', note: 'Premium network' },
      { name: 'LG U+', type: 'Prepaid', data: '5GB/day / 10 days', price: '~$22', note: 'Good 5G coverage' },
    ],
    esim: true, tip: 'Unlimited data SIMs available at Incheon Airport. Reserve online for pickup.', buyAt: 'Incheon/Gimpo Airport, online pre-order',
  },
  'Colombia': {
    carriers: [
      { name: 'Claro', type: 'Prepaid', data: '12GB / 30 days', price: '~$8', note: 'Best national coverage' },
      { name: 'Movistar', type: 'Prepaid', data: '10GB / 15 days', price: '~$6', note: 'Good in cities' },
      { name: 'Tigo', type: 'Prepaid', data: '10GB / 15 days', price: '~$6', note: 'Strong in Medellín' },
    ],
    esim: false, tip: 'Buy at any Éxito supermarket or carrier store. Passport copy needed.', buyAt: 'Carrier stores, Éxito supermarkets, airport',
  },
  'Mexico': {
    carriers: [
      { name: 'Telcel', type: 'Amigo SIM', data: '10GB / 30 days', price: '~$10', note: 'Dominant carrier, best coverage' },
      { name: 'AT&T Mexico', type: 'Prepaid', data: '8GB / 30 days', price: '~$8', note: 'Good in cities, US roaming deals' },
      { name: 'Movistar', type: 'Prepaid', data: '6GB / 30 days', price: '~$6', note: 'Budget option' },
    ],
    esim: true, tip: 'Telcel dominates outside cities. OXXO convenience stores sell top-ups.', buyAt: 'OXXO, carrier stores, Walmart, airport',
  },
  'Portugal': {
    carriers: [
      { name: 'Vodafone', type: 'Tourist SIM', data: '30GB / 30 days', price: '~€15', note: 'Best coverage, EU roaming included' },
      { name: 'MEO', type: 'Prepaid', data: '15GB / 30 days', price: '~€10', note: 'Good value' },
      { name: 'NOS', type: 'Prepaid', data: '10GB / 15 days', price: '~€10', note: 'Decent urban coverage' },
    ],
    esim: true, tip: 'EU roaming means your SIM works across all EU countries. Buy at airport or carrier shop.', buyAt: 'Airport, carrier stores, electronics shops',
  },
  'Spain': {
    carriers: [
      { name: 'Vodafone', type: 'Prepaid', data: '25GB / 28 days', price: '~€15', note: 'EU roaming included' },
      { name: 'Orange', type: 'Holiday SIM', data: '20GB / 14 days', price: '~€10', note: 'Tourist-friendly' },
      { name: 'Movistar', type: 'Prepaid', data: '15GB / 28 days', price: '~€15', note: 'Largest network' },
    ],
    esim: true, tip: 'Any EU SIM works across Europe. Tobacco shops (estancos) sell SIMs and top-ups.', buyAt: 'Airport, estancos, carrier stores, El Corte Inglés',
  },
  'Germany': {
    carriers: [
      { name: 'Telekom', type: 'Prepaid', data: '6GB / 28 days', price: '~€15', note: 'Best network, EU roaming' },
      { name: 'Vodafone', type: 'CallYa', data: '8GB / 28 days', price: '~€10', note: 'Good value' },
      { name: 'ALDI Talk', type: 'Prepaid', data: '7GB / 28 days', price: '~€8', note: 'Budget via O2 network' },
    ],
    esim: true, tip: 'German law requires video ID verification for SIM activation — can take hours. Buy at airport for faster process.', buyAt: 'Airport, ALDI/LIDL, carrier stores',
  },
  'United Kingdom': {
    carriers: [
      { name: 'Three', type: 'Pay As You Go', data: '12GB / 30 days', price: '~£10', note: 'Good 5G, some EU roaming' },
      { name: 'Giffgaff', type: 'Goodybag', data: '15GB / 30 days', price: '~£10', note: 'Order online, arrives free' },
      { name: 'Vodafone', type: 'Pay As You Go', data: '10GB / 30 days', price: '~£10', note: 'Widest coverage' },
    ],
    esim: true, tip: 'Giffgaff can be ordered to your UK address before arrival. No contract, cancel anytime.', buyAt: 'Airport, supermarkets, carrier stores, online',
  },
  'India': {
    carriers: [
      { name: 'Jio', type: 'Prepaid', data: '2GB/day / 28 days', price: '~$4', note: 'Cheapest, huge 4G network' },
      { name: 'Airtel', type: 'Tourist SIM', data: '1.5GB/day / 28 days', price: '~$7', note: 'Best for tourists, English support' },
      { name: 'Vi (Vodafone Idea)', type: 'Prepaid', data: '1.5GB/day / 28 days', price: '~$5', note: 'Good urban coverage' },
    ],
    esim: true, tip: 'Tourist SIMs require passport + photo + local address (hotel works). Activation can take 24h.', buyAt: 'Airport (recommended), carrier stores',
  },
  'Morocco': {
    carriers: [
      { name: 'Maroc Telecom', type: 'Prepaid', data: '20GB / 30 days', price: '~$5', note: 'Best coverage, even rural' },
      { name: 'Orange', type: 'Prepaid', data: '15GB / 30 days', price: '~$4', note: 'Good in cities' },
      { name: 'inwi', type: 'Prepaid', data: '10GB / 30 days', price: '~$3', note: 'Budget pick' },
    ],
    esim: false, tip: 'Incredibly cheap data. Buy at any corner shop or carrier store. No ID needed.', buyAt: 'Airport, corner shops, carrier stores',
  },
  'Egypt': {
    carriers: [
      { name: 'Vodafone Egypt', type: 'Tourist SIM', data: '20GB / 30 days', price: '~$8', note: 'Best coverage' },
      { name: 'Orange', type: 'Prepaid', data: '15GB / 30 days', price: '~$6', note: 'Good value' },
      { name: 'Etisalat', type: 'Prepaid', data: '12GB / 30 days', price: '~$5', note: 'Decent urban' },
    ],
    esim: true, tip: 'Buy at Cairo Airport on arrival. Passport required for registration.', buyAt: 'Airport counters, carrier stores',
  },
  'Kenya': {
    carriers: [
      { name: 'Safaricom', type: 'Prepaid', data: '10GB / 30 days', price: '~$8', note: 'Dominant carrier, M-Pesa payments' },
      { name: 'Airtel Kenya', type: 'Prepaid', data: '10GB / 30 days', price: '~$5', note: 'Good alternative' },
    ],
    esim: true, tip: 'Safaricom M-Pesa is used everywhere for payments — get it. Passport needed.', buyAt: 'Airport, Safaricom shops',
  },
  'South Africa': {
    carriers: [
      { name: 'Vodacom', type: 'Prepaid', data: '10GB / 30 days', price: '~$8', note: 'Best coverage' },
      { name: 'MTN', type: 'Prepaid', data: '10GB / 30 days', price: '~$7', note: 'Good alternative' },
      { name: 'Cell C', type: 'Prepaid', data: '15GB / 30 days', price: '~$6', note: 'Budget option' },
    ],
    esim: true, tip: 'RICA registration required (passport + SA address). Buy at airport for easiest process.', buyAt: 'Airport, Pick n Pay, carrier stores',
  },
  'UAE': {
    carriers: [
      { name: 'du', type: 'Tourist SIM', data: '5GB / 14 days', price: '~$14', note: 'Tourist-focused plans' },
      { name: 'Etisalat', type: 'Visitor Line', data: '4GB / 14 days', price: '~$14', note: 'Wide coverage' },
    ],
    esim: true, tip: 'VoIP apps (WhatsApp calls, FaceTime) are blocked. You need a VPN.', buyAt: 'Airport, carrier stores, malls',
  },
  'Australia': {
    carriers: [
      { name: 'Telstra', type: 'Prepaid', data: '40GB / 28 days', price: '~A$30', note: 'Best rural coverage by far' },
      { name: 'Optus', type: 'Prepaid', data: '50GB / 28 days', price: '~A$30', note: 'Good in cities' },
      { name: 'Vodafone', type: 'Prepaid', data: '30GB / 28 days', price: '~A$20', note: 'Budget option, urban only' },
    ],
    esim: true, tip: 'Telstra is the only option with reliable outback coverage. Buy at airport.', buyAt: 'Airport, JB Hi-Fi, supermarkets, carrier stores',
  },
  'Brazil': {
    carriers: [
      { name: 'Claro', type: 'Prepaid', data: '15GB / 30 days', price: '~$6', note: 'Best overall coverage' },
      { name: 'Vivo', type: 'Prepaid', data: '12GB / 30 days', price: '~$6', note: 'Strong in São Paulo' },
      { name: 'TIM', type: 'Prepaid', data: '10GB / 30 days', price: '~$4', note: 'Budget, good 4G' },
    ],
    esim: true, tip: 'CPF (tax number) technically required but airports sell tourist SIMs with passport only.', buyAt: 'Airport, carrier stores, newsstands',
  },
  'Costa Rica': {
    carriers: [
      { name: 'Kölbi (ICE)', type: 'Prepaid', data: '8GB / 30 days', price: '~$8', note: 'State carrier, best coverage' },
      { name: 'Claro', type: 'Prepaid', data: '5GB / 15 days', price: '~$5', note: 'Decent in populated areas' },
      { name: 'Movistar', type: 'Prepaid', data: '4GB / 15 days', price: '~$4', note: 'Budget option' },
    ],
    esim: false, tip: 'Kölbi has the best mountain/rural coverage. Buy at airport or any supermarket.', buyAt: 'Airport, supermarkets, carrier stores',
  },
  'Peru': {
    carriers: [
      { name: 'Claro', type: 'Prepaid', data: '10GB / 30 days', price: '~$5', note: 'Best coverage including mountains' },
      { name: 'Movistar', type: 'Prepaid', data: '8GB / 30 days', price: '~$5', note: 'Good in Lima' },
      { name: 'Entel', type: 'Prepaid', data: '6GB / 15 days', price: '~$4', note: 'Growing network' },
    ],
    esim: false, tip: 'Coverage is spotty in remote Andes/Amazon areas regardless of carrier.', buyAt: 'Airport, carrier stores, markets',
  },
  'Cambodia': {
    carriers: [
      { name: 'Smart', type: 'Tourist SIM', data: '30GB / 30 days', price: '~$3', note: 'Best coverage' },
      { name: 'Metfone', type: 'Prepaid', data: '30GB / 30 days', price: '~$3', note: 'Good alternative' },
      { name: 'CellCard', type: 'Prepaid', data: '20GB / 30 days', price: '~$2', note: 'Cheapest' },
    ],
    esim: false, tip: 'Some of the cheapest mobile data in the world. Buy at airport or any phone shop.', buyAt: 'Airport, phone shops, guesthouses',
  },
  'Philippines': {
    carriers: [
      { name: 'Globe', type: 'Prepaid', data: '12GB / 30 days', price: '~$5', note: 'Best in Manila and tourist areas' },
      { name: 'Smart', type: 'Prepaid', data: '12GB / 30 days', price: '~$5', note: 'Better island coverage' },
      { name: 'DITO', type: 'Prepaid', data: '15GB / 30 days', price: '~$4', note: 'New carrier, growing fast' },
    ],
    esim: true, tip: 'Island coverage varies wildly. Smart edges Globe outside Manila.', buyAt: 'Airport, sari-sari stores, malls',
  },
  'Georgia': {
    carriers: [
      { name: 'Magti', type: 'Prepaid', data: '20GB / 30 days', price: '~$4', note: 'Best coverage' },
      { name: 'Geocell', type: 'Prepaid', data: '15GB / 30 days', price: '~$3', note: 'Good value' },
      { name: 'Beeline', type: 'Prepaid', data: '10GB / 30 days', price: '~$2', note: 'Budget' },
    ],
    esim: false, tip: 'Very cheap. Buy at Tbilisi Airport or any carrier store. Passport needed.', buyAt: 'Airport, carrier stores, supermarkets',
  },
};

// ── Global eSIM providers ─────────────────────────────────────────────────
const ESIM_PROVIDERS = [
  { name: 'Airalo', desc: 'Largest eSIM marketplace. 200+ countries, buy before you land.', url: 'https://www.airalo.com/', price: 'From $5' },
  { name: 'Holafly', desc: 'Unlimited data eSIMs. Popular for Europe and Asia.', url: 'https://www.holafly.com/', price: 'From $6/day' },
  { name: 'Nomad eSIM', desc: 'Multi-country plans for nomads. Good regional bundles.', url: 'https://www.esim.net/', price: 'From $5' },
  { name: 'Google Fi', desc: 'Works in 200+ countries. Pause/resume anytime. US number.', url: 'https://fi.google.com/', price: '$20/mo base' },
];

// ── Tab types ──────────────────────────────────────────────────────────────
type Tab = 'currency' | 'translate' | 'timezone' | 'weather' | 'plugs' | 'visa' | 'sim';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'currency',  icon: '💱', label: 'Currency' },
  { key: 'translate', icon: '🌐', label: 'Translate' },
  { key: 'timezone',  icon: '⏰', label: 'Time Zones' },
  { key: 'weather',   icon: '🌤', label: 'Weather' },
  { key: 'plugs',     icon: '🔌', label: 'Plugs' },
  { key: 'visa',      icon: '🛂', label: 'Visa' },
  { key: 'sim',       icon: '📶', label: 'SIM Cards' },
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

  // ── Visa state ──────────────────────────────────────────────────────
  const [visaPassport, setVisaPassport] = useState('United States');
  const [visaSearch, setVisaSearch]     = useState('');

  // ── SIM state ─────────────────────────────────────────────────────
  const [simCountry, setSimCountry] = useState('Thailand');

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
        .visa-select { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 18px; color: #fff; font-family: 'DM Mono', monospace; font-size: 13px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; margin-bottom: 12px; }
        .visa-search { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 10px 14px; color: #fff; font-family: 'DM Mono', monospace; font-size: 11px; outline: none; margin-bottom: 20px; }
        .visa-search:focus { border-color: #333; }
        .visa-search::placeholder { color: #2a2a2a; }
        .visa-group { margin-bottom: 24px; }
        .visa-group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .visa-group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .visa-group-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; }
        .visa-group-count { font-family: 'DM Mono', monospace; font-size: 9px; color: #333; margin-left: auto; }
        .visa-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .visa-item { display: flex; align-items: center; gap: 6px; background: #111; border: 1px solid #1a1a1a; border-radius: 6px; padding: 6px 10px; font-family: 'DM Mono', monospace; font-size: 10px; }
        .visa-item-country { color: #ccc; }
        .visa-item-days { font-size: 9px; color: #555; }
        .visa-disclaimer { font-family: 'DM Mono', monospace; font-size: 8px; color: #222; letter-spacing: 0.1em; line-height: 1.6; margin-top: 20px; padding-top: 16px; border-top: 1px solid #1a1a1a; }
        .sim-select { width: 100%; background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 18px; color: #fff; font-family: 'DM Mono', monospace; font-size: 13px; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; margin-bottom: 20px; }
        .sim-carriers { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .sim-carrier { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .sim-carrier-top { display: flex; justify-content: space-between; align-items: center; }
        .sim-carrier-name { font-family: 'DM Mono', monospace; font-size: 13px; color: #fff; font-weight: 500; }
        .sim-carrier-price { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #e8553a; line-height: 1; }
        .sim-carrier-type { font-family: 'DM Mono', monospace; font-size: 9px; color: #555; letter-spacing: 0.1em; text-transform: uppercase; }
        .sim-carrier-data { font-family: 'DM Mono', monospace; font-size: 12px; color: #ccc; }
        .sim-carrier-note { font-family: 'DM Mono', monospace; font-size: 9px; color: #444; line-height: 1.5; }
        .sim-info-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .sim-info-card { flex: 1; background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px; }
        .sim-info-label { font-family: 'DM Mono', monospace; font-size: 8px; color: #333; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 4px; }
        .sim-info-value { font-family: 'DM Mono', monospace; font-size: 12px; color: #ccc; }
        .sim-tip { background: rgba(232,85,58,0.04); border: 1px solid rgba(232,85,58,0.1); border-radius: 8px; padding: 12px 14px; font-family: 'DM Mono', monospace; font-size: 10px; color: #888; line-height: 1.6; margin-bottom: 20px; }
        .sim-tip::before { content: '💡 '; }
        .esim-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid #1a1a1a; }
        .esim-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .esim-card { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 4px; text-decoration: none; transition: border-color 0.2s; cursor: pointer; }
        .esim-card:hover { border-color: #333; }
        .esim-name { font-family: 'DM Mono', monospace; font-size: 11px; color: #fff; font-weight: 500; }
        .esim-desc { font-size: 10px; color: #444; line-height: 1.5; }
        .esim-price { font-family: 'DM Mono', monospace; font-size: 9px; color: #e8553a; margin-top: auto; }
        .esim-arrow { font-family: 'DM Mono', monospace; font-size: 8px; color: #2a2a2a; margin-top: 4px; transition: color 0.2s; }
        .esim-card:hover .esim-arrow { color: #e8553a; }
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

        {/* ── Visa Check ────────────────────────────────────────────── */}
        {activeTab === 'visa' && (() => {
          const data = VISA_DB[visaPassport] || {};
          const entries = Object.entries(data)
            .filter(([country]) => !visaSearch || country.toLowerCase().includes(visaSearch.toLowerCase()))
            .map(([country, req]) => ({ country, ...parseVisa(req) }));
          const groups = [
            { key: 'visa_free', label: 'Visa Free', color: '#47ff8c' },
            { key: 'voa', label: 'Visa on Arrival', color: '#47d4ff' },
            { key: 'evisa', label: 'e-Visa Available', color: '#ffb74d' },
            { key: 'required', label: 'Visa Required', color: '#ff6b6b' },
          ];
          return (
            <div className="tool-card">
              <div className="tool-label">Your passport</div>
              <select className="visa-select" value={visaPassport} onChange={e => setVisaPassport(e.target.value)}>
                {VISA_PASSPORTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input className="visa-search" placeholder="Search destination..." value={visaSearch} onChange={e => setVisaSearch(e.target.value)} />
              {groups.map(g => {
                const items = entries.filter(e => e.type === g.key);
                if (items.length === 0) return null;
                return (
                  <div key={g.key} className="visa-group">
                    <div className="visa-group-header">
                      <div className="visa-group-dot" style={{ background: g.color }} />
                      <span className="visa-group-label" style={{ color: g.color }}>{g.label}</span>
                      <span className="visa-group-count">{items.length}</span>
                    </div>
                    <div className="visa-list">
                      {items.sort((a, b) => a.country.localeCompare(b.country)).map(item => (
                        <div key={item.country} className="visa-item">
                          <span className="visa-item-country">{item.country}</span>
                          {item.days && <span className="visa-item-days">{item.days}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {entries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#222', letterSpacing: '0.2em' }}>
                  {visaSearch ? 'No matching destinations' : 'No data available for this passport'}
                </div>
              )}
              <div className="visa-disclaimer">
                This is a general reference only. Requirements change frequently and may vary based on purpose of travel, length of stay, and entry point. Always verify with the destination country's embassy or consulate before traveling.
              </div>
            </div>
          );
        })()}

        {/* ── SIM Cards ─────────────────────────────────────────────── */}
        {activeTab === 'sim' && (
          <div className="tool-card">
            <div className="tool-label">Select country</div>
            <select className="sim-select" value={simCountry} onChange={e => setSimCountry(e.target.value)}>
              {Object.keys(SIM_DATA).sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {SIM_DATA[simCountry] && (() => {
              const sim = SIM_DATA[simCountry];
              return (
                <>
                  <div className="sim-carriers">
                    {sim.carriers.map((c, i) => (
                      <div key={i} className="sim-carrier">
                        <div className="sim-carrier-top">
                          <div>
                            <div className="sim-carrier-name">{c.name}</div>
                            <div className="sim-carrier-type">{c.type}</div>
                          </div>
                          <div className="sim-carrier-price">{c.price}</div>
                        </div>
                        <div className="sim-carrier-data">{c.data}</div>
                        {c.note && <div className="sim-carrier-note">{c.note}</div>}
                      </div>
                    ))}
                  </div>

                  <div className="sim-info-row">
                    <div className="sim-info-card">
                      <div className="sim-info-label">eSIM Support</div>
                      <div className="sim-info-value">{sim.esim ? '✓ Available' : '✕ Not available'}</div>
                    </div>
                    <div className="sim-info-card">
                      <div className="sim-info-label">Where to Buy</div>
                      <div className="sim-info-value">{sim.buyAt}</div>
                    </div>
                  </div>

                  <div className="sim-tip">{sim.tip}</div>
                </>
              );
            })()}

            <div className="esim-section">
              <div className="tool-label">Global eSIM Providers</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#444', marginBottom: 14, lineHeight: 1.6 }}>
                Skip the airport queue — buy an eSIM before you land. Works on iPhone XS+ and most modern Androids.
              </div>
              <div className="esim-grid">
                {ESIM_PROVIDERS.map(p => (
                  <a key={p.name} className="esim-card" href={p.url} target="_blank" rel="noopener noreferrer">
                    <div className="esim-name">{p.name}</div>
                    <div className="esim-desc">{p.desc}</div>
                    <div className="esim-price">{p.price}</div>
                    <div className="esim-arrow">Visit →</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
    </PageReveal>
  );
}
