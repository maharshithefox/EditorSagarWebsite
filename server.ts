import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to parse cookies manually (iframe friendly)
function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const parts = c.split('=');
      return [parts[0].trim(), parts.slice(1).join('=').trim()];
    })
  );
}

// Redirect URI Helper
function getRedirectUri(req: express.Request): string {
  // Prefer process.env.APP_URL, but fallback to host header
  const base = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/$/, '')}/auth/callback`;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Get GitHub OAuth Authorization URL
app.get('/api/auth/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({
      error: 'GitHub Client ID not configured. Please add GITHUB_CLIENT_ID to your secrets.',
    });
  }

  const redirectUri = getRedirectUri(req);
  const state = Math.random().toString(36).substring(7);

  // Scopes requested: read:user (profile metadata), gist (to save briefs as Gists)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user gist',
    state,
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url: authUrl });
});

// 2. OAuth Callback handler (from GitHub)
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.send(`
      <html>
        <body style="background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #ef4444; padding: 2rem; border-radius: 12px; background: #18181b;">
            <h2 style="color: #ef4444; margin-top: 0;">Authentication Failed</h2>
            <p>Authorization code was not provided by GitHub.</p>
            <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.send(`
      <html>
        <body style="background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #ef4444; padding: 2rem; border-radius: 12px; background: #18181b; max-width: 400px;">
            <h2 style="color: #ef4444; margin-top: 0;">Credentials Missing</h2>
            <p>Please make sure both <strong>GITHUB_CLIENT_ID</strong> and <strong>GITHUB_CLIENT_SECRET</strong> are set in your secrets panel.</p>
            <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const redirectUri = getRedirectUri(req);

    // Exchange code for Access Token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json() as any;

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Set cookie. Must use secure, samesite=none, httponly for iframe environment
    res.setHeader(
      'Set-Cookie',
      `github_token=${accessToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; Secure; SameSite=None`
    );

    res.send(`
      <html>
        <body style="background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 2rem; border-radius: 12px; background: #18181b;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚡</div>
            <h2 style="color: #22d3ee; margin-top: 0;">Connected Successfully!</h2>
            <p style="color: #a1a1aa; margin-bottom: 1.5rem;">Your GitHub account is now linked with Editor Sagar Portfolio.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
            <p style="font-size: 11px; color: #71717a;">This window will close automatically...</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error exchanging GitHub token:', error);
    res.send(`
      <html>
        <body style="background: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid #ef4444; padding: 2rem; border-radius: 12px; background: #18181b; max-width: 400px;">
            <h2 style="color: #ef4444; margin-top: 0;">Token Exchange Failed</h2>
            <p style="color: #a1a1aa; font-size: 13px;">${error.message || 'An error occurred during authentication'}</p>
            <button onclick="window.close()" style="background: #27272a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// 3. Get Authenticated GitHub User details
app.get('/api/github/user', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.github_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated with GitHub' });
  }

  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'editor-sagar-portfolio',
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub responded with ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    res.json({
      id: userData.id,
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      htmlUrl: userData.html_url,
      publicGists: userData.public_gists,
    });
  } catch (error: any) {
    console.error('Error fetching GitHub user:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

// 4. Logout / Clear session
app.post('/api/github/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    'github_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None'
  );
  res.json({ success: true });
});

// 5. Save planned project brief to GitHub Gist (Real API call!)
app.post('/api/github/save-brief', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.github_token;

  if (!token) {
    return res.status(401).json({ error: 'Please connect to GitHub to save project briefs.' });
  }

  const { brief } = req.body;
  if (!brief) {
    return res.status(400).json({ error: 'Brief content is required.' });
  }

  try {
    const filename = `fcp-project-${brief.category.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const gistBody = {
      description: `Editor Sagar - Custom FCP Project Brief: ${brief.clientName}`,
      public: false, // Create as a private gist by default
      files: {
        [filename]: {
          content: JSON.stringify(brief, null, 2),
        },
        'README.md': {
          content: `# Cinematic Project Brief for ${brief.clientName}\n\nGenerated via **Editor Sagar's Final Cut Pro X Masterclass Portfolio** on ${new Date().toLocaleDateString()}.\n\n### Specifications:\n- **Client:** ${brief.clientName}\n- **Genre:** ${brief.category}\n- **Estimated Editing Hours:** ~${brief.editHours} hours\n- **Shoot Days:** ${brief.durationDays} Day(s)\n- **Raw Footage Volume:** ${brief.rawDataSize} GB\n- **Workspace Buffer Space Needed:** ~${(brief.rawDataSize * 2.2).toFixed(0)} GB\n- **Recommended Timeline:** ${brief.timeline}\n- **Estimated Price:** ₹${brief.estimatedPrice.toLocaleString('en-IN')}\n\n*This project brief was successfully synced and stored directly inside your GitHub Gists.*`,
        },
      },
    };

    const gistResponse = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'editor-sagar-portfolio',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(gistBody),
    });

    if (!gistResponse.ok) {
      const errBody = await gistResponse.text();
      throw new Error(`GitHub Gist API responded with status ${gistResponse.status}: ${errBody}`);
    }

    const gistData = await gistResponse.json() as any;
    res.json({
      success: true,
      htmlUrl: gistData.html_url,
    });
  } catch (error: any) {
    console.error('Error creating Gist:', error);
    res.status(500).json({ error: error.message || 'Failed to save project brief to GitHub.' });
  }
});

// ----------------------------------------------------
// VITE AND STATIC ASSETS SERVING MIDDLEWARE
// ----------------------------------------------------

async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic();
