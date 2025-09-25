const { GoogleGenerativeAI } = require('@google/generative-ai');
const FlightsFinder = require('./FlightsFinder');
const HotelsFinder = require('./HotelsFinder');

class TravelAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    this.flightsFinder = new FlightsFinder();
    this.hotelsFinder = new HotelsFinder();
    
    this.systemPrompt = `You are a smart travel agency AI assistant. Your task is to help users find travel information including flights, hotels, and local restaurants/eateries.

INSTRUCTIONS:
- You are allowed to make multiple searches (either together or in sequence)
- If the user asks for suggestions nearby, you can ask for their current location to provide better recommendations.
- Based on the user's current location or their travel destination, suggest popular restaurants and eateries.
- Only look up information when you are sure of what you want
- The current year is ${new Date().getFullYear()}
- Always include links to hotels websites, flights websites, and restaurant websites/menus when possible.
- Include logos of hotels, airline companies, and photos of restaurants/food when available.
- Always include prices in the local currency and USD when possible
- Format your response in clean HTML for better presentation

PRICING FORMAT EXAMPLE:
For hotels: Rate: $581 per night, Total: $3,488
For flights: Price: $850 USD
For restaurants: Price range: $10 - $50

RESPONSE FORMAT:
- Use proper HTML structure with headings, lists, and styling
- Include images for airline logos, hotel photos, and restaurant/food photos
- Provide clickable links for booking or viewing menus
- Show clear pricing information
- Use Vietnamese language for user-facing content

Remember to be helpful, accurate, and provide comprehensive travel and dining information.`;
  }

  buildTravelDetailsFromMetadata(metadata = {}) {
    const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '');
    const details = {};

    const origin = sanitizeString(metadata.origin);
    if (origin) {
      details.origin = origin;
    }

    const destination = sanitizeString(metadata.destination);
    if (destination) {
      details.destination = destination;
    }

    const startDate = sanitizeString(metadata.startDate);
    if (startDate) {
      details.departureDate = startDate;
    }

    const endDate = sanitizeString(metadata.endDate);
    if (endDate) {
      details.returnDate = endDate;
    }

    const passengers = Number(metadata.travelers);
    if (Number.isFinite(passengers) && passengers > 0) {
      details.passengers = passengers;
    }

    const preferences = {};
    const travelStyle = sanitizeString(metadata.travelStyle);
    if (travelStyle) {
      preferences.travelStyle = travelStyle;
    }

    const budgetLevel = sanitizeString(metadata.budgetLevel);
    if (budgetLevel) {
      preferences.budgetLevel = budgetLevel;
    }

    const pace = sanitizeString(metadata.pace);
    if (pace) {
      preferences.pace = pace;
    }

    const transportMode = sanitizeString(metadata.transportMode);
    if (transportMode) {
      preferences.transportMode = transportMode;
    }

    if (Array.isArray(metadata.interests) && metadata.interests.length > 0) {
      preferences.interests = metadata.interests;
    }

    const notes = sanitizeString(metadata.notes);
    if (notes) {
      preferences.notes = notes;
    }

    if (Object.keys(preferences).length > 0) {
      details.preferences = preferences;
    }

    return details;
  }

  mergeTravelDetails(analysisDetails = {}, metadataDetails = {}, query) {
    const merged = {
      ...analysisDetails,
      ...metadataDetails,
      rawQuery: query
    };

    if (analysisDetails.preferences || metadataDetails.preferences) {
      merged.preferences = {
        ...(analysisDetails.preferences || {}),
        ...(metadataDetails.preferences || {})
      };
    }

    return merged;
  }

  async processQuery(query, threadId, metadata = {}) {
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
        travelDetails = {};
      }

      const metadataDetails = this.buildTravelDetailsFromMetadata(metadata);
      const mergedTravelDetails = this.mergeTravelDetails(travelDetails, metadataDetails, query);

      // Search for flights and hotels
      const [flightResults, hotelResults] = await Promise.all([
        this.searchFlights(mergedTravelDetails),
        this.searchHotels(mergedTravelDetails)
      ]);

      // Generate final response with Gemini
      const finalPrompt = `${this.systemPrompt}

Original user query: ${query}

Structured travel details (combined from client metadata and AI analysis): ${JSON.stringify(mergedTravelDetails, null, 2)}

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