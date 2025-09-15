# J'achète en Algérie - Chatbot UI

Modern ChatGPT-like chatbot built with Next.js (App Router), TailwindCSS, and Framer Motion. Connects to a Gradio endpoint to fetch replies.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Production

```bash
npm run build && npm start
```

Deploy on Vercel. The app can be embedded in WordPress using an iframe:

```html
<iframe src="https://your-vercel-deployment-url.vercel.app" style="width:100%;height:800px;border:none"></iframe>
```

## Config
- Gradio space: `DmbOran/Assistant_Immo`
- Endpoint: `/predict`

Brand colors used:
- Orange: #FF6F00
- Dark teal: #004D40

## Notes
- Smooth scroll and typing indicator included.
- Messages are aligned: user (right, teal), assistant (left, light orange).


