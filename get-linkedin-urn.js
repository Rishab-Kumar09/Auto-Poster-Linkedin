import axios from 'axios';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const token = process.env.LINKEDIN_ACCESS_TOKEN;

if (!token) {
  console.error('\n❌ Error: LINKEDIN_ACCESS_TOKEN not found in .env file\n');
  console.log('Make sure you have added:');
  console.log('LINKEDIN_ACCESS_TOKEN=your_token_here\n');
  process.exit(1);
}

console.log('\n🔍 Getting your LinkedIn Person URN...\n');

axios.get('https://api.linkedin.com/v2/userinfo', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(response => {
  const sub = response.data.sub;
  const personUrn = `urn:li:person:${sub}`;
  
  console.log('✅ Success!\n');
  console.log('Your LinkedIn Info:');
  console.log('  Name:', response.data.name || 'N/A');
  console.log('  Email:', response.data.email || 'N/A');
  console.log('  Sub ID:', sub);
  console.log('\n📝 Add this to your .env file:\n');
  console.log(`LINKEDIN_PERSON_URN=${personUrn}`);
  console.log('\n✅ Copy the line above and paste it into your .env file!\n');
})
.catch(error => {
  console.error('\n❌ Error getting LinkedIn info:\n');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Message:', error.response.data?.message || error.response.statusText);
    
    if (error.response.status === 401) {
      console.log('\n💡 Your access token might be invalid or expired.');
      console.log('Try regenerating it at:');
      console.log('https://www.linkedin.com/developers/tools/oauth/token-generator\n');
    }
  } else {
    console.error(error.message);
  }
  process.exit(1);
});

