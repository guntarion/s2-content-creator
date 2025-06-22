# AI Content Assembly Line - Frontend

An exceptional Next.js frontend for the FastAPI blog post generation workflow that transforms waiting time into engagement time through the "AI Assembly Line" interface.

![AI Content Assembly Line](https://via.placeholder.com/800x400/3498db/ffffff?text=AI+Content+Assembly+Line)

## ✨ Features

### 🏭 AI Assembly Line Interface
- **Real-time Progress Tracking**: Watch your content build piece by piece
- **Live Content Building**: See your blog post appear progressively as each step completes
- **7-Step Workflow Visualization**: Clear progress through keyword research to social snippets
- **Progressive Disclosure**: Show intermediate outputs, not just final results

### 🎨 Enhanced User Experience
- **Smooth Animations**: Framer Motion-powered transitions and micro-interactions
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Updates**: Server-Sent Events with polling fallback
- **Error Handling**: Graceful degradation and retry mechanisms

### 🛠️ Technical Excellence
- **TypeScript**: Fully typed for better development experience
- **Modern Stack**: Next.js 15, React 19, shadcn/ui, Tailwind CSS
- **Component Architecture**: Reusable, maintainable component structure
- **Performance**: Optimized builds and lazy loading

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running (optional for development with mock API)

### Installation

1. **Clone and Install**
   ```bash
   cd s2-content-creator
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_ENABLE_MOCK_API=true  # Set to false when using real backend
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📱 Application Flow

### 1. Landing Page (`/`)
- Animated loading screen with brand introduction
- Auto-redirects to generation form

### 2. Generation Form (`/generate`)
- **Comprehensive Input Form**: Title, industry, purpose, audience, etc.
- **Smart Validation**: Real-time form validation with helpful feedback
- **Feature Toggles**: Enable/disable keyword research, SEO focus, image generation
- **Demo Mode**: Quick start with pre-filled healthcare example

### 3. AI Assembly Line (`/workflow/{id}`)
- **Control Tower (Left Panel)**: 7-step progress tracker with expandable outputs
- **Live Canvas (Right Panel)**: Blog post building in real-time
- **Connection Status**: Visual indicator for SSE/polling connection
- **While You Wait Tips**: Rotating content marketing advice

### 4. Results Page (`/result/{id}`)
- **Final Blog Post**: Fully rendered with editing capabilities
- **SEO Information**: Title, description, keywords, and tags
- **Generated Images**: Featured image and social thumbnails
- **Social Previews**: Twitter, LinkedIn, and Instagram card previews
- **Export Options**: Download as JSON, copy content, share links

## 🏗️ Architecture

### Component Structure
```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── generate/          # Generation form page
│   ├── workflow/[id]/     # AI Assembly Line interface
│   └── result/[id]/       # Results and editing page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── workflow/          # Custom workflow components
│       ├── GenerationForm.tsx
│       ├── WorkflowTracker.tsx
│       ├── ControlTower.tsx
│       ├── LiveCanvas.tsx
│       └── SocialCardPreview.tsx
├── hooks/                 # Custom React hooks
│   ├── useWorkflowTracking.ts
│   └── useWorkflowStream.ts
├── lib/                   # Utilities and configuration
│   ├── types.ts          # TypeScript definitions
│   ├── api-client.ts     # API communication
│   └── config.ts         # Environment configuration
└── docs/                 # Comprehensive documentation
```

### Key Components

#### 1. WorkflowTracker
Main orchestrator component managing the AI Assembly Line interface.

#### 2. ControlTower  
Left panel showing 7-step workflow progress with interactive elements.

#### 3. LiveCanvas
Right panel where blog content builds progressively in real-time.

#### 4. GenerationForm
Comprehensive form with validation, feature toggles, and smart defaults.

## 🔌 API Integration

### Real-time Updates
The application uses Server-Sent Events (SSE) for real-time updates with automatic fallback to polling:

```typescript
// Automatic connection management
const { status, result, error } = useWorkflowTracking();
```

### Mock API Development
For development without the backend:

```env
NEXT_PUBLIC_ENABLE_MOCK_API=true
```

The mock API simulates the complete workflow with realistic timing and data. Perfect for frontend development and testing.

### Backend Integration
When connecting to the real FastAPI backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_MOCK_API=false
```

**⚠️ Important for Backend Team:** If "Start Demo Workflow" is giving errors, see the [Backend Integration Guide](docs/backend-integration.md) for debugging steps and API requirements.

## 🎛️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL |
| `NEXT_PUBLIC_ENABLE_SSE` | `true` | Enable Server-Sent Events |
| `NEXT_PUBLIC_ENABLE_MOCK_API` | `true` | Use mock API for development |
| `NEXT_PUBLIC_POLLING_INTERVAL` | `2000` | Polling interval (ms) when SSE fails |
| `NEXT_PUBLIC_ENABLE_ANIMATIONS` | `true` | Enable Framer Motion animations |

### Feature Flags

```env
NEXT_PUBLIC_FEATURE_SSE=true
NEXT_PUBLIC_FEATURE_ANIMATIONS=true  
NEXT_PUBLIC_FEATURE_SOCIAL_PREVIEWS=true
NEXT_PUBLIC_FEATURE_EDITING=true
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Frontend Plan](docs/frontend-plan.md)** - Complete implementation strategy
- **[API Integration](docs/api-integration.md)** - Frontend API usage guide  
- **[Backend Integration](docs/backend-integration.md)** - **🚨 BACKEND TEAM: READ THIS FIRST**
- **[Component Guide](docs/component-guide.md)** - Component architecture details
- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and solutions

### 🚨 For Backend Developers

**Having issues with "Start Demo Workflow"?** → **[Quick Start Guide](docs/quick-start-backend.md)** (5 min fix)

**Need full integration details?** → **[Backend Integration Guide](docs/backend-integration.md)** (complete reference)

**Quick Summary:**
- Frontend expects specific API response formats
- Common issues: CORS, workflow storage, UUID generation
- **Immediate fix**: Enable mock API with `NEXT_PUBLIC_ENABLE_MOCK_API=true`
- **Real fix**: Follow the backend integration guide for proper API implementation

## 🧪 Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Components**: Functional components with hooks

### Testing the Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test with Demo Data**
   - Visit `http://localhost:3000`
   - Click "Start Demo Workflow" for instant testing

3. **Test Full Workflow**
   - Fill out the generation form
   - Watch the AI Assembly Line in action
   - View the final results with editing capabilities

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
Remember to configure environment variables in your deployment platform:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_ENABLE_MOCK_API=false
```

## 🎯 Future Enhancements

### Planned Features
- **Video Workflow Integration**: Support for video generation workflows
- **Multi-workflow Management**: Handle multiple concurrent generations
- **Advanced Editing**: Rich text editor for content modification
- **Analytics Dashboard**: Usage metrics and performance tracking
- **User Accounts**: Save and manage generated content
- **Templates**: Pre-configured templates for different industries

### Technical Improvements
- **PWA Support**: Offline capabilities and app-like experience
- **Real-time Collaboration**: Multiple users working on content
- **Advanced Caching**: Redis integration for better performance
- **Internationalization**: Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Follow the existing code style and architecture
4. Add tests for new features
5. Update documentation
6. Create a pull request

## 📄 License

This project is part of the FABRIC content generation system. See the main project for licensing information.

---

**Ready to create amazing content with AI? Start the development server and experience the Assembly Line!** 🚀

## 🔗 Related Projects

- **[FastAPI Backend](../s1-fastapi-workflow-post/)** - The AI-powered content generation API
- **[Documentation](docs/)** - Comprehensive implementation guides

---

*Built with ❤️ using Next.js, TypeScript, and modern web technologies.*