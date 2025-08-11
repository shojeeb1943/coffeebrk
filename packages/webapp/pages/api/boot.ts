import type { NextApiRequest, NextApiResponse } from 'next';

// Mock boot data for standalone deployment
const mockBootData = {
  user: null,
  visit: {
    visitId: 'mock-visit-id',
    sessionId: 'mock-session-id',
  },
  settings: {
    theme: 'dark',
    spaciness: 'roomy',
    insaneMode: false,
    showTopSites: true,
    sidebarExpanded: true,
    companionExpanded: false,
    sortingEnabled: false,
    optOutWeeklyGoal: false,
    optOutCompanion: false,
    autoDismissNotifications: true,
  },
  flags: {
    showRoadmap: false,
    showBanner: false,
  },
  alerts: {},
  notifications: {
    unreadNotificationsCount: 0,
  },
  squads: [],
  feeds: [
    {
      id: 'popular',
      name: 'Popular',
      slug: 'popular',
    },
    {
      id: 'recent',
      name: 'Recent',
      slug: 'recent',
    },
  ],
  exp: {
    f: '',
    features: {},
  },
  geo: {
    country: 'US',
    region: 'US',
  },
  postData: null,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return mock boot data
  res.status(200).json(mockBootData);
}
