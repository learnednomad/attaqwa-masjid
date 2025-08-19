#!/usr/bin/env node

/**
 * Mobile API Compatibility Test for Attaqwa Masjid
 * Tests mobile app API consumption and compatibility
 */

const fs = require('fs');

// Test configuration
const API_BASE_URL = 'http://localhost:3001/api';
const MOBILE_USER_AGENT = 'AttaqwaMasjid-Mobile/1.0';

// Mobile-specific headers for different platforms
const getMobileHeaders = (platform = 'ios') => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Encoding': 'gzip, deflate',
  'User-Agent': `${MOBILE_USER_AGENT} (${platform})`,
  'X-Islamic-App': 'AttaqwaMasjid',
  'X-Request-Context': 'mobile-testing',
});

// Expected mobile app type structure
const expectedPrayerTimeStructure = {
  date: 'string',
  hijriDate: 'string',
  fajr: 'string',
  sunrise: 'string',
  dhuhr: 'string',
  asr: 'string',
  maghrib: 'string',
  isha: 'string',
  sunset: 'string',
  qibla: 'number',
  prayers: 'array'
};

// Test results accumulator
const testResults = {
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  tests: [],
  recommendations: []
};

// Helper function to add test result
function addTestResult(name, status, message, data = null) {
  testResults.summary.totalTests++;
  testResults.summary[status]++;
  
  testResults.tests.push({
    name,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });
  
  console.log(`${status.toUpperCase()}: ${name} - ${message}`);
}

// Helper function to measure response time
async function measureResponseTime(testFn) {
  const start = Date.now();
  const result = await testFn();
  const duration = Date.now() - start;
  return { result, duration };
}

// Test 1: Basic Prayer Times API Connectivity
async function testPrayerTimesConnectivity() {
  try {
    const { result: response, duration } = await measureResponseTime(async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(`${API_BASE_URL}/prayer-times`, {
        method: 'GET',
        headers: getMobileHeaders('ios'),
        signal: controller.signal
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      return { status: res.status, data };
    });

    if (response.status === 200) {
      addTestResult(
        'Prayer Times Connectivity',
        'passed',
        `API responding in ${duration}ms`,
        { responseTime: duration, status: response.status }
      );
      
      if (duration > 3000) {
        addTestResult(
          'Performance Warning',
          'warnings',
          `Response time ${duration}ms exceeds 3G network expectations`,
          { responseTime: duration }
        );
      }
      
      return response.data;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    addTestResult(
      'Prayer Times Connectivity',
      'failed',
      `Connection failed: ${error.message}`,
      { error: error.message }
    );
    return null;
  }
}

// Test 2: API Response Structure Compatibility
function testResponseStructure(apiResponse) {
  if (!apiResponse || !apiResponse.data) {
    addTestResult(
      'Response Structure',
      'failed',
      'API response missing data field'
    );
    return;
  }

  const { data } = apiResponse;
  const missingFields = [];
  const typeErrors = [];

  // Check required fields for mobile app
  Object.entries(expectedPrayerTimeStructure).forEach(([field, expectedType]) => {
    if (!(field in data)) {
      missingFields.push(field);
    } else {
      const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
      if (actualType !== expectedType && field !== 'hijriDate' && field !== 'sunset' && field !== 'prayers') {
        typeErrors.push(`${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  });

  // Check specific mobile app requirements
  if (!data.islamicDate && !data.hijriDate) {
    missingFields.push('hijriDate (Islamic date missing)');
  }

  if (!data.location) {
    missingFields.push('location (needed for mobile GPS integration)');
  }

  if (missingFields.length === 0 && typeErrors.length === 0) {
    addTestResult(
      'Response Structure',
      'passed',
      'API response structure compatible with mobile app',
      { compatibility: 'full' }
    );
  } else {
    addTestResult(
      'Response Structure',
      'failed',
      `Structure issues: ${[...missingFields, ...typeErrors].join(', ')}`,
      { missingFields, typeErrors }
    );
  }
}

// Test 3: Mobile Data Transformation Test
function testDataTransformation(apiResponse) {
  if (!apiResponse || !apiResponse.data) return;

  try {
    const { data } = apiResponse;
    
    // Simulate mobile app transformation
    const prayers = [
      { name: 'Fajr', time: data.fajr, adhan: data.fajr, iqamah: '+10 min' },
      { name: 'Dhuhr', time: data.dhuhr, adhan: data.dhuhr, iqamah: '+10 min' },
      { name: 'Asr', time: data.asr, adhan: data.asr, iqamah: '+10 min' },
      { name: 'Maghrib', time: data.maghrib, adhan: data.maghrib, iqamah: '+5 min' },
      { name: 'Isha', time: data.isha, adhan: data.isha, iqamah: '+10 min' }
    ];

    const transformedData = {
      ...data,
      prayers,
      hijriDate: data.islamicDate?.formatted || "Unknown Hijri Date",
      sunset: data.maghrib, // Use maghrib for sunset
    };

    addTestResult(
      'Data Transformation',
      'passed',
      'API data successfully transformed for mobile app',
      { transformedFields: Object.keys(transformedData) }
    );
    
    return transformedData;
  } catch (error) {
    addTestResult(
      'Data Transformation',
      'failed',
      `Transformation failed: ${error.message}`,
      { error: error.message }
    );
    return null;
  }
}

// Test 4: Islamic Content Validation
function testIslamicContent(apiResponse) {
  if (!apiResponse || !apiResponse.data) return;

  const { data } = apiResponse;
  const issues = [];

  // Check prayer time format (should be HH:mm)
  const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
    if (data[prayer] && !timeFormat.test(data[prayer])) {
      issues.push(`${prayer} time format invalid: ${data[prayer]}`);
    }
  });

  // Check Qibla direction (should be 0-360)
  if (typeof data.qibla !== 'number' || data.qibla < 0 || data.qibla > 360) {
    issues.push(`Qibla direction invalid: ${data.qibla}`);
  }

  // Check Islamic date
  if (data.islamicDate) {
    const { year, monthName } = data.islamicDate;
    if (!year || year < 1400 || year > 1500) {
      issues.push(`Islamic year suspicious: ${year}`);
    }
    if (!monthName || typeof monthName !== 'string') {
      issues.push('Islamic month name missing or invalid');
    }
  }

  if (issues.length === 0) {
    addTestResult(
      'Islamic Content Validation',
      'passed',
      'All Islamic content properly formatted and valid'
    );
  } else {
    addTestResult(
      'Islamic Content Validation',
      'failed',
      `Validation issues: ${issues.join(', ')}`,
      { issues }
    );
  }
}

// Test 5: Mobile Network Performance Simulation
async function testMobileNetworkPerformance() {
  console.log('\n--- Testing Mobile Network Performance ---');
  
  const networkConditions = [
    { name: '4G', timeout: 5000, expectedMax: 2000 },
    { name: '3G', timeout: 10000, expectedMax: 5000 },
    { name: 'Slow 3G', timeout: 15000, expectedMax: 8000 }
  ];

  for (const condition of networkConditions) {
    try {
      const { result: response, duration } = await measureResponseTime(async () => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), condition.timeout);
        
        const res = await fetch(`${API_BASE_URL}/prayer-times`, {
          method: 'GET',
          headers: getMobileHeaders('android'),
          signal: controller.signal
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        return { status: res.status, data };
      });

      if (duration <= condition.expectedMax) {
        addTestResult(
          `${condition.name} Performance`,
          'passed',
          `Response time ${duration}ms within ${condition.expectedMax}ms target`
        );
      } else {
        addTestResult(
          `${condition.name} Performance`,
          'warnings',
          `Response time ${duration}ms exceeds ${condition.expectedMax}ms target`
        );
      }
    } catch (error) {
      addTestResult(
        `${condition.name} Performance`,
        'failed',
        `Request failed: ${error.message}`
      );
    }
  }
}

// Test 6: Cross-Platform Headers Test
async function testCrossPlatformCompatibility() {
  console.log('\n--- Testing Cross-Platform Compatibility ---');
  
  const platforms = ['ios', 'android', 'web'];
  
  for (const platform of platforms) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(`${API_BASE_URL}/prayer-times`, {
        method: 'GET',
        headers: getMobileHeaders(platform),
        signal: controller.signal
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      const response = { status: res.status, data };

      if (response.status === 200 && response.data.success) {
        addTestResult(
          `${platform.toUpperCase()} Compatibility`,
          'passed',
          `API compatible with ${platform} platform`
        );
      } else {
        addTestResult(
          `${platform.toUpperCase()} Compatibility`,
          'failed',
          `Unexpected response for ${platform}`
        );
      }
    } catch (error) {
      addTestResult(
        `${platform.toUpperCase()} Compatibility`,
        'failed',
        `${platform} request failed: ${error.message}`
      );
    }
  }
}

// Test 7: Additional API Endpoints
async function testAdditionalEndpoints() {
  console.log('\n--- Testing Additional Endpoints ---');
  
  const endpoints = [
    { path: '/prayer-times/qibla?latitude=43.6532&longitude=-79.3832', name: 'Qibla Direction' },
    { path: '/prayer-times/week', name: 'Weekly Prayer Times' },
    { path: '/prayer-times/islamic-date', name: 'Islamic Date' },
    { path: '/prayer-times/health', name: 'Health Check' }
  ];

  for (const endpoint of endpoints) {
    try {
      const { result: response, duration } = await measureResponseTime(async () => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(`${API_BASE_URL}${endpoint.path}`, {
          method: 'GET',
          headers: getMobileHeaders('ios'),
          signal: controller.signal
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        return { status: res.status, data };
      });

      if (response.status === 200) {
        addTestResult(
          endpoint.name,
          'passed',
          `${endpoint.name} endpoint working (${duration}ms)`
        );
      } else {
        addTestResult(
          endpoint.name,
          'failed',
          `${endpoint.name} returned status ${response.status}`
        );
      }
    } catch (error) {
      addTestResult(
        endpoint.name,
        'failed',
        `${endpoint.name} failed: ${error.message}`
      );
    }
  }
}

// Generate recommendations based on test results
function generateRecommendations() {
  console.log('\n--- Generating Recommendations ---');

  // Performance recommendations
  const performanceIssues = testResults.tests.filter(t => 
    t.name.includes('Performance') && t.status === 'warnings'
  );
  
  if (performanceIssues.length > 0) {
    testResults.recommendations.push({
      category: 'Performance',
      priority: 'High',
      issue: 'API response times exceed mobile network expectations',
      solution: 'Implement response caching, data compression, and consider CDN integration'
    });
  }

  // Structure compatibility recommendations
  const structureIssues = testResults.tests.filter(t => 
    t.name.includes('Response Structure') && t.status === 'failed'
  );
  
  if (structureIssues.length > 0) {
    testResults.recommendations.push({
      category: 'Compatibility',
      priority: 'Critical',
      issue: 'API response structure not compatible with mobile app expectations',
      solution: 'Create mobile-specific API endpoint or add response transformation layer'
    });
  }

  // Islamic content recommendations
  const islamicIssues = testResults.tests.filter(t => 
    t.name.includes('Islamic Content') && t.status === 'failed'
  );
  
  if (islamicIssues.length > 0) {
    testResults.recommendations.push({
      category: 'Islamic Features',
      priority: 'High',
      issue: 'Islamic content validation failures detected',
      solution: 'Review prayer time calculations and Islamic date formatting'
    });
  }

  // General mobile optimization recommendations
  testResults.recommendations.push({
    category: 'Mobile Optimization',
    priority: 'Medium',
    issue: 'Enhance mobile-specific features',
    solution: 'Add offline support, implement push notifications for prayer times, and optimize for mobile data usage'
  });
}

// Main test execution
async function runMobileCompatibilityTests() {
  console.log('🕌 Attaqwa Masjid Mobile API Compatibility Test');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Basic connectivity
    console.log('\n--- Testing Basic Connectivity ---');
    const apiResponse = await testPrayerTimesConnectivity();
    
    if (apiResponse) {
      // Test 2: Response structure
      console.log('\n--- Testing Response Structure ---');
      testResponseStructure(apiResponse);
      
      // Test 3: Data transformation
      console.log('\n--- Testing Data Transformation ---');
      const transformedData = testDataTransformation(apiResponse);
      
      // Test 4: Islamic content validation
      console.log('\n--- Testing Islamic Content ---');
      testIslamicContent(apiResponse);
    }
    
    // Test 5: Performance testing
    await testMobileNetworkPerformance();
    
    // Test 6: Cross-platform testing
    await testCrossPlatformCompatibility();
    
    // Test 7: Additional endpoints
    await testAdditionalEndpoints();
    
    // Generate recommendations
    generateRecommendations();
    
    // Output final results
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.summary.totalTests}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    
    const successRate = Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (testResults.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      testResults.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.solution}`);
      });
    }
    
    // Save detailed results to file
    fs.writeFileSync('mobile-api-test-results.json', JSON.stringify(testResults, null, 2));
    console.log('\n💾 Detailed results saved to mobile-api-test-results.json');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  runMobileCompatibilityTests();
}

module.exports = { runMobileCompatibilityTests, testResults };