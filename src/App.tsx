import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import FeedPage from "@/pages/FeedPage";
import VideoPage from "@/pages/VideoPage";
import GenerateFeedPage from "@/pages/GenerateFeedPage";
import FavoriteChannelsPage from "@/pages/FavoriteChannelsPage";
import AllChannelsPage from "@/pages/AllChannelsPage";
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="video/:videoId" element={<VideoPage />} />
            <Route path="generate-feed" element={<GenerateFeedPage />} />
            <Route path="select-favorites" element={<FavoriteChannelsPage />} />
            <Route path="all-channels" element={<AllChannelsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
