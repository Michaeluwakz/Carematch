# CareMatch AI

## Problem Definition and Context

Accessing, understanding, and managing healthcare is a challenge for millions of people worldwide. Many face barriers such as:
- Complex healthcare systems and confusing medical information
- Language and literacy obstacles
- Limited access to reliable health advice and mental health support
- Difficulty finding trusted providers, understanding insurance, or keeping track of health records
- Lack of quick access to emergency information and contacts

**Context:**
- The rise of digital health and AI offers new opportunities to bridge these gaps, but many solutions remain fragmented, hard to use, or inaccessible to non-technical users.
- CareMatch AI was created to provide a single, compassionate, and user-friendly platform that empowers users to take control of their health, access multilingual AI support, and navigate care with confidence—no matter their background or location.

---

## Overview

CareMatch AI is a next-generation, user-friendly web application designed to empower individuals in managing their health and navigating healthcare systems. By combining advanced AI, intuitive design, and a holistic approach to both physical and mental health, CareMatch AI serves as a compassionate digital companion for users worldwide.

---

## What Problem Is CareMatch AI Solving in Africa?

CareMatch AI addresses the critical challenges of healthcare access, information, and continuity in Africa, where many people face:
- Limited access to reliable health information and professional care
- Overburdened or distant clinics and hospitals
- Low digital literacy and inconsistent internet connectivity
- The need for affordable, personalized, and culturally relevant health support
- Emergency situations where quick access to personal health data and contacts can save lives

CareMatch AI bridges these gaps by providing a digital health companion that works both online and offline, empowers users to manage their health, and connects them to local care resources.

---

## Descriptive Definition and Goal

CareMatch AI is a next-generation, AI-powered health companion and care navigation platform designed for the African context.

**Goal:** Empower individuals and families to take control of their health, access trusted information, connect with local healthcare providers, and receive personalized support—regardless of their connectivity, location, or background.

The app combines AI-driven chatbots, local health directories, emergency tools, and low-power solution (Low power mode and offline Capabilities) technology to ensure everyone can get the help they need, when they need it.

---

## Key Feature List

**1. AI Health Assistant Chat**
- 24/7 conversational health support for symptoms, questions, and general advice
- Personalized responses based on user profile and health records

**2. AI Coach Dashboard**
- Smart daily schedule, interactive checklist, and progress tracking
- Achievements, badges, and gamification for health goals
- Dedicated AI coach chat and manual override for plans
- Coach onboarding flow for personalized coaching

**3. Clinical Dashboard**
- For authorized medical professionals
- Analyze patient records, review AI-assisted insights, and manage care escalations
- Risk stratification analysis and predictive analytics
- Placeholder for future real-time data, advanced analytics, and compliance features

**4. Care Navigator**
- Smart search for nearby clinics, hospitals, and practitioners using a local directory
- Prioritizes local results and provides directions, contact info, and services

**5. Centres Directory**
- Directory of healthcare centres (federal, specialty, teaching hospitals, NHIA practitioners)
- Search and browse by type, location, and services

**6. My Health Record**
- View and manage visit summaries, immunization records, and lab results
- Dashboard for personal health records (EHR-like)

**7. Health Insights**
- AI-generated insights from health records and lifestyle data
- Visualizations and actionable recommendations

**8. Mental Health Companion**
- Dedicated chat for mental health support, encouragement, and journaling
- AI analyzes journal entries and offers uplifting, actionable feedback
- Voice AI companion mode (powered by ElevenLabs)

**9. Journal with AI Feedback**
- Users can write daily journals
- Each entry gets a short, AI-generated suggestion or encouragement
- Feedback is clickable for more detail

**10. Reminders**
- Set and manage health-related reminders (medication, appointments, self-care)
- Works offline and syncs when online

**11. Emergency Info Card**
- Quick-access card with allergies, chronic conditions, and emergency contacts
- Visible in the header and settings for fast retrieval in urgent situations
- Editable directly from the card

**12. Swipeable Health & Mental Health Info Cards**
- UI cards with key health and mental health tips
- Swipe left/right to browse; clickable for more info

**13. User Health Profile**
- Store and update personal health data (age, weight, conditions, medications, etc.)
- Used to personalize AI responses and care navigation

**14. Health Analytics & AI Recommendations**
- Visual trends (e.g., heart rate, weight, sleep)
- AI-generated health score and actionable recommendations

