#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests your deployed API endpoints to ensure everything is working
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  // Update this with your deployed API URL
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  timeout: 10000
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: config.timeout,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    log(`   ${method} ${config.baseUrl}${path}`, 'yellow');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await makeRequest(`${config.baseUrl}${path}`, options);
    
    if (response.statusCode === expectedStatus) {
      log(`   ✅ SUCCESS (${response.statusCode})`, 'green');
      if (response.data && typeof response.data === 'object') {
        log(`   📊 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`, 'yellow');
      }
      return { success: true, response };
    } else {
      log(`   ❌ FAILED - Expected ${expectedStatus}, got ${response.statusCode}`, 'red');
      log(`   📊 Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ ERROR: ${error.message}`, 'red');
    return { success: false, error };
  }
}

async function runTests() {
  log('🚀 School Management API - Deployment Test Suite', 'blue');
  log('=' .repeat(50), 'blue');
  log(`🌐 Testing API at: ${config.baseUrl}`, 'yellow');
  
  const results = [];
  
  // Test 1: Health Check
  results.push(await testEndpoint(
    'Health Check',
    'GET',
    '/api/health'
  ));
  
  // Test 2: API Info
  results.push(await testEndpoint(
    'API Info',
    'GET',
    '/'
  ));
  
  // Test 3: Get Schools
  results.push(await testEndpoint(
    'Get All Schools',
    'GET',
    '/api/schools'
  ));
  
  // Test 4: Create School
  const schoolData = {
    name: 'Test School from Deployment Test',
    address: '123 Test Street, Test City, TC 12345',
    phone: '555-0101',
    email: 'test@deployment-test.edu',
    establishedYear: 2020,
    principal: 'Test Principal'
  };
  
  const createSchoolResult = await testEndpoint(
    'Create School',
    'POST',
    '/api/schools',
    schoolData,
    201
  );
  results.push(createSchoolResult);
  
  let schoolId = null;
  if (createSchoolResult.success && createSchoolResult.response.data.data) {
    schoolId = createSchoolResult.response.data.data._id;
    log(`   📝 Created School ID: ${schoolId}`, 'green');
  }
  
  // Test 5: Get Students
  results.push(await testEndpoint(
    'Get All Students',
    'GET',
    '/api/students'
  ));
  
  // Test 6: Create Student
  const studentData = {
    firstName: 'Test',
    lastName: 'Student',
    email: 'test.student@deployment-test.com',
    phone: '555-1001',
    dateOfBirth: '2010-01-01',
    grade: '8th',
    address: {
      street: '456 Student Ave',
      city: 'Test City',
      state: 'TC',
      zipCode: '12345'
    }
  };
  
  const createStudentResult = await testEndpoint(
    'Create Student',
    'POST',
    '/api/students',
    studentData,
    201
  );
  results.push(createStudentResult);
  
  let studentId = null;
  if (createStudentResult.success && createStudentResult.response.data.data) {
    studentId = createStudentResult.response.data.data._id;
    log(`   📝 Created Student ID: ${studentId}`, 'green');
  }
  
  // Test 7: Test Error Handling
  results.push(await testEndpoint(
    'Test Validation Error',
    'POST',
    '/api/schools',
    { name: 'Incomplete School' },
    400
  ));
  
  // Test 8: Test Not Found
  results.push(await testEndpoint(
    'Test Not Found',
    'GET',
    '/api/schools/507f1f77bcf86cd799439011',
    null,
    404
  ));
  
  // Summary
  log('\n📊 Test Results Summary:', 'blue');
  log('=' .repeat(30), 'blue');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 All tests passed! Your API is working correctly.', 'green');
    log('\n📋 Next steps for Postman testing:', 'blue');
    log('1. Import the School-Management-API.postman_collection.json file', 'yellow');
    log('2. Update the base_url variable to your deployed API URL', 'yellow');
    log('3. Start testing with the Health Check endpoint', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'red');
    log('Make sure your API is deployed and accessible.', 'red');
  }
  
  // Cleanup: Delete test data if created
  if (schoolId) {
    try {
      await makeRequest(`${config.baseUrl}/api/schools/${schoolId}`, { method: 'DELETE' });
      log(`\n🧹 Cleaned up test school: ${schoolId}`, 'yellow');
    } catch (e) {
      log(`\n⚠️  Could not clean up test school: ${e.message}`, 'red');
    }
  }
  
  if (studentId) {
    try {
      await makeRequest(`${config.baseUrl}/api/students/${studentId}`, { method: 'DELETE' });
      log(`🧹 Cleaned up test student: ${studentId}`, 'yellow');
    } catch (e) {
      log(`⚠️  Could not clean up test student: ${e.message}`, 'red');
    }
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
