# FeeCasino Bet - Mock Betting Platform

## ⚠️ WARNING ⚠️

**THIS IS A DEVELOPMENT/MOCK PLATFORM ONLY.**

**DO NOT USE FOR REAL MONEY GAMBLING.**

**NO REAL FINANCIAL TRANSACTIONS OCCUR IN THIS APPLICATION.**

## Overview

FeeCasino Bet is a sandbox betting application that simulates the look and feel of commercial betting platforms using entirely fake money. It's designed for entertainment and demonstration purposes only.

## Features

- 🎮 Complete Aviator game with realistic mechanics
- 💰 Fake money system with deposit/withdrawal simulation
- 🌍 Multi-currency support (50+ currencies)
- 🔔 Realistic notifications with sound effects
- 📱 Responsive design for all devices
- 🎨 Custom theme (green + black)
- 📊 Supabase integration for data persistence
- 🔒 Anonymous user sessions

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES Modules)
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with CSS variables
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Setup Instructions

### 1. Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Run the SQL from `supabase-schema.sql` in the SQL editor
3. Note your project URL and anon key

### 2. Local Development

1. Clone or download the project files
2. Update the Supabase URL and anon key in all API files:
   - `api/auth.js`
   - `api/balance.js`
   - Any other API files

3. Serve the files using a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .
