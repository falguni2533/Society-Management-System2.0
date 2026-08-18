const http = require('http');
const app = require('./server');

// Use port 5001 for test harness to avoid collision with running dev server
const TEST_PORT = 5001;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

const makeRequest = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests(serverInstance) {
  console.log('🧪 Starting Phase 1 Backend Authentication & RBAC Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.body.success === true, 'Health Check API (/api/health)');

    // 2. Login Admin
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@society.com',
      password: 'admin123',
    });
    assert(
      adminLogin.status === 200 && !!adminLogin.body.token && adminLogin.body.user.role === 'admin',
      'Admin Login (admin@society.com) returns JWT and role "admin"'
    );
    const adminToken = adminLogin.body?.token;

    // 3. Login Resident
    const residentLogin = await makeRequest('/auth/login', 'POST', {
      email: 'resident@society.com',
      password: 'resident123',
    });
    assert(
      residentLogin.status === 200 &&
        !!residentLogin.body.token &&
        residentLogin.body.user.role === 'resident' &&
        residentLogin.body.user.flat?.wing === 'A',
      'Resident Login (resident@society.com) returns JWT, role "resident" & Flat A-101'
    );
    const residentToken = residentLogin.body?.token;

    // 4. Login Security
    const securityLogin = await makeRequest('/auth/login', 'POST', {
      email: 'security@society.com',
      password: 'security123',
    });
    assert(
      securityLogin.status === 200 &&
        !!securityLogin.body.token &&
        securityLogin.body.user.role === 'security',
      'Security Login (security@society.com) returns JWT and role "security"'
    );
    const securityToken = securityLogin.body?.token;

    // 5. Register a new resident user
    const randomEmail = `testuser_${Date.now()}@society.com`;
    const regRes = await makeRequest('/auth/register', 'POST', {
      name: 'New Resident Tester',
      email: randomEmail,
      password: 'password123',
      phone: '+1-555-9999',
      role: 'resident',
    });
    assert(
      regRes.status === 201 && regRes.body.success === true && !!regRes.body.token,
      'Resident Self-Registration (/api/auth/register) returns 201 Created & Token'
    );
    const newResidentToken = regRes.body?.token;

    // 6. Test GET /api/auth/me with Bearer token
    const meRes = await makeRequest('/auth/me', 'GET', null, newResidentToken);
    assert(
      meRes.status === 200 && meRes.body.user.email === randomEmail,
      'Get Current User Profile (/api/auth/me) with JWT token'
    );

    // 7. Role-based access: Admin accessing Admin Dashboard
    const adminDashRes = await makeRequest('/dashboard/admin', 'GET', null, adminToken);
    assert(
      adminDashRes.status === 200 && adminDashRes.body.data?.counts?.totalUsers >= 4,
      'Admin accessing Admin Dashboard (/api/dashboard/admin) [200 OK]'
    );

    // 8. Role-based access: Resident blocked from Admin Dashboard
    const residentToAdminDash = await makeRequest('/dashboard/admin', 'GET', null, residentToken);
    assert(
      residentToAdminDash.status === 403,
      'Resident blocked from Admin Dashboard (/api/dashboard/admin) [403 Forbidden]'
    );

    // 9. Role-based access: Resident accessing Resident Dashboard
    const residentDashRes = await makeRequest('/dashboard/resident', 'GET', null, residentToken);
    assert(
      residentDashRes.status === 200 && residentDashRes.body.data?.resident?.name === 'John Resident',
      'Resident accessing Resident Dashboard (/api/dashboard/resident) [200 OK]'
    );

    // 10. Role-based access: Security accessing Security Dashboard
    const securityDashRes = await makeRequest('/dashboard/security', 'GET', null, securityToken);
    assert(
      securityDashRes.status === 200 && securityDashRes.body.data?.gateCheckpoint === 'Main Gate 1',
      'Security accessing Security Dashboard (/api/dashboard/security) [200 OK]'
    );

    // 11. Security blocked from Resident private dashboard
    const securityToResidentDash = await makeRequest('/dashboard/resident', 'GET', null, securityToken);
    assert(
      securityToResidentDash.status === 403,
      'Security blocked from Resident Dashboard (/api/dashboard/resident) [403 Forbidden]'
    );

    // 12. Unauthenticated request to protected route
    const unauthRes = await makeRequest('/dashboard/admin', 'GET', null, null);
    assert(
      unauthRes.status === 401,
      'Unauthenticated request blocked from protected routes [401 Unauthorized]'
    );

    console.log(`\n📊 Test Summary: ${passed} Passed, ${failed} Failed\n`);
    serverInstance.close();
    if (failed === 0) {
      console.log('🎉 ALL BACKEND AUTH & RBAC TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    serverInstance.close();
    process.exit(1);
  }
}

const serverInstance = app.listen(TEST_PORT, () => {
  setTimeout(() => runTests(serverInstance), 500);
});
