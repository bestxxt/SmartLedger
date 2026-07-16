<div align="center">
  <img src="imgs/logo.png" alt="Smart Ledger Logo" width="150" />
  <h1>Smart Ledger</h1>
</div>

[中文版](README_zh.md)

Smart Ledger is a modern web application focused on personal finance tracking. It features a minimalist, retro visual design and deeply integrates AI auto-parsing capabilities, helping you record daily expenses quickly and elegantly through natural language.

> [!WARNING]
> **Security Notice**
> 
> This project is for personal exploration and development. **It is strongly recommended to run it only in a personal local area network (intranet) or locally.**
> This system has not undergone exhaustive penetration testing or professional security audits and is not a "bulletproof" secure system. Please do not expose it to the public internet, and do not store highly sensitive, bank-level passwords or keys within it.

## Project Structure
- `/frontend`: Frontend user interface (React SPA)
- `/backend`: Backend API service
- `/legacy`: (Backup) Early monolithic architecture version code

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
*(Backend runs on `http://localhost:4000` by default)*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173` by default)*
