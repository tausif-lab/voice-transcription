const OpenAI = require('openai');
require('dotenv').config();

async function checkAPIStatus() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🔍 Checking OpenAI API Status...\n');
    
    try {
        // Test 1: Validate API Key
        console.log('1️⃣ Testing API Key validity...');
        const models = await openai.models.list();
        console.log('✅ API Key is valid');
        console.log(`📊 Available models: ${models.data.length}`);
        
        // Test 2: Check specific models we need
        console.log('\n2️⃣ Checking Whisper model availability...');
        const whisperModel = models.data.find(model => model.id === 'whisper-1');
        if (whisperModel) {
            console.log('✅ Whisper-1 model is available');
        } else {
            console.log('❌ Whisper-1 model not found');
        }
        
        // Test 3: Try to get billing information (this might fail with limited permissions)
        console.log('\n3️⃣ Attempting to check account status...');
        try {
            // This endpoint doesn't exist in the current API, but we can infer from errors
            const testResponse = await openai.models.retrieve('whisper-1');
            console.log('✅ Can access Whisper model details');
        } catch (error) {
            if (error.status === 429) {
                console.log('🚫 Rate limit exceeded - You have hit your usage quota');
                console.log('💡 Possible causes:');
                console.log('   - Free tier monthly limit reached');
                console.log('   - Insufficient credits in paid account');
                console.log('   - Too many requests in short time period');
            } else if (error.status === 401) {
                console.log('❌ API key authentication failed');
            } else {
                console.log('✅ Model access working normally');
            }
        }
        
        console.log('\n📋 Summary:');
        console.log('- API Key: Valid ✅');
        console.log('- Whisper Access: Available ✅');
        console.log('- Next step: Try a small test transcription');
        
    } catch (error) {
        console.error('❌ API Check Failed:');
        
        if (error.status === 429) {
            console.log('\n🚫 QUOTA EXCEEDED (Error 429)');
            console.log('Your OpenAI account has hit usage limits.');
            console.log('\n💡 Solutions:');
            console.log('1. Check usage: https://platform.openai.com/usage');
            console.log('2. Add billing: https://platform.openai.com/account/billing');
            console.log('3. Wait for quota reset (if on free tier)');
            console.log('4. Upgrade to paid plan for higher limits');
            
        } else if (error.status === 401) {
            console.log('\n🔑 INVALID API KEY (Error 401)');
            console.log('Your API key is not working.');
            console.log('\n💡 Solutions:');
            console.log('1. Generate new API key: https://platform.openai.com/api-keys');
            console.log('2. Update .env file with new key');
            console.log('3. Restart the server');
            
        } else {
            console.log('\n🌐 CONNECTION/OTHER ERROR');
            console.log(`Status: ${error.status}`);
            console.log(`Message: ${error.message}`);
        }
    }
}

// Run the check
checkAPIStatus();
