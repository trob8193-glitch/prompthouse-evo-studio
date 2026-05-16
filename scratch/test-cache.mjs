import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';

import { LocalCache } from '../lib/ai/LocalCache.js';

async function test() {
  const cache = new LocalCache();
  const messages = [{ role: 'user', content: 'Hello, this is a test for the local cache.' }];
  const options = {};
  
  console.log('--- Testing Cache Directly ---');
  
  // Clear any existing cache for this test
  const hash = cache.getHash(messages, options);
  console.log('Test Hash:', hash);
  
  const mockResponse = { success: true, content: 'Mocked AI Response', provider: 'mock' };
  
  console.log('Saving mock response to cache...');
  cache.set(messages, options, mockResponse);
  
  console.log('Retrieving from cache...');
  const retrieved = cache.get(messages, options);
  
  console.log('Retrieved:', retrieved);
  
  if (retrieved && retrieved.content === 'Mocked AI Response') {
    console.log('\n✅ LocalCache worked perfectly!');
  } else {
    console.log('\n❌ LocalCache failed.');
  }
}

test().catch(console.error);

test().catch(console.error);
