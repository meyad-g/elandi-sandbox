# Elandi Sandbox

A comprehensive AI-powered learning platform built with Next.js, featuring job analysis, personalized quiz generation, and interactive flashcards.

## 🚀 Features

### Job Analysis & Quiz Generation
- **Natural Language Job Search**: Search for jobs using natural language like "software engineer at Meta"
- **URL-Based Analysis**: Paste job posting URLs for instant analysis
- **AI-Powered Skill Extraction**: Automatically identifies key skills from job descriptions
- **Personalized Quizzes**: Generate custom true/false questions based on extracted skills
- **Progressive Learning**: Questions get more challenging as you advance

### Interactive Learning Modes
- **Quiz Mode**: Test your knowledge with AI-generated questions
- **Learn Mode**: Study with auto-generated flashcards
- **Skill-Based Learning**: Focus on specific technologies and frameworks
- **Real-time Streaming**: Watch questions and flashcards generate in real-time

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Easy on the eyes with carefully crafted color palette
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI/ML**: OpenAI GPT-4, Custom AI agents
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icons
- **Typography**: Geist Sans font family
- **Build**: Turborepo for monorepo management

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/elandi-sandbox.git
cd elandi-sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
elandi-sandbox/
├── apps/
│   └── quizzing/          # Main quiz application
│       ├── src/
│       │   ├── app/       # Next.js app router
│       │   ├── components/# React components
│       │   └── types/     # TypeScript types
│       └── package.json
├── packages/
│   └── ai/                # AI agents and utilities
│       └── src/
└── package.json          # Root package.json with workspaces
```

## 🎯 Usage

### Adding Job Postings

1. **Search by Keywords**: Enter terms like "frontend developer at Netflix"
2. **Paste URLs**: Copy job posting URLs from LinkedIn, Indeed, etc.
3. **AI Analysis**: Watch as the system analyzes the job and extracts skills
4. **Start Learning**: Begin your personalized learning journey

### Taking Quizzes

- **True/False Format**: Simple, focused questions
- **Skill-Specific**: Questions tailored to job requirements
- **Instant Feedback**: Immediate explanations for each answer
- **Progress Tracking**: See your improvement over time

### Learning with Flashcards

- **Auto-Generated**: AI creates comprehensive study materials
- **Progressive Learning**: Start simple, get more advanced
- **Interactive**: Flip cards, track progress, load more content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [OpenAI](https://openai.com/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Geist](https://vercel.com/font)

---

**Made with ❤️ for developers who want to level up their skills**