const http = require('http');
const { spawn } = require('child_process');

// Simple performance test without external dependencies
async function performanceTest() {
  console.log('🚀 Starting Performance Tests...');
  
  // Start the application
  const app = spawn('node', ['index.js'], {
    env: { ...process.env, NODE_ENV: 'test', PORT: '3001' },
    stdio: 'pipe'
  });

  // Wait for app to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity
  };

  const responseTimes = [];

  // Performance test configuration
  const testDuration = 10000; // 10 seconds
  const concurrentUsers = 5;
  const startTime = Date.now();

  console.log(`Running performance test for ${testDuration/1000} seconds with ${concurrentUsers} concurrent users...`);

  // Run concurrent requests
  const promises = Array.from({ length: concurrentUsers }, () => runUserSimulation(startTime, testDuration, results, responseTimes));
  
  await Promise.all(promises);

  // Calculate statistics
  if (responseTimes.length > 0) {
    results.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    results.maxResponseTime = Math.max(...responseTimes);
    results.minResponseTime = Math.min(...responseTimes);
  }

  // Clean up
  app.kill();

  // Report results
  console.log('\n📊 Performance Test Results:');
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful Requests: ${results.successfulRequests}`);
  console.log(`Failed Requests: ${results.failedRequests}`);
  console.log(`Success Rate: ${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${results.averageResponseTime.toFixed(2)}ms`);
  console.log(`Min Response Time: ${results.minResponseTime.toFixed(2)}ms`);
  console.log(`Max Response Time: ${results.maxResponseTime.toFixed(2)}ms`);

  // Performance thresholds
  const thresholds = {
    averageResponseTime: 200, // ms
    successRate: 95, // %
    maxResponseTime: 1000 // ms
  };

  const successRate = (results.successfulRequests / results.totalRequests) * 100;
  
  if (results.averageResponseTime > thresholds.averageResponseTime) {
    console.error(`❌ Average response time ${results.averageResponseTime.toFixed(2)}ms exceeds threshold of ${thresholds.averageResponseTime}ms`);
    process.exit(1);
  }

  if (successRate < thresholds.successRate) {
    console.error(`❌ Success rate ${successRate.toFixed(2)}% is below threshold of ${thresholds.successRate}%`);
    process.exit(1);
  }

  if (results.maxResponseTime > thresholds.maxResponseTime) {
    console.error(`❌ Max response time ${results.maxResponseTime.toFixed(2)}ms exceeds threshold of ${thresholds.maxResponseTime}ms`);
    process.exit(1);
  }

  console.log('✅ All performance thresholds passed!');
}

async function runUserSimulation(startTime, duration, results, responseTimes) {
  while (Date.now() - startTime < duration) {
    const requestStart = Date.now();
    
    try {
      await makeRequest();
      const responseTime = Date.now() - requestStart;
      
      results.totalRequests++;
      results.successfulRequests++;
      responseTimes.push(responseTime);
      
    } catch (error) {
      results.totalRequests++;
      results.failedRequests++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function makeRequest() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run if called directly
if (require.main === module) {
  performanceTest().catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = { performanceTest };
