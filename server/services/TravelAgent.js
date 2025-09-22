const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlightsFinder = require('./FlightsFinder');
const HotelsFinder = require('./HotelsFinder');

class TravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.flightsFinder = new FlightsFinder();
    this.hotelsFinder = new HotelsFinder();
    
    this.systemPrompt = `You are a smart travel agency AI assistant. Your task is to help users find travel information including flights and hotels.

INSTRUCTIONS:
- You are allowed to make multiple searches (either together or in sequence)
- Only look up information when you are sure of what you want
- The current year is ${new Date().getFullYear()}
- Always include links to hotels websites and flights websites when possible
- Include logos of hotels and airline companies when available
- Always include prices in the local currency and USD when possible
- Format your response in clean HTML for better presentation

PRICING FORMAT EXAMPLE:
For hotels: Rate: $581 per night, Total: $3,488
For flights: Price: $850 USD

RESPONSE FORMAT:
- Use proper HTML structure with headings, lists, and styling
- Include images for airline logos and hotel photos
- Provide clickable links for booking
- Show clear pricing information
- Use Vietnamese language for user-facing content

Remember to be helpful, accurate, and provide comprehensive travel information.`;
  }

  async processQuery(query, threadId) {
    try {
      // First, analyze the query to extract travel details
      const analysisPrompt = `Analyze the following travel query and extract key information. Return ONLY a JSON object with the following structure:
{
  "origin": "origin city/airport code",
  "destination": "destination city/airport code",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "passengers": number,
  "hotelPreferences": "star rating or preferences",
  "rawQuery": "original query"
}

Travel query: ${query}`;

      const analysisResult = await this.model.generateContent(analysisPrompt);
      const analysisText = analysisResult.response.text();

      let travelDetails;
      try {
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          travelDetails = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (e) {
        // If JSON parsing fails, use default structure
        travelDetails = { rawQuery: query };
      }

      // Search for flights and hotels
      const [flightResults, hotelResults] = await Promise.all([
        this.searchFlights(travelDetails),
        this.searchHotels(travelDetails)
      ]);

      // Generate final response with Gemini
      const finalPrompt = `${this.systemPrompt}

Original user query: ${query}

Flight search results: ${JSON.stringify(flightResults, null, 2)}

Hotel search results: ${JSON.stringify(hotelResults, null, 2)}

Please create a comprehensive travel information response in HTML format. Include:
1. A summary of the user's request
2. Flight options with prices, airlines, and booking links
3. Hotel options with prices, ratings, and booking links
4. All information should be in Vietnamese
5. Use proper HTML structure with styling
6. Include images and links where available

Make it visually appealing and informative.`;

      const finalResult = await this.model.generateContent(finalPrompt);
      return finalResult.response.text();
    } catch (error) {
      console.error('Error in TravelAgent.processQuery:', error);
      throw new Error('Failed to process travel query');
    }
  }

  async searchFlights(travelDetails) {
    try {
      return await this.flightsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching flights:', error);
      return { error: 'Failed to search flights' };
    }
  }

  async searchHotels(travelDetails) {
    try {
      return await this.hotelsFinder.search(travelDetails);
    } catch (error) {
      console.error('Error searching hotels:', error);
      return { error: 'Failed to search hotels' };
    }
  }
}

module.exports = TravelAgent;