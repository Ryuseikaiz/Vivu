const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10));
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different model names
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello, can you say hi back?');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}`);
        console.log('Response:', text.substring(0, 100) + '...');
        break; // Stop on first success
        
      } catch (error) {
        console.log(`❌ FAILED with ${modelName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testGemini();