#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: './apps/quizzing/.env.local' });

// Simple test of web search functionality
const { createJobAnalysisAgent } = require('./packages/ai/dist/index.js');

async function testWebSearch() {
  console.log('🔍 Testing Web Search Functionality\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found');
    process.exit(1);
  }

  console.log('✅ OpenAI API Key loaded');

  try {
    console.log('📋 Testing Job Analysis with simple search term...');
    const jobAnalyzer = createJobAnalysisAgent();
    
    // Test with a very simple, well-known search term
    console.log('Searching for: "Google Software Engineer"');
    const result = await jobAnalyzer.analyzeJobPostingFast('Google Software Engineer');
    
    console.log('\n📊 Raw Results:');
    console.log('Company:', result.company);
    console.log('Job Title:', result.jobTitle);
    console.log('Skills Count:', result.skills?.length || 0);
    console.log('Skills Sample:', result.skills?.slice(0, 3) || []);
    console.log('Location:', result.location);
    console.log('Level:', result.experienceLevel);
    console.log('Description Length:', result.description?.length || 0);

    if (result.company === 'Unknown Company') {
      console.log('\n⚠️ Web search may not be working - got fallback data');
      console.log('This suggests the OpenAI agents web search tool needs debugging');
    } else {
      console.log('\n✅ Web search is working properly!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWebSearch();
