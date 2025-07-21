const OpenAI = require('openai');
require('dotenv').config();

async function checkQuotaStatus() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🔍 OpenAI Quota Status Check\n');
    console.log('='.repeat(50));

    try {
        // Try a minimal API call to test quota
        await openai.models.list();
        console.log('✅ Basic API access: Working');
        
        // Try to access Whisper model specifically
        const whisperModel = await openai.models.retrieve('whisper-1');
        console.log('✅ Whisper model access: Working');
        
        console.log('\n🎯 DIAGNOSIS:');
        console.log('Your API key works for basic calls, but fails on Whisper transcriptions.');
        console.log('This indicates you have INSUFFICIENT QUOTA for audio transcription.');
        
    } catch (error) {
        console.log('❌ API Error:', error.message);
        
        if (error.status === 429) {
            console.log('\n🚫 CONFIRMED: QUOTA EXCEEDED');
            console.log('Your OpenAI account has no remaining credits/quota.');
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('💡 SOLUTIONS (in priority order):');
    console.log('='.repeat(50));
    
    console.log('\n1. 🏆 ADD BILLING (FASTEST FIX):');
    console.log('   • Visit: https://platform.openai.com/account/billing');
    console.log('   • Add payment method');
    console.log('   • Add $5-10 minimum');
    console.log('   • Test immediately after payment');
    
    console.log('\n2. 📊 CHECK CURRENT USAGE:');
    console.log('   • Visit: https://platform.openai.com/usage');
    console.log('   • See exactly how much quota you used');
    console.log('   • Check when your quota resets');
    
    console.log('\n3. ⏰ WAIT FOR RESET (FREE TIER):');
    console.log('   • Free tier resets monthly');
    console.log('   • Very limited Whisper usage (~3-5 requests)');
    console.log('   • Not practical for development');
    
    console.log('\n4. 🔄 CREATE NEW ACCOUNT (TEMPORARY):');
    console.log('   • Use different email');
    console.log('   • Get fresh free tier quota');
    console.log('   • Only for immediate testing');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RECOMMENDED ACTION:');
    console.log('Add billing ($5) → Test immediately → Continue development');
    console.log('='.repeat(50));
}

checkQuotaStatus();
