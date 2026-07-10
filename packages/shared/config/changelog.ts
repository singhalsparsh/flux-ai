export const changelogMdx = `
### Changelog

--------------------------------

### FluxAI v1.0.0 — July 2026

#### 🚀 Major Features

- **Local AI Models**: Run AI models directly in your browser using WebGPU. No cloud dependency, full privacy.
- **40+ API Providers**: Support for OpenAI, Anthropic, Google, Mistral, Groq, NVIDIA, Together, Fireworks, and 35+ more providers.
- **Multi-Key Fallback**: Add multiple API keys per provider — if one fails, the system automatically tries the next.
- **Smart & Local Model Sections**: Clear separation between cloud API models and locally run models.

#### 🎨 UI/UX

- **Rebranded to FluxAI**: New sky-blue theme, updated branding across all pages.
- **Mobile Support**: Full mobile responsive design with touch-friendly interactions.
- **Pill-Shaped Buttons**: Modern rounded buttons throughout the interface.
- **Thread → Chat Rename**: All "thread" references updated to "chat" for clarity.
- **Time-Based Greeting**: Dynamic greeting with user's name at the top of chat.

#### ⚡ Performance

- **Component Preloading**: Key components are pre-cached for instant subsequent loads.
- **Optimized Build**: Faster cold starts and reduced bundle size.

#### 🛡️ Privacy & Security

- **Auth Gating**: API-based models require authentication. Unregistered users can still use local AI models.
- **Local-First**: All API keys and chat history stored locally in your browser.
- **Enhanced Privacy Policy**: Updated to reflect new features and data handling.

#### 📄 New Features

- **Environmental Impact Tracker**: See electricity, water usage, and cost per prompt in real-time.
- **Long Prompt as File**: Paste long prompts and they're automatically treated as an uploaded file.
- **Grammar Check**: Built-in grammar checking for your messages.
- **File Upload**: Upload files directly in chat.
- **Download Output**: Download AI responses as TXT, DOCX, PDF, or image.
- **Stop Button**: Stop AI generation mid-stream with a single click.

#### 🔧 Improvements

- Enhanced Local AI settings with better model organization
- Device check before downloading models
- Click-and-hold download for local models
- Downloaded model state with grey disabled button
- Delete individual downloaded models
- Better error handling and recovery
`;
