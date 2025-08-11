import type { NextApiRequest, NextApiResponse } from 'next';

// Mock GraphQL responses for standalone deployment
const mockResponses = {
  // Mock feed query
  FEED_QUERY: {
    data: {
      page: {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: [],
      },
    },
  },
  // Mock user query
  USER_QUERY: {
    data: {
      user: null,
    },
  },
  // Default empty response
  DEFAULT: {
    data: {},
  },
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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { query, operationName } = req.body;

  // Determine which mock response to return based on the query
  let response = mockResponses.DEFAULT;

  if (query?.includes('feed') || operationName?.includes('Feed')) {
    response = mockResponses.FEED_QUERY;
  } else if (query?.includes('user') || operationName?.includes('User')) {
    response = mockResponses.USER_QUERY;
  }

  res.status(200).json(response);
}
