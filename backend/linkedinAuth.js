import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

/**
 * LinkedIn OAuth Helper
 * Run this to get your LinkedIn access token
 */

const app = express();
const PORT = 3001;

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/auth/linkedin/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET must be set in .env');
  process.exit(1);
}

// Step 1: Authorization URL
app.get('/auth/linkedin', (req, res) => {
  const scope = 'r_liteprofile w_member_social';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(authUrl);
});

// Step 2: Handle callback
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`❌ Error: ${error}`);
  }
  
  if (!code) {
    return res.send('❌ No authorization code received');
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user profile to get Person URN
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const personUrn = `urn:li:person:${profileResponse.data.id}`;
    
    // Update .env file
    const envContent = `
# Add these to your .env file:
LINKEDIN_ACCESS_TOKEN=${accessToken}
LINKEDIN_PERSON_URN=${personUrn}
`;
    
    writeFileSync('.linkedin_credentials.txt', envContent);
    
    res.send(`
      <h1>✅ LinkedIn Authentication Successful!</h1>
      <p>Your credentials have been saved to <code>.linkedin_credentials.txt</code></p>
      <p>Copy these values to your <code>.env</code> file:</p>
      <pre>${envContent}</pre>
      <p><strong>Access Token:</strong> ${accessToken.slice(0, 20)}...</p>
      <p><strong>Person URN:</strong> ${personUrn}</p>
      <p><strong>⚠️ Keep these secret!</strong></p>
      <p>You can close this window now.</p>
    `);
    
    console.log('\n✅ LinkedIn authentication successful!');
    console.log('📝 Credentials saved to .linkedin_credentials.txt');
    console.log('\nAdd these to your .env file:');
    console.log(envContent);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.send(`❌ Error: ${error.response?.data?.message || error.message}`);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>LinkedIn OAuth Setup</h1>
    <p>Click below to authenticate with LinkedIn:</p>
    <a href="/auth/linkedin">
      <button style="padding: 12px 24px; background: #0077b5; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">
        🔗 Connect LinkedIn
      </button>
    </a>
    <p><small>Make sure you have set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your .env file</small></p>
  `);
});

app.listen(PORT, () => {
  console.log('\n🔐 LinkedIn OAuth Helper Running');
  console.log(`\n👉 Open: http://localhost:${PORT}`);
  console.log('\nClick "Connect LinkedIn" to get your access token\n');
});

