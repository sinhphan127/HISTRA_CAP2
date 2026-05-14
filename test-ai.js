import aiService from './src/services/aiService.js';

async function test() {
  try {
    console.log('Testing generateItinerary...');
    const result = await aiService.generateItinerary({
      city: 'Ha Noi',
      days: 2,
      travelers: 2,
      destinations: [
        { name: 'Hoan Kiem', category: 'Tham quan', ticketPrice: 0, duration: '2 gio' },
        { name: 'Van Mieu', category: 'Tham quan', ticketPrice: 30000, duration: '1 gio' },
        { name: 'Pho co', category: 'Tham quan', ticketPrice: 0, duration: '2 gio' },
        { name: 'Lang Bac', category: 'Tham quan', ticketPrice: 0, duration: '2 gio' }
      ],
      interests: ['Tham quan'],
      budget: 1000000
    });
    console.log('Success:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error generating itinerary:', err);
  }
}

test();