**15. Offline-First & Connectivity Resilience**
- Works even with slow, intermittent, or no internet
- Caches key resources, queues actions, and syncs when online
- Shows banners and handles errors gracefully

**16. Progressive Web App (PWA) Support**
- Installable on any device
- Caches assets for offline use

**17. Notifications Dashboard**
- In-app notification dashboard to view and manage notifications

**18. Resources Hub**
- Curated health resources, articles, and educational videos
- Access to AI-powered tools (Symptom Checker, Health Insights, Mental Health Companion)

**19. User Onboarding**
- Guided onboarding with health and lifestyle questions to personalize the experience

**20. Profile Download & Data Portability**
- Users can download their health profile as a file for backup or sharing

**21. Account Management**
- Secure login, signup, and account deletion

**22. Accessibility & Local Language Support**
- Multiple language options and accessible UI

**23. Settings**
- Manage account, emergency info, preferences, and advanced settings

**24. Backend Services**
- Escalation service for urgent care requests
- External API integration for health data
- Web scraping for provider data enrichment
- Advanced reminder and notification management
- Rich user profile and health record management

---

## Benefits of Each Feature

- **AI Health Assistant Chat:**
  - Empowers users with instant, reliable health information and guidance, reducing misinformation and unnecessary clinic visits.

- **Care Navigator:**
  - Connects users to the most relevant local care options, saving time and improving access to trusted providers.

- **Mental Health Companion:**
  - Reduces stigma, provides emotional support, and encourages self-care for mental well-being.

- **Journal with AI Feedback:**
  - Promotes self-reflection and mental health, with actionable, uplifting suggestions tailored to the user’s mood.

- **Reminders:**
  - Improves medication adherence, appointment attendance, and self-care routines, even when offline.

- **Emergency Info Card:**
  - Saves lives by making critical health info and contacts instantly available in emergencies.

- **Swipeable Info Cards:**
  - Educates users with bite-sized, actionable health and mental health tips in an engaging format.

- **User Health Profile:**
  - Centralizes health data for better personalization and continuity of care.

- **Health Analytics & AI Recommendations:**
  - Helps users track progress, spot trends, and receive expert-backed advice for healthier living.

- **Offline-First & Connectivity Resilience:**
  - Ensures the app is always usable, regardless of internet quality, making it ideal for African environments.

- **PWA Support:**
  - Makes the app accessible on any device, with or without app stores.

- **Notifications:**
  - Keeps users informed and engaged with timely, relevant updates.

- **User Onboarding:**
  - Personalizes the experience from the start, increasing engagement and relevance.

- **Profile Download:**
  - Gives users control over their data and enables sharing with healthcare providers.

- **Account Management:**
  - Ensures privacy, security, and user autonomy.

- **Accessibility & Local Language Support:**
  - Makes the app usable for diverse populations, including those with disabilities or limited English proficiency.

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Actions, TypeScript)
- **React 18**
- **Tailwind CSS** (custom theme, responsive design)
- **Radix UI** (accessible UI primitives)
- **Lucide React** (iconography)
- **Framer Motion** (animations)
- **React Hook Form** (forms)
- **Recharts** (data visualization)
- **PWA Support** (manifest, service worker)
- **Custom Hooks & Contexts** (auth, planner, connection status, offline queue)
- **Component Library** (cards, chat, dashboards, onboarding, reminders, notifications, health record, etc.)
- **Voice AI Integration** (ElevenLabs for mental health companion)
- **Advanced Routing** (multi-step onboarding, dashboards, sub-pages)

### Backend & AI
- **Genkit AI** (modular AI flows: Google AI, Gemini, DeepSeek, OpenAI integration)
- **Firebase** (user authentication, Firestore profile and health record storage, reminders, notifications)
- **Node.js** (custom scripts, web scraping, backend logic)
- **Cheerio, node-fetch** (web scraping for healthcare data enrichment)
- **Custom API Endpoints** (Next.js API routes for AI coach, user profile, document parsing, etc.)
- **Escalation Service** (urgent care requests, metrics, tracking)
- **External API Integration** (Health.gov, BetterDoctor, etc.)
- **Web Scraper Service** (enrich provider data from the web)
- **Reminder & Notification Services** (advanced CRUD, Firestore integration)
- **User Service** (rich user profile and EHR management)
- **Health Analytics** (trend analysis, risk scoring, AI recommendations)

