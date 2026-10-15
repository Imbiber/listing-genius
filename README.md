# 🛍️ ListingGenius

> **AI E-Commerce Listing Generator & Audio Audition Assistant**  
> Powered by **Google Gemma 2** (running 100% locally via Ollama) and **ElevenLabs Voice AI**.  
> Built for **Hacktoberfest Open-Source AI Challenge: Week 2 — Side Hustle**.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Gemma 2](https://img.shields.io/badge/Google_Gemma_2-Ollama-4285F4)](https://ollama.com/library/gemma2)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS_v2-black)](https://elevenlabs.io)

---

## 💡 The Problem

Solo creators, crafters, vintage pickers, and side-hustlers spend hours every week staring at blank forms trying to write engaging, SEO-optimized listings for **Etsy, Amazon, and eBay**. 

Existing AI copywriting tools have three major dealbreakers:
1. **Expensive recurring subscriptions & per-token fees** that eat into small margins.
2. **Data leakage**: Unreleased inventions, custom jewelry designs, wholesale margins, or proprietary supplier details get fed into public cloud LLMs.
3. **Flat, lifeless text**: Sellers can't easily tell how their copy actually sounds to a human buyer.

## 🚀 The Solution: ListingGenius

**ListingGenius** lets sellers upload product photos or bullet notes and instantly creates platform-tailored copy with zero cloud LLM fees, 100% on-device privacy, and voice preview:

- 🔒 **100% Local Inference**: Runs **Gemma 2** locally via Ollama. $0 API cost, complete privacy, works offline.
- 🎯 **Platform-Specific Optimization**: 
  - **Etsy**: Emphasizes emotional storytelling, artisanal touches, and comma-separated search tags.
  - **Amazon**: Structured bullet points highlighting specs, materials, and search-optimized keyword density.
  - **eBay**: Condition clarity, buyer reassurance, and decisive call-to-actions.
- 🎙️ **Audio Audition with ElevenLabs**: Listen to how your listing sounds with expressive speech (`eleven_multilingual_v2`), making it easy to spot awkward phrasing or reuse the narration for TikTok Shop / Reels video listings.

---

## 🎥 Video Demo & Live Preview

[![Watch the Demo](https://raw.githubusercontent.com/Imbiber/listing-genius/main/public/screenshots/live_demo_screenshot.png)](https://youtu.be/yHkvyK9Pdlw)

▶️ **Watch the full video walkthrough on YouTube**: [https://youtu.be/yHkvyK9Pdlw](https://youtu.be/yHkvyK9Pdlw)

---

## 🛠️ Architecture

```
[ Seller Input ] (Photos / Description / Platform Choice)
         │
         ▼
[ Next.js Turbopack App ] ──► [ Local Ollama API (http://localhost:11434) ]
                                            │
                                  Runs Google Gemma 2
                                  (Zero API Cost · Fully Offline)
                                            │
                                            ▼
                               [ Structured JSON Output ]
                               (Title, Description, Tags, CTA)
                                            │
                                            ▼
                           [ ElevenLabs Multilingual v2 ]
                                            │
                                            ▼
                             [ Streamed MP3 Narration ]
```

---

## ⚡ Quickstart

### Prerequisites

1. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. **Pull Google Gemma 2**:
   ```bash
   ollama pull gemma2
   ```

### Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Imbiber/listing-genius.git
   cd listing-genius
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your ElevenLabs API key:
   ```env
   ELEVENLABS_API_KEY=your_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Challenge Categories Entered

- **Theme: Side Hustle** (Hacktoberfest Week 2)
- **Best Use of Gemma** ($200) — Running Google's Gemma 2 locally for zero-cost, private inference.
- **Best Use of ElevenLabs** ($100) — Providing real-time voice auditions and social video voiceover audio.

---

## 📄 License

MIT License. Built with ❤️ for the global open source community.
