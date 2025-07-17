# YouTube Feed Application

A modern React application that displays your YouTube subscriptions in a beautiful, customizable feed. Built with React, TypeScript, and Rsbuild. **No API key required!**

## Features

- 📺 Display latest videos from your subscribed YouTube channels
- 🎬 Built-in video player with full YouTube integration
- 🌓 Dark/Light mode support
- ✨ Beautiful animations with Framer Motion
- 📱 Fully responsive design
- ⚡ Real-time scraping (no API quotas!)
- 🚀 Fast performance with caching

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Rsbuild** - Build tool
- **React Router** - Navigation
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Express + Cheerio** - Backend scraping server

## Prerequisites

- Node.js 16+ installed

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd yt-feed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the scraping backend server**
   ```bash
   # In a new terminal
   node server.js
   ```
   Keep this running while using the app.

4. **Start the development server**
   ```bash
   # In another terminal
   npm run dev
   ```

5. **Open the application**
   - Navigate to `http://localhost:3000` in your browser

## How It Works

1. The app reads your subscribed channels from `channels.json` or from your uploaded JSON
2. A backend server scrapes YouTube RSS feeds to get the latest videos
3. Videos are displayed in a responsive grid layout
4. Clicking on a video opens the player page with full details
5. All data is cached for optimal performance

## Project Structure

```
yt-feed/
├── src/
│   ├── components/      # React components
│   │   ├── feed/       # Video feed components
│   │   ├── layout/     # Layout components
│   │   ├── player/     # Video player components
│   │   └── ui/         # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── lib/            # Library configurations
├── public/             # Static assets
│   └── channels.json   # Default YouTube subscriptions
├── server.js           # Backend scraping server
└── package.json        # Dependencies
```

## Customization

### Adding/Removing Channels

1. **Via Upload Page** (Recommended)
   - Go to `/generate-feed`
   - Upload or paste your channels JSON
   - The app will save it locally

2. **Edit channels.json**
   - Edit the `public/channels.json` file directly
   - Format:
   ```json
   {
     "channels": [
       {
         "channelId": "UC...",
         "name": "Channel Name",
         "url": "https://www.youtube.com/@channelhandle"
       }
     ]
   }
   ```

### Styling

The app uses Tailwind CSS with a custom theme. You can modify:
- `src/App.css` - Global styles and CSS variables
- `tailwind.config.js` - Tailwind configuration
- Component files - Individual component styles

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `node server.js` - Start the scraping backend

## Troubleshooting

### No videos showing up
- Make sure the backend server is running (`node server.js`)
- Check that channel IDs are correct
- Check browser console for error messages

### Backend server errors
- Make sure port 3001 is available
- Check that all dependencies are installed

### Videos not updating
- YouTube RSS feeds may have a slight delay
- Try refreshing the page

## Why Scraping Instead of API?

YouTube's API has very restrictive quotas:
- Only 10,000 units per day
- Each search request costs 100 units
- Fetching from 181 channels would exceed the limit quickly

Our scraping approach:
- No API quotas
- Real-time data
- Uses YouTube's public RSS feeds
- No authentication required

## License

MIT
