#!/usr/bin/env node

/**
 * Test Discord Webhook
 * Script để test Discord webhook integration
 */

const https = require('https');
const url = require('url');

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  process.exit(1);
}

if (webhookUrl.includes('...')) {
  process.exit(1);
}

const testPayload = {
  embeds: [{
    title: '🛡️ Security Test Alert',
    description: 'This is a test message from VaoLuoiTV Security System',
    color: 0x36a64f, // Green color
    fields: [
      { name: 'System', value: 'VaoLuoiTV Chat Security', inline: true },
      { name: 'Test Type', value: 'Webhook Integration', inline: true },
      { name: 'Status', value: '✅ Working', inline: true }
    ],
    footer: { text: 'VaoLuoiTV Security Monitor' },
    timestamp: new Date().toISOString()
  }]
};

const postData = JSON.stringify(testPayload);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(webhookUrl, options, (res) => {
  if (res.statusCode === 204) {
    // Test successful
  } else {
    // Test failed
  }
  
  res.on('data', (chunk) => {
    // Handle response
  });
});

req.on('error', (error) => {
  // Handle error
});

req.write(postData);
req.end();