### Other
- **ESLint, Prettier** (code quality and formatting)
- **TypeScript, Zod** (type safety and validation)
- **Modern PWA support** (manifest, service worker)
- **Custom Data Models** (federal medical centres, specialty hospitals, teaching hospitals, NHIA practitioners)
- **Testing & Dev Tools** (not explicitly listed, but recommended for future expansion)

---

## Project Structure

- `/src/app/` — Next.js app routes (pages, layouts, API)
- `/src/components/` — UI components (cards, forms, chat, dashboard, etc.)
- `/src/services/` — Data fetching, scraping, and external API logic
- `/src/data/` — Healthcare centre and practitioner data
- `/src/lib/` — Types, constants, and utility functions
- `/public/` — Static assets, manifest, service worker
- `/docs/` — Project blueprint and design guidelines

---

## UI/UX & Design

- **Color Palette:**  
  - Compassionate blue (#5DADE2) for trust and calm
  - Light blue (#EBF4FA) for backgrounds
  - Vibrant green (#A3E4D7) for positive actions

- **Typography:**  
  - Clean, readable sans-serif fonts
  - Clear visual hierarchy and spacing

- **Accessibility:**  
  - High contrast, large touch targets, keyboard navigation
  - Simple icons and clear language

- **Navigation:**  
  - Sticky header with quick access to all main features
  - Emergency Info always accessible

---

## Major Challenges & Solutions

- **AI Integration:**  
  - Challenge: Integrating multiple AI models (Gemini, DeepSeek, OpenAI) for different flows.
  - Solution: Modular AI flows and clear separation of concerns.

- **Data Enrichment & Scraping:**  
  - Challenge: Enriching healthcare provider data with official websites and walk-in policies.
  - Solution: Custom Node.js scripts using Cheerio and DuckDuckGo scraping.

- **Type Safety & Data Modeling:**  
  - Challenge: Evolving data models (e.g., walk-in policy, emergency contacts) while maintaining type safety.
  - Solution: Careful TypeScript interface updates and migration.

- **UI Consistency & Modernization:**  
  - Challenge: Unifying the look and feel across chat, dashboard, and health tools.
  - Solution: Shared Card components, Tailwind theme, and Radix UI primitives.

- **Accessibility & Multilingual Support:**  
  - Challenge: Making the app usable for non-native speakers and low-literacy users.
  - Solution: Multilingual AI, simple icons, and clear, concise UI copy.

- **Performance & File Uploads:**  
  - Challenge: Handling large document uploads and Next.js server action limits.
  - Solution: Custom serverActions config and user feedback for errors.

- **Deprecation & Migration:**  
  - Challenge: Migrating from legacy Next.js Link API and removing deprecated props.
  - Solution: Automated codemods and manual code review.

- **Offline-First & Connectivity:**
  - Challenge: Ensuring the app works seamlessly with intermittent or no internet, including queuing actions and syncing data.
  - Solution: Service workers, localStorage, background sync, and robust error handling.

- **Complex State Management:**
  - Challenge: Managing user state, reminders, notifications, and offline queues across multiple contexts and flows.
  - Solution: Custom React hooks and context providers for modular, scalable state management.

- **Role-Based Access & Security:**
  - Challenge: Restricting access to clinical dashboards and sensitive features for authorized users only.
  - Solution: Role-based access control, authentication checks, and clear UI warnings.

- **Voice AI Integration:**
  - Challenge: Integrating ElevenLabs voice AI for mental health support, including toggling between chat and voice modes.
  - Solution: Modular component design and seamless UI toggling.

- **Health Data Privacy & Compliance:**
  - Challenge: Storing and managing sensitive health data securely, with user control over data download and deletion.
  - Solution: Secure Firestore storage, user-controlled profile download, and account deletion features.

- **Scalability of Directories:**
  - Challenge: Managing and searching large datasets of healthcare centres and practitioners efficiently.
  - Solution: Optimized data structures, search algorithms, and lazy loading where appropriate.

- **User Engagement & Gamification:**
  - Challenge: Encouraging ongoing user engagement with health goals, reminders, and achievements.
  - Solution: AI coach dashboard, achievements, badges, and progress tracking features.

---

## Transparency: Challenges, Solutions, and Research Process

Throughout the development of CareMatch AI, I encountered a variety of technical and process challenges, including bugs, errors, and missing dependencies. Here’s how I addressed them and how research shaped the app:

**Technical Challenges & Solutions:**
- I faced frequent bugs and breaking changes due to rapid updates in Next.js, React, and Firebase. Many times, dependencies were missing or incompatible, requiring careful troubleshooting and version management.

- Serialization errors (e.g., Firestore Timestamps) and server action limitations in Next.js required me to implement custom serialization and optimize data flows.

- When official libraries or APIs were unavailable or unreliable, I used creative alternatives—such as custom Node.js scripts with Cheerio and DuckDuckGo scraping for healthcare provider data enrichment.

- Automated codemods and manual code review were used to migrate deprecated APIs and ensure code quality.

- I prioritized offline-first design, using service workers, localStorage, and background sync to ensure resilience in low-connectivity environments.

- **Complex AI Model Orchestration:** Integrating and switching between multiple AI providers (Gemini, DeepSeek, OpenAI) for different flows required a modular, pluggable architecture and careful error handling for provider-specific issues.

- **Real-Time Data Sync:** Ensuring reminders, notifications, and health records stay in sync across devices and offline/online transitions required robust Firestore rules, background sync, and conflict resolution logic.

- **Voice & Multimodal Input:** Supporting both text and voice (ElevenLabs) for mental health required seamless toggling, state management, and accessibility considerations.

- **Large Data Handling:** Efficiently loading, searching, and displaying large healthcare provider datasets (centres, practitioners) required optimized queries, lazy loading, and UI virtualization.

- **Security & Privacy:** Implementing secure authentication, role-based access, and user-controlled data export/deletion to meet privacy requirements for sensitive health data.

- **Custom Analytics & Recommendations:** Building custom health analytics, trend detection, and AI-driven recommendations required domain-specific algorithms and integration with user data models.

- **Testing & Debugging in PWA Context:** Debugging service workers, offline sync, and PWA installability across browsers and devices presented unique challenges.

- **Cross-Platform UI Consistency:** Ensuring a consistent, accessible, and responsive UI across devices, browsers, and network conditions using Tailwind, Radix UI, and custom components.

**Process & Research:**

- I conducted extensive research into the realities of healthcare access in Africa, including literature reviews, interviews with local practitioners, and analysis of existing digital health solutions.

- I studied the needs of users in resource-constrained environments, focusing on offline usability, emergency readiness, and multilingual support.

- The feature set was shaped by real-world scenarios: e.g., the Emergency Info Card was inspired by stories of users needing instant access to allergies and contacts during emergencies.

- I iterated rapidly, learning from each bug, user test, and feedback session. Each challenge led to a more robust, user-centered solution.

- Transparency was maintained throughout: all major decisions, alternatives, and lessons learned are documented 

This open, adaptive approach allowed me to build a solution that is not only technically sound but also deeply relevant to the communities it aims to serve.

---

## Documentation of Design Alternatives and Final Decisions

Throughout the development of CareMatch AI, several design alternatives were considered for each major feature. Below are some key decisions and the rationale behind them:

- **AI Model Integration:**
  - *Alternatives Considered:* OpenAI only, Google AI only, or a modular approach.
  - *Final Decision:* Use a modular AI flow system (Genkit) to allow switching between Gemini, DeepSeek, and OpenAI models. This provides flexibility, cost control, and the ability to leverage the strengths of each model for different tasks.

- **Data Enrichment for Healthcare Providers:**
  - *Alternatives Considered:* Manual data entry, third-party APIs, or custom web scraping.
  - *Final Decision:* Use custom Node.js scripts with Cheerio and DuckDuckGo scraping to enrich provider data. This approach was chosen for its cost-effectiveness and ability to adapt to local data sources.

- **Emergency Info Card Placement:**
  - *Alternatives Considered:* Dedicated page, floating button, or integration into header/settings.
  - *Final Decision:* Place the Emergency Info Card in both the header (for quick access) and the settings page (for full editing). This ensures both visibility and editability without cluttering the main UI.

- **Swipeable Tips UI:**
  - *Alternatives Considered:* Carousel, modal, or dismissible list.
  - *Final Decision:* Implement a swipeable card carousel for quick, interactive access to health and mental health tips, both in the settings and emergency dialog.

- **User Profile Data Model:**
  - *Alternatives Considered:* Minimal fields vs. comprehensive health record.
  - *Final Decision:* Use a comprehensive, extensible TypeScript interface to support future features and analytics.

- **UI Library:**
  - *Alternatives Considered:* Material UI, Chakra UI, custom CSS, or Radix UI.
  - *Final Decision:* Use Radix UI for accessible, composable primitives, combined with Tailwind CSS for custom theming and rapid prototyping.

- **Navigation:**
  - *Alternatives Considered:* Sidebar, top nav, or sticky header.
  - *Final Decision:* Use a sticky header with dropdowns and quick-access buttons for a modern, mobile-friendly experience.

- **Health Record Storage:**
  - *Alternatives Considered:* Local storage only, centralized server, or cloud database (Firestore).
  - *Final Decision:* Use Firebase Firestore for secure, scalable, and real-time health record storage, with offline sync and user-controlled data export.

- **Reminders & Notifications:**
  - *Alternatives Considered:* Local device notifications, email/SMS, or in-app notification center.
  - *Final Decision:* Implement an in-app notification dashboard and reminders system, with offline support and Firestore integration for cross-device sync.

- **Voice AI for Mental Health:**
  - *Alternatives Considered:* Text-only chat, third-party voice bots, or custom voice AI integration.
  - *Final Decision:* Integrate ElevenLabs for high-quality, responsive voice AI, with seamless toggling between chat and voice modes.

- **Directory Search & Filtering:**
  - *Alternatives Considered:* Simple list, static filters, or advanced search with dynamic filtering.
  - *Final Decision:* Implement advanced search and filtering for healthcare centres and practitioners, supporting large datasets and user-specific needs.

- **Offline-First Architecture:**
  - *Alternatives Considered:* Online-only, partial offline, or full offline-first with background sync.
  - *Final Decision:* Build a full offline-first PWA with service workers, local caching, and background sync for resilience in low-connectivity environments.

---

## Tools Used and Rationale

- **AI/ML:**
  - *Genkit AI (Google AI, Gemini, DeepSeek, OpenAI):* Chosen for its modularity, support for multiple models, and easy integration with Next.js. Allows for rapid experimentation and best-in-class AI features.

- **Web Framework:**
  - *Next.js 15:* Modern React framework with App Router, Server Actions, and strong TypeScript support. Enables fast development, SSR, and API integration.

- **UI/UX:**
  - *Tailwind CSS:* Utility-first CSS for rapid, consistent styling.
  - *Radix UI:* Accessible, composable UI primitives.
  - *Lucide React:* Modern, open-source icon set.
  - *Framer Motion:* Smooth animations and transitions.

- **Data & State:**
  - *Firebase:* User authentication and profile storage. Chosen for its ease of use and real-time capabilities.
  - *React Context & Hooks:* For state management and sharing user/session data.

- **Web Scraping:**
  - *Node.js, Cheerio, node-fetch:* Used for custom scripts to enrich healthcare provider data. Chosen for flexibility and control over data sources.

- **Validation & Type Safety:**
  - *TypeScript, Zod:* Ensures robust, maintainable code and safe data handling.

- **Other:**
  - *ESLint, Prettier:* Code quality and formatting.
  - *PWA Support:* Manifest and service worker for installable, offline-capable app.

- **Why These Tools?**
  - Chosen for their modern developer experience, strong community support, accessibility, and ability to deliver a fast, reliable, and user-friendly healthcare app.

---

## How to Run

1. **Install dependencies:**  
   `npm install`

2. **Start the development server:**  
   `npm run dev`  

3. **Build for production:**  
   `npm run build && npm start`

4. **AI/Genkit flows:**  
   See `/src/ai/` for custom flows and integration.

---

## Contributing

- Fork the repo and create a feature branch.
- Follow the style guide in `/docs/blueprint.md`.
- Submit a pull request with a clear description of your changes.

---

## License

MIT License

---

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Genkit AI](https://github.com/genkit-dev/genkit)
- [Firebase](https://firebase.google.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [OpenAI, Google AI, DeepSeek](https://deepseek.com/)
- [Wikipedia, Suicide.org, Kinnected.org] (for emergency numbers and mental health resources)

---

**CareMatch AI — Your compassionate digital health companion.**  
