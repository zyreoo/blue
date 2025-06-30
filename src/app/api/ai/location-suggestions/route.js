import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import Location from '@/models/Location';

export async function POST(request) {
  try {
    console.log('🔍 [AI Location Suggestions] Starting request processing...');
    
    const { prompt } = await request.json();
    console.log('📝 [AI Location Suggestions] Received prompt:', prompt);

    if (!prompt) {
      console.log('⚠️ [AI Location Suggestions] No prompt provided');
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('🔌 [AI Location Suggestions] Database connected');

    // Fetch both locations and properties
    const [locations, properties] = await Promise.all([
      Location.find({})
        .populate({
          path: 'properties',
          match: { status: 'active' },
          select: 'name description propertyType amenities pricing.basePrice details'
        })
        .lean(),
      Property.find({ status: 'active' })
        .select('name description propertyType location amenities pricing.basePrice details')
        .lean()
    ]);

    console.log(`📊 [AI Location Suggestions] Found ${locations.length} locations and ${properties.length} active properties`);

    // Create a rich context with location and property information
    const locationContext = locations.map(location => {
      const activeProperties = location.properties.filter(p => p !== null);
      return {
        city: location.city,
        country: location.country,
        propertyCount: activeProperties.length,
        propertyTypes: [...new Set(activeProperties.map(p => p.propertyType))],
        averagePrice: activeProperties.length > 0 
          ? Math.round(activeProperties.reduce((acc, p) => acc + p.pricing.basePrice, 0) / activeProperties.length)
          : 0,
        totalCapacity: activeProperties.reduce((acc, p) => acc + p.details.maxGuests, 0),
        amenities: [...new Set(activeProperties.flatMap(p => p.amenities))],
      };
    }).filter(loc => loc.propertyCount > 0);

    const propertiesContext = properties.map(property => ({
      name: property.name,
      type: property.propertyType,
      city: property.location.city,
      description: property.description,
      amenities: property.amenities,
      price: property.pricing.basePrice,
      maxGuests: property.details.maxGuests,
      bedrooms: property.details.bedrooms,
      bathrooms: property.details.bathrooms
    }));

    console.log('🏠 [AI Location Suggestions] Context created');
    console.log('📍 [AI Location Suggestions] Available cities:', locationContext.map(l => l.city));
    console.log('🏷️ [AI Location Suggestions] Available property types:', [...new Set(properties.map(p => p.propertyType))]);
    console.log('✨ [AI Location Suggestions] Available amenities:', [...new Set(properties.flatMap(p => p.amenities))]);

    const systemPrompt = `You are a helpful travel assistant for a Romanian accommodation booking website. 
    You have access to our current locations and property listings in Romania.

    Here is the data about our available locations:
    ${JSON.stringify(locationContext, null, 2)}

    And here are the specific properties:
    ${JSON.stringify(propertiesContext, null, 2)}

    Given a user's description of their ideal destination and our available properties, suggest relevant locations in Romania.
    You should ONLY suggest locations where we have actual properties available.
    For each suggestion:
    1. Consider the location's overall characteristics (property types, amenities, prices)
    2. Mention specific properties that match their criteria
    3. Include relevant details about the area and available amenities
    
    IMPORTANT: You must respond with ONLY a valid JSON array. No additional text before or after.
    The response must be an array of objects with exactly these properties:
    {
      "location": "city name where we have properties",
      "description": "brief description mentioning specific properties and area characteristics",
      "type": "one of: mountain, seaside, urban, rural",
      "properties": ["array of property names that match"],
      "averagePrice": number,
      "amenities": ["array of common amenities in this location"]
    }
    
    Limit to 3-5 suggestions. Only include locations where we have actual properties that match the user's needs.`;

    console.log('🤖 [AI Location Suggestions] Sending request to AI service...');

    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      console.error('❌ [AI Location Suggestions] AI service error:', response.status, response.statusText);
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    console.log('✅ [AI Location Suggestions] Received response from AI service');
    
    const aiResponse = await response.json();
    console.log('📄 [AI Location Suggestions] Raw AI response:', aiResponse.choices[0].message.content);
    
    let suggestions = [];
    
    try {
      const responseText = aiResponse.choices[0].message.content.trim();
      console.log('🔍 [AI Location Suggestions] Attempting to parse response...');
      
      // Try to parse the entire response first
      try {
        suggestions = JSON.parse(responseText);
        console.log('✅ [AI Location Suggestions] Successfully parsed full response as JSON');
      } catch (e) {
        console.log('⚠️ [AI Location Suggestions] Failed to parse full response, attempting to extract JSON...');
        // If that fails, try to extract JSON from the response
        const jsonStart = responseText.indexOf('[');
        const jsonEnd = responseText.lastIndexOf(']') + 1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = responseText.substring(jsonStart, jsonEnd);
          suggestions = JSON.parse(jsonStr);
          console.log('✅ [AI Location Suggestions] Successfully extracted and parsed JSON from response');
        }
      }

      // Ensure suggestions is an array
      if (!Array.isArray(suggestions)) {
        console.log('⚠️ [AI Location Suggestions] Parsed result is not an array, resetting to empty array');
        suggestions = [];
      }

      console.log('🔍 [AI Location Suggestions] Pre-validation suggestions:', JSON.stringify(suggestions, null, 2));

      // Validate that suggested properties actually exist and locations are valid
      suggestions = suggestions.map(suggestion => ({
        location: suggestion.location || '',
        description: suggestion.description || '',
        type: suggestion.type || '',
        properties: (suggestion.properties || []).filter(propName => 
          properties.some(p => p.name === propName)
        ),
        averagePrice: suggestion.averagePrice || 0,
        amenities: (suggestion.amenities || []).filter(amenity =>
          locationContext.some(loc => loc.amenities.includes(amenity))
        )
      })).filter(suggestion => 
        suggestion.location && 
        suggestion.description && 
        suggestion.type && 
        suggestion.properties.length > 0 &&
        locationContext.some(loc => loc.city === suggestion.location)
      );

      console.log('✅ [AI Location Suggestions] Post-validation suggestions:', JSON.stringify(suggestions, null, 2));

    } catch (e) {
      console.error('❌ [AI Location Suggestions] Failed to parse AI response:', e);
      console.error('📄 [AI Location Suggestions] Raw response:', aiResponse.choices[0].message.content);
      suggestions = [];
    }

    console.log(`🏁 [AI Location Suggestions] Returning ${suggestions.length} suggestions`);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('❌ [AI Location Suggestions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 