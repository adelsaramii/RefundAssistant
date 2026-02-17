# Refund Assistant Frontend

A modern React application for managing and analyzing food delivery refund requests.

## Features

- 📊 **Dashboard**: View all refund cases with filtering and statistics
- 🔍 **Text Analyzer**: Extract features from complaint text using AI
- 💰 **Business Impact**: Calculate potential savings from refund optimization
- ⚙️ **Policy Management**: Configure refund decision rules and weights

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Heroicons** - Icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=https://refundassistant.onrender.com
```

For local backend development:
```
VITE_API_URL=http://localhost:8001
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `VITE_API_URL=https://refundassistant.onrender.com`
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/RefundAssistant/tree/main/frontend)

### Deploy to Netlify

1. Push code to GitHub
2. Import project in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://refundassistant.onrender.com`
6. Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Deploy to Render

1. Push code to GitHub
2. Create new Static Site in Render
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://refundassistant.onrender.com`
6. Deploy

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx      # Main cases dashboard
│   │   ├── CaseDetail.jsx     # Individual case view
│   │   ├── TextAnalyzer.jsx   # NLP text analysis tool
│   │   ├── Impact.jsx         # Business impact calculator
│   │   └── Policy.jsx         # Policy management
│   ├── api.js                 # API client
│   ├── App.jsx                # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── public/                    # Static assets
├── index.html                # HTML template
└── package.json              # Dependencies
```

## API Integration

The frontend connects to the Refund Assistant backend API:

- `GET /health` - Health check
- `GET /cases` - Get all cases
- `GET /cases/:id` - Get case by ID
- `POST /nlp/extract` - Extract text features
- `GET /impact` - Calculate business impact
- `GET /policy` - Get policy configuration
- `POST /policy/toggle` - Toggle policy rule
- `POST /policy/weight` - Update rule weight
- `POST /policy/preset` - Apply policy preset

## Development

```bash
# Run in development mode
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT
