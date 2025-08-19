#!/usr/bin/env node

/**
 * Final Mobile API Validation Test for Attaqwa Masjid
 * Comprehensive validation of mobile app production readiness
 */

const fs = require('fs');

// Test configuration
const API_BASE_URL = 'http://localhost:3001/api';
const MOBILE_USER_AGENTS = {
  ios: 'AttaqwaMasjid-Mobile/1.0 (iOS 16.0; iPhone14,2)',
  android: 'AttaqwaMasjid-Mobile/1.0 (Android 13; SM-G998B)',
  web: 'AttaqwaMasjid-Mobile/1.0 (Web; Chrome/120.0)'
};

const testResults = {
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  tests: [],
  platforms: {},
  performance: {},
  islamic: {},
  recommendations: []
};

function addResult(name, status, message, platform = 'general', data = null) {
  testResults.summary.total++;
  testResults.summary[status]++;
  
  const result = {
    name, status, message, platform, data,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (!testResults.platforms[platform]) {
    testResults.platforms[platform] = { passed: 0, failed: 0, warnings: 0 };
  }
  testResults.platforms[platform][status]++;
  
  console.log(`${status.toUpperCase()} [${platform}]: ${name} - ${message}`);
}

async function measureTime(asyncFn) {
  const start = Date.now();
  const result = await asyncFn();
  const duration = Date.now() - start;
  return { result, duration };
}

// Test 1: Mobile Platform Compatibility
async function testPlatformCompatibility() {
  console.log('\n🔧 Testing Platform Compatibility');
  
  for (const [platform, userAgent] of Object.entries(MOBILE_USER_AGENTS)) {
    try {
      const { result: response, duration } = await measureTime(async () => {
        const res = await fetch(`${API_BASE_URL}/prayer-times`, {
          headers: {
            'User-Agent': userAgent,
            'X-Islamic-App': 'AttaqwaMasjid',
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      });

      // Validate mobile-optimized response
      if (response._mobile && response._mobile.optimized) {
        addResult(
          'Mobile Optimization', 'passed',
          `Platform optimized (${duration}ms)`, platform,
          { responseTime: duration, optimized: true }
        );
      } else {
        addResult(
          'Mobile Optimization', 'warnings',
          `Response not optimized for mobile`, platform
        );
      }

      // Validate Islamic content
      if (response.data.hijriDate && response.data.prayers) {
        addResult(
          'Islamic Content', 'passed',
          'Hijri date and prayers array present', platform
        );
      } else {
        addResult(
          'Islamic Content', 'failed',
          'Missing Islamic content fields', platform
        );
      }

      // Performance check
      if (duration < 1000) {
        addResult(
          'Performance', 'passed',
          `Fast response (${duration}ms)`, platform,
          { responseTime: duration }
        );
      } else {
        addResult(
          'Performance', 'warnings',
          `Slow response (${duration}ms)`, platform,
          { responseTime: duration }
        );
      }

    } catch (error) {
      addResult(
        'Platform Connection', 'failed',
        `Failed to connect: ${error.message}`, platform
      );
    }
  }
}

// Test 2: Islamic Feature Validation
async function testIslamicFeatures() {
  console.log('\n🕌 Testing Islamic Features');
  
  try {
    const response = await fetch(`${API_BASE_URL}/prayer-times`, {
      headers: {
        'User-Agent': MOBILE_USER_AGENTS.ios,
        'X-Islamic-App': 'AttaqwaMasjid'
      }
    });
    
    const data = await response.json();
    const prayerData = data.data;

    // Test prayer times format
    const prayerTimes = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    let validPrayerTimes = 0;
    prayerTimes.forEach(prayer => {
      if (prayerData[prayer] && timeFormat.test(prayerData[prayer])) {
        validPrayerTimes++;
      }
    });

    if (validPrayerTimes === 5) {
      addResult('Prayer Times Format', 'passed', 'All prayer times properly formatted');
      testResults.islamic.prayerTimesValid = true;
    } else {
      addResult('Prayer Times Format', 'failed', `Only ${validPrayerTimes}/5 prayer times valid`);
      testResults.islamic.prayerTimesValid = false;
    }

    // Test Hijri date
    if (prayerData.hijriDate && prayerData.hijriDate.includes('AH')) {
      addResult('Hijri Date', 'passed', 'Islamic calendar date present');
      testResults.islamic.hijriDateValid = true;
    } else {
      addResult('Hijri Date', 'failed', 'Hijri date missing or invalid');
      testResults.islamic.hijriDateValid = false;
    }

    // Test Qibla direction
    if (typeof prayerData.qibla === 'number' && prayerData.qibla >= 0 && prayerData.qibla <= 360) {
      addResult('Qibla Direction', 'passed', `Qibla direction: ${prayerData.qibla}°`);
      testResults.islamic.qiblaValid = true;
    } else {
      addResult('Qibla Direction', 'failed', 'Invalid Qibla direction');
      testResults.islamic.qiblaValid = false;
    }

    // Test prayers array
    if (prayerData.prayers && Array.isArray(prayerData.prayers) && prayerData.prayers.length === 5) {
      const validPrayers = prayerData.prayers.every(p => 
        p.name && p.time && p.adhan && p.iqamah
      );
      
      if (validPrayers) {
        addResult('Prayers Array', 'passed', 'All prayer objects properly structured');
        testResults.islamic.prayersArrayValid = true;
      } else {
        addResult('Prayers Array', 'failed', 'Prayer objects missing required fields');
        testResults.islamic.prayersArrayValid = false;
      }
    } else {
      addResult('Prayers Array', 'failed', 'Prayers array missing or invalid');
      testResults.islamic.prayersArrayValid = false;
    }

  } catch (error) {
    addResult('Islamic Features', 'failed', `Test failed: ${error.message}`);
  }
}

// Test 3: Mobile Network Simulation
async function testMobileNetworkConditions() {
  console.log('\n📡 Testing Mobile Network Conditions');
  
  const networkTests = [
    { name: 'WiFi', timeout: 2000, expected: '<1s' },
    { name: '4G', timeout: 5000, expected: '<3s' },
    { name: '3G', timeout: 10000, expected: '<8s' }
  ];

  for (const network of networkTests) {
    try {
      const { result: response, duration } = await measureTime(async () => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), network.timeout);
        
        const res = await fetch(`${API_BASE_URL}/prayer-times`, {
          headers: {
            'User-Agent': MOBILE_USER_AGENTS.android,
            'X-Islamic-App': 'AttaqwaMasjid'
          },
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      });

      testResults.performance[network.name.toLowerCase()] = duration;

      if (duration < network.timeout / 2) {
        addResult(
          `${network.name} Performance`, 'passed',
          `Excellent response time (${duration}ms)`,
          'performance'
        );
      } else if (duration < network.timeout) {
        addResult(
          `${network.name} Performance`, 'warnings',
          `Acceptable response time (${duration}ms)`,
          'performance'
        );
      } else {
        addResult(
          `${network.name} Performance`, 'failed',
          `Slow response time (${duration}ms)`,
          'performance'
        );
      }

    } catch (error) {
      addResult(
        `${network.name} Performance`, 'failed',
        `Network test failed: ${error.message}`,
        'performance'
      );
    }
  }
}

// Test 4: Error Handling
async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling');
  
  // Test invalid endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/invalid-endpoint`, {
      headers: {
        'User-Agent': MOBILE_USER_AGENTS.ios,
        'X-Islamic-App': 'AttaqwaMasjid'
      }
    });

    if (res.status === 404) {
      addResult('Invalid Endpoint', 'passed', 'Proper 404 error handling');
    } else {
      addResult('Invalid Endpoint', 'warnings', `Unexpected status: ${res.status}`);
    }
  } catch (error) {
    addResult('Invalid Endpoint', 'failed', `Error handling test failed: ${error.message}`);
  }

  // Test malformed request
  try {
    const res = await fetch(`${API_BASE_URL}/prayer-times?date=invalid-date`, {
      headers: {
        'User-Agent': MOBILE_USER_AGENTS.ios,
        'X-Islamic-App': 'AttaqwaMasjid'
      }
    });

    if (res.status === 400) {
      addResult('Malformed Request', 'passed', 'Proper validation error handling');
    } else {
      addResult('Malformed Request', 'warnings', `Unexpected status: ${res.status}`);
    }
  } catch (error) {
    addResult('Malformed Request', 'failed', `Validation test failed: ${error.message}`);
  }
}

// Test 5: Mobile App Type Compatibility
async function testTypeCompatibility() {
  console.log('\n📱 Testing Mobile App Type Compatibility');
  
  try {
    const response = await fetch(`${API_BASE_URL}/prayer-times`, {
      headers: {
        'User-Agent': MOBILE_USER_AGENTS.ios,
        'X-Islamic-App': 'AttaqwaMasjid'
      }
    });
    
    const data = await response.json();
    const prayerData = data.data;

    // Check all required mobile app fields
    const requiredFields = [
      'date', 'hijriDate', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 
      'isha', 'sunset', 'qibla', 'prayers', '_metadata'
    ];

    const missingFields = requiredFields.filter(field => !(field in prayerData));
    
    if (missingFields.length === 0) {
      addResult('Type Compatibility', 'passed', 'All required fields present for mobile app');
    } else {
      addResult('Type Compatibility', 'failed', `Missing fields: ${missingFields.join(', ')}`);
    }

    // Check prayers array structure
    if (prayerData.prayers && prayerData.prayers.length > 0) {
      const firstPrayer = prayerData.prayers[0];
      const prayerFields = ['name', 'time', 'adhan', 'iqamah'];
      const missingPrayerFields = prayerFields.filter(field => !(field in firstPrayer));
      
      if (missingPrayerFields.length === 0) {
        addResult('Prayer Object Structure', 'passed', 'Prayer objects properly structured');
      } else {
        addResult('Prayer Object Structure', 'failed', `Missing prayer fields: ${missingPrayerFields.join(', ')}`);
      }
    }

    // Check metadata structure
    if (prayerData._metadata) {
      const metadataFields = ['isOffline', 'source', 'location', 'lastUpdated', 'accuracy'];
      const missingMetaFields = metadataFields.filter(field => !(field in prayerData._metadata));
      
      if (missingMetaFields.length === 0) {
        addResult('Metadata Structure', 'passed', 'Metadata properly structured for offline support');
      } else {
        addResult('Metadata Structure', 'warnings', `Missing metadata fields: ${missingMetaFields.join(', ')}`);
      }
    } else {
      addResult('Metadata Structure', 'failed', 'Metadata missing for offline support');
    }

  } catch (error) {
    addResult('Type Compatibility', 'failed', `Type compatibility test failed: ${error.message}`);
  }
}

