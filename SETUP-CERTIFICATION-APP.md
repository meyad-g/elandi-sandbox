# 🎓 Certification Exam Prep App - Setup Guide

A modern certification exam preparation platform powered by **Google Gemini AI** with infinite question generation for CFA, AWS, and other professional certifications.

## 🚀 Quick Setup

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy your API key

### 2. Configure Environment
Create `.env.local` in the `apps/quizzing` directory:

```bash
# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Development settings
NODE_ENV=development
```

### 3. Install and Run
```bash
cd apps/quizzing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app!

## 🎯 Features

### **Certification Tracks Supported**
- **CFA Program**: Level I, Level II (with proper exam formats)
- **AWS Certifications**: Cloud Practitioner, Solutions Architect Associate, Developer Associate

### **Question Types**
- **Multiple Choice**: 3 options (CFA) or 4 options (AWS)
- **Multiple Response**: "Choose TWO/THREE" format for AWS
- **Vignettes**: Case studies with follow-up questions (CFA Level II)
- **Flashcards**: Key concepts and formulas for memorization

### **Smart Features**
- **Infinite Questions**: AI generates unlimited practice content
- **Exam-Accurate**: Questions mirror real certification exam formats
- **Level-Specific**: Content appropriate for each certification level
- **Objective-Based**: Practice by specific learning objectives
- **Progress Tracking**: Score tracking and readiness indicators

## 🧠 Architecture

### **Clean API Design**
- **`/api/v2/generate-question`**: Streams certification questions with Gemini
- **`/api/v2/generate-flashcard`**: Generates study flashcards
- **Prompt Library**: Reusable, fine-tuned prompts for each certification
- **Certification Data**: Structured exam profiles with real objectives

### **Technologies Used**
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **AI**: Google Gemini 1.5 Flash (fast, reliable, cost-effective)
- **Backend**: Next.js API routes with streaming
- **State**: React hooks with proper TypeScript types

## 📊 Certification Data

### **CFA Level I Example**
```typescript
{
  name: 'CFA Level I',
  objectives: [
    {
      title: 'Ethical and Professional Standards',
      weight: 15, // 15% of exam
      level: 'knowledge'
    }
    // ... 9 more objectives
  ],
  constraints: {
    totalQuestions: 180,
    timeMinutes: 270,
    optionCount: 3, // A, B, C format
    passingScore: 70
  }
}
```

### **AWS Solutions Architect Example**
```typescript
{
  name: 'AWS Solutions Architect Associate',
  objectives: [
    {
      title: 'Design Resilient Architectures',
      weight: 26, // 26% of exam
      level: 'application'
    }
    // ... 3 more domains
  ],
  constraints: {
    totalQuestions: 65,
    timeMinutes: 130,
    optionCount: 4, // A, B, C, D format
    passingScore: 720
  }
}
```

## 🎨 User Experience

### **1. Certification Selection**
- Beautiful cards showing CFA vs AWS tracks
- Level breakdown with difficulty indicators
- Cost, duration, and popularity information

### **2. Learning Interface**
- **Objectives Strip**: Visual progress through exam domains
- **Question Interface**: Exam-accurate question formats
- **Real-time Feedback**: Immediate explanations and scoring
- **Infinite Generation**: Never run out of practice questions

### **3. Progress Tracking**
- Score by objective
- Overall readiness percentage
- Question history and performance trends

## 🔧 Customization

### **Adding New Certifications**
1. Add exam profile to `src/lib/certifications.ts`
2. Add level-specific context to `src/lib/prompts.ts`
3. Update UI in `src/components/CertificationSelector.tsx`

### **Modifying Question Generation**
- Edit prompts in `src/lib/prompts.ts`
- Adjust context for better question quality
- Add new question types as needed

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Environment Variables for Production**
```bash
GEMINI_API_KEY=your-production-api-key
```

## 💡 Business Model Ready

This app is designed for premium certification prep market:
- **Individual Plans**: $20-40/month per certification
- **Corporate Plans**: $200-500/month for teams
- **Enterprise**: Custom pricing with SSO, analytics, compliance

**The certification prep market is worth billions annually with companies paying $1,000-4,000 per employee for CFA training and $150-500 for AWS certification prep.**

---

Built with ❤️ using Google Gemini AI for reliable, fast, and cost-effective question generation.
