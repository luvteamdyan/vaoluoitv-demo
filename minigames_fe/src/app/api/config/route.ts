import { NextResponse } from 'next/server';

/**
 * Dynamic Config API Route
 * Serves config.js with environment variables injected
 */
export async function GET() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://games-api.vaoluoitv.com';
  
  const configScript = `
/**
 * Global configuration for minigames
 * Generated dynamically with environment variables
 */
(function() {
  // Set API Base URL from environment variable
  const apiBaseUrl = '${apiBaseUrl}';
  
  // Expose global config
  window.MINIGAMES_CONFIG = {
    API_BASE_URL: apiBaseUrl
  };
  
  console.log('[MINIGAMES_CONFIG] API Base URL:', apiBaseUrl);
})();
`;

  return new NextResponse(configScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

