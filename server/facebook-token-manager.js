const axios = require('axios');
require('dotenv').config();

class FacebookTokenManager {
  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeForLongLivedToken(shortLivedToken) {
    try {
      const response = await axios.get(`${this.baseURL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortLivedToken
        }
      });

      console.log('✅ Long-lived User Token:', response.data.access_token);
      console.log('⏰ Expires in:', response.data.expires_in, 'seconds');
      
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Error exchanging token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get Page Access Token (never expires)
   */
  async getPageAccessToken(userAccessToken) {
    try {
      // First check if this is already a page token
      const appToken = `${this.appId}|${this.appSecret}`;
      const debugResponse = await axios.get(`${this.baseURL}/debug_token`, {
        params: {
          input_token: userAccessToken,
          access_token: appToken
        }
      });

      const tokenInfo = debugResponse.data.data;
      
      // If this is already a page token, just verify and return it
      if (tokenInfo.type === 'PAGE') {
        console.log('🎯 This is already a Page Access Token!');
        
        // Get page info
        const pageResponse = await axios.get(`${this.baseURL}/me`, {
          params: {
            access_token: userAccessToken,
            fields: 'id,name,category'
          }
        });

        const pageInfo = pageResponse.data;
        console.log('📄 Page Info:', pageInfo.name, `(ID: ${pageInfo.id})`);
        
        return {
          pageId: pageInfo.id,
          pageAccessToken: userAccessToken,
          pageName: pageInfo.name
        };
      }

      // If it's a user token, get pages
      const response = await axios.get(`${this.baseURL}/me/accounts`, {
        params: {
          access_token: userAccessToken
        }
      });

      console.log('📄 Available Pages:');
      response.data.data.forEach((page, index) => {
        console.log(`${index + 1}. ${page.name} (ID: ${page.id})`);
      });

      // Find Vivu page or return first page
      const vivuPage = response.data.data.find(page => 
        page.name.toLowerCase().includes('vivu')
      ) || response.data.data[0];

      if (vivuPage) {
        console.log('🎯 Selected Page:', vivuPage.name);
        console.log('🔑 Page Access Token:', vivuPage.access_token);
        console.log('🆔 Page ID:', vivuPage.id);
        
        // Verify token info
        await this.verifyToken(vivuPage.access_token);
        
        return {
          pageId: vivuPage.id,
          pageAccessToken: vivuPage.access_token,
          pageName: vivuPage.name
        };
      } else {
        throw new Error('No pages found');
      }
    } catch (error) {
      console.error('❌ Error getting page token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify token expiration info
   */
  async verifyToken(accessToken) {
    try {
      const appToken = `${this.appId}|${this.appSecret}`;
      const response = await axios.get(`${this.baseURL}/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: appToken
        }
      });

      const tokenInfo = response.data.data;
      console.log('🔍 Token Info:');
      console.log('  - Valid:', tokenInfo.is_valid);
      console.log('  - App ID:', tokenInfo.app_id);
      console.log('  - User ID:', tokenInfo.user_id);
      console.log('  - Expires:', tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toLocaleString() : 'Never');
      console.log('  - Scopes:', tokenInfo.scopes?.join(', '));

      return tokenInfo;
    } catch (error) {
      console.error('❌ Error verifying token:', error.response?.data || error.message);
    }
  }

  /**
   * Complete flow: Short-lived -> Long-lived -> Page Token
   */
  async getForeverToken(inputToken) {
    console.log('🚀 Starting token exchange process...\n');
    
    try {
      // First check what type of token this is
      console.log('🔍 Step 0: Check token type');
      const appToken = `${this.appId}|${this.appSecret}`;
      const debugResponse = await axios.get(`${this.baseURL}/debug_token`, {
        params: {
          input_token: inputToken,
          access_token: appToken
        }
      });

      const tokenInfo = debugResponse.data.data;
      console.log('Token type:', tokenInfo.type);
      console.log('Is valid:', tokenInfo.is_valid);
      
      let finalToken = inputToken;
      
      // If it's a short-lived user token, exchange it
      if (tokenInfo.type === 'USER' && tokenInfo.expires_at) {
        console.log('\n📝 Step 1: Exchange for long-lived user token');
        finalToken = await this.exchangeForLongLivedToken(inputToken);
      } else {
        console.log('\n📝 Step 1: Skipped - Token is already long-lived or page token');
      }
      
      console.log('\n📝 Step 2: Get/verify page access token');
      const pageInfo = await this.getPageAccessToken(finalToken);
      
      console.log('\n🎉 SUCCESS! Copy these to your .env file:');
      console.log('==========================================');
      console.log(`FACEBOOK_PAGE_ID=${pageInfo.pageId}`);
      console.log(`FACEBOOK_PAGE_ACCESS_TOKEN=${pageInfo.pageAccessToken}`);
      console.log('==========================================\n');
      
      return pageInfo;
    } catch (error) {
      console.error('💥 Process failed:', error.message);
    }
  }
}

// Usage example
async function main() {
  const tokenManager = new FacebookTokenManager();
  
  // Replace with your short-lived token from Graph API Explorer
  const shortLivedToken = process.argv[2] || 'PASTE_YOUR_SHORT_LIVED_TOKEN_HERE';
  
  if (shortLivedToken === 'PASTE_YOUR_SHORT_LIVED_TOKEN_HERE') {
    console.log('📖 USAGE:');
    console.log('  node facebook-token-manager.js YOUR_SHORT_LIVED_TOKEN');
    console.log('');
    console.log('⚠️  Get your short-lived token from:');
    console.log('🔗 https://developers.facebook.com/tools/explorer/');
    console.log('📋 Required permissions:');
    console.log('   - manage_pages');
    console.log('   - pages_show_list'); 
    console.log('   - pages_read_engagement');
    console.log('');
    console.log('🎯 Example:');
    console.log('  node facebook-token-manager.js EAAJJ25tGL3IBO...');
    return;
  }
  
  await tokenManager.getForeverToken(shortLivedToken);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FacebookTokenManager;