// Generate final recommendations
function generateRecommendations() {
  console.log('\n💡 Generating Recommendations');

  const totalIssues = testResults.summary.failed + testResults.summary.warnings;
  
  if (totalIssues === 0) {
    testResults.recommendations.push({
      priority: 'Success',
      category: 'Production Ready',
      recommendation: 'Mobile API is production-ready with excellent performance and full compatibility'
    });
  }

  // Performance recommendations
  const avgResponseTime = Object.values(testResults.performance).reduce((a, b) => a + b, 0) / Object.keys(testResults.performance).length;
  if (avgResponseTime > 1000) {
    testResults.recommendations.push({
      priority: 'High',
      category: 'Performance',
      recommendation: 'Implement response caching and CDN for faster mobile performance'
    });
  }

  // Islamic features recommendations
  if (!testResults.islamic.prayerTimesValid || !testResults.islamic.hijriDateValid) {
    testResults.recommendations.push({
      priority: 'Critical',
      category: 'Islamic Features',
      recommendation: 'Fix Islamic content validation issues before production deployment'
    });
  }

  // Mobile optimization recommendations
  testResults.recommendations.push({
    priority: 'Medium',
    category: 'Mobile Enhancement',
    recommendation: 'Add push notifications, offline support, and location-based prayer times'
  });

  // Security recommendations
  testResults.recommendations.push({
    priority: 'Medium',
    category: 'Security',
    recommendation: 'Implement rate limiting and API key authentication for production'
  });
}

// Main test execution
async function runFinalValidation() {
  console.log('🕌 Attaqwa Masjid Final Mobile Validation');
  console.log('='.repeat(50));
  
  try {
    await testPlatformCompatibility();
    await testIslamicFeatures();
    await testMobileNetworkConditions();
    await testErrorHandling();
    await testTypeCompatibility();
    
    generateRecommendations();
    
    // Calculate success rate
    const successRate = Math.round((testResults.summary.passed / testResults.summary.total) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    // Platform breakdown
    console.log('\n📱 Platform Compatibility:');
    Object.entries(testResults.platforms).forEach(([platform, stats]) => {
      const platformSuccess = Math.round((stats.passed / (stats.passed + stats.failed + stats.warnings)) * 100);
      console.log(`  ${platform}: ${platformSuccess}% (${stats.passed}/${stats.passed + stats.failed + stats.warnings})`);
    });
    
    // Performance summary
    if (Object.keys(testResults.performance).length > 0) {
      console.log('\n⚡ Performance Summary:');
      Object.entries(testResults.performance).forEach(([network, time]) => {
        console.log(`  ${network}: ${time}ms`);
      });
    }
    
    // Islamic features summary
    console.log('\n🕌 Islamic Features:');
    Object.entries(testResults.islamic).forEach(([feature, status]) => {
      const icon = status ? '✅' : '❌';
      console.log(`  ${icon} ${feature}: ${status ? 'Valid' : 'Invalid'}`);
    });
    
    // Production readiness assessment
    console.log('\n🚀 Production Readiness:');
    if (successRate >= 95) {
      console.log('  ✅ READY FOR PRODUCTION - Excellent compatibility and performance');
    } else if (successRate >= 85) {
      console.log('  ⚠️  READY WITH MINOR FIXES - Good compatibility, minor issues to address');
    } else if (successRate >= 70) {
      console.log('  🔧 NEEDS WORK - Significant issues need resolution before production');
    } else {
      console.log('  ❌ NOT READY - Major issues require immediate attention');
    }
    
    if (testResults.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      testResults.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.recommendation}`);
      });
    }
    
    // Save detailed results
    fs.writeFileSync('final-mobile-validation-results.json', JSON.stringify(testResults, null, 2));
    console.log('\n💾 Detailed results saved to final-mobile-validation-results.json');
    
  } catch (error) {
    console.error('❌ Final validation failed:', error.message);
  }
}

if (require.main === module) {
  runFinalValidation();
}

module.exports = { runFinalValidation, testResults };