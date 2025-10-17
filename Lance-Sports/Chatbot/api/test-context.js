// Simple test script to demonstrate conversation context
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/football-chat';
const SESSION_ID = 'test-session-123';

async function testConversation() {
  console.log('🧪 Testing Chatbot Conversation Context\n');
  
  try {
    // First message
    console.log('1️⃣ User: "Who is Mbappe?"');
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Who is Mbappe?',
        sessionId: SESSION_ID
      })
    });
    const data1 = await response1.json();
    console.log(`🤖 Bot: "${data1.reply}"\n`);

    // Second message - should maintain context
    console.log('2️⃣ User: "Which team does he play for?"');
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Which team does he play for?',
        sessionId: SESSION_ID
      })
    });
    const data2 = await response2.json();
    console.log(`🤖 Bot: "${data2.reply}"\n`);

    // Third message - should still maintain context
    console.log('3️⃣ User: "What position does he play?"');
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What position does he play?',
        sessionId: SESSION_ID
      })
    });
    const data3 = await response3.json();
    console.log(`🤖 Bot: "${data3.reply}"\n`);

    console.log('✅ Conversation context test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the API server is running on port 3001');
  }
}

// Run the test
testConversation();
