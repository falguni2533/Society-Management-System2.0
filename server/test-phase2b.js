process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');
const { setupTestDatabase, teardownTestDatabase } = require('./test-helper');

const TEST_PORT = 5003;
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

async function runPhase2BTests(serverInstance) {
  console.log('🧪 Starting Phase 2B (Maintenance Bills & Visitor Management) Automated Verification Tests...\n');
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
    await setupTestDatabase();

    // 1. Authenticate Admin, Residents, and Security Guard
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@society.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.body?.token;
    assert(adminLogin.status === 200 && !!adminToken, 'Admin login succeeds and returns JWT');

    const resident1Login = await makeRequest('/auth/login', 'POST', {
      email: 'resident@society.com',
      password: 'resident123',
    });
    const resident1Token = resident1Login.body?.token;
    const resident1User = resident1Login.body?.user;
    assert(resident1Login.status === 200 && !!resident1Token, 'Resident 1 (John, Flat A-101) login succeeds');

    const resident2Login = await makeRequest('/auth/login', 'POST', {
      email: 'sarah@society.com',
      password: 'resident123',
    });
    const resident2Token = resident2Login.body?.token;
    assert(resident2Login.status === 200 && !!resident2Token, 'Resident 2 (Sarah, Flat B-201) login succeeds');

    const securityLogin = await makeRequest('/auth/login', 'POST', {
      email: 'security@society.com',
      password: 'security123',
    });
    const securityToken = securityLogin.body?.token;
    assert(securityLogin.status === 200 && !!securityToken, 'Security guard login succeeds');

    // ==========================================
    // MAINTENANCE BILLS TESTS
    // ==========================================
    console.log('\n--- 1. Maintenance Bills Module Tests ---');

    const targetFlatId = resident1User?.flat?._id || resident1User?.flat;
    const targetResidentId = resident1User?._id;
    const createBillRes = await makeRequest('/bills', 'POST', {
      flat: targetFlatId,
      resident: targetResidentId,
      amount: 250,
      month: 'August',
      year: 2026,
      billType: 'Maintenance',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Monthly society maintenance charge for Flat A-101',
    }, adminToken);
    if (createBillRes.status !== 201) {
      console.error('Debug createBill error:', createBillRes.body, 'targetFlatId:', targetFlatId);
    }
    assert(
      createBillRes.status === 201 &&
        createBillRes.body.success === true &&
        createBillRes.body.data.amount === 250 &&
        createBillRes.body.data.status === 'Pending',
      'Admin creates a maintenance bill for Flat A-101 [201 Created]'
    );
    const bill1Id = createBillRes.body.data._id;

    // 3. Resident 1 views their own bills
    const myBillsRes = await makeRequest('/bills/my', 'GET', null, resident1Token);
    const r1BillIds = myBillsRes.body.data.map((b) => b._id);
    assert(
      myBillsRes.status === 200 &&
        myBillsRes.body.count >= 1 &&
        r1BillIds.includes(bill1Id) &&
        myBillsRes.body.summary?.totalPendingAmount === 250,
      'Resident 1 accesses /api/bills/my and sees their own bill with correct pending totals'
    );

    // 4. Resident 2 views their own bills (Strict Data Isolation)
    const r2BillsRes = await makeRequest('/bills/my', 'GET', null, resident2Token);
    assert(
      r2BillsRes.status === 200 && r2BillsRes.body.count === 0,
      'Resident 2 sees only their own bills (0 bills) and not Resident 1 data (Strict Isolation)'
    );

    // 5. Resident 2 blocked from viewing Resident 1 bill by ID
    const r2GetR1Bill = await makeRequest(`/bills/${bill1Id}`, 'GET', null, resident2Token);
    assert(
      r2GetR1Bill.status === 403,
      'Resident blocked from viewing another resident\'s bill by ID [403 Forbidden]'
    );

    // 6. Resident blocked from Admin all-bills route
    const residentToAllBills = await makeRequest('/bills', 'GET', null, resident1Token);
    assert(
      residentToAllBills.status === 403,
      'Resident blocked from Admin all-bills route (/api/bills) [403 Forbidden]'
    );

    // 7. Security staff strictly blocked from all billing endpoints
    const secToMyBills = await makeRequest('/bills/my', 'GET', null, securityToken);
    const secToAllBills = await makeRequest('/bills', 'GET', null, securityToken);
    const secToGetBill = await makeRequest(`/bills/${bill1Id}`, 'GET', null, securityToken);
    const secToCreateBill = await makeRequest('/bills', 'POST', { amount: 100 }, securityToken);
    assert(
      secToMyBills.status === 403 &&
        secToAllBills.status === 403 &&
        secToGetBill.status === 403 &&
        secToCreateBill.status === 403,
      'Security staff has ZERO access to bills or financial endpoints [403 Forbidden on all]'
    );

    // 8. Admin gets all society bills with populated relations
    const allBillsAdmin = await makeRequest('/bills', 'GET', null, adminToken);
    assert(
      allBillsAdmin.status === 200 &&
        allBillsAdmin.body.count >= 1 &&
        allBillsAdmin.body.summary?.totalBilledAmount >= 250,
      'Admin views all society bills (/api/bills) with aggregated financial summaries'
    );

    // 9. Admin marks bill as Paid with payment details
    const payBillRes = await makeRequest(`/bills/${bill1Id}/status`, 'PATCH', {
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      paymentReference: 'NEFT-88392019',
      notes: 'Received via HDFC netbanking',
    }, adminToken);
    assert(
      payBillRes.status === 200 &&
        payBillRes.body.data.status === 'Paid' &&
        payBillRes.body.data.paymentMethod === 'Bank Transfer' &&
        !!payBillRes.body.data.paidDate,
      'Admin marks bill as Paid with payment method and transaction reference'
    );

    // 10. Verify bill shows as Paid in Resident 1 portal
    const r1BillsAfterPayment = await makeRequest('/bills/my', 'GET', null, resident1Token);
    assert(
      r1BillsAfterPayment.status === 200 &&
        r1BillsAfterPayment.body.summary?.totalPendingAmount === 0 &&
        r1BillsAfterPayment.body.summary?.totalPaidAmount === 250,
      'Resident 1 portal reflects $0.00 pending dues and $250.00 total paid'
    );

    // ==========================================
    // VISITOR MANAGEMENT TESTS
    // ==========================================
    console.log('\n--- 2. Visitor Management Module Tests ---');

    // 11. Resident 1 pre-approves visitor
    const todayStr = new Date().toISOString();
    const createVisitor1 = await makeRequest('/visitors', 'POST', {
      visitorName: 'Robert Davis',
      phone: '+1-555-7788',
      purpose: 'Guest / Family',
      expectedDate: todayStr,
      expectedTime: '14:30',
      vehicleNumber: 'KA-01-AB-1234',
      notes: 'Weekend family visit',
    }, resident1Token);
    assert(
      createVisitor1.status === 201 &&
        createVisitor1.body.success === true &&
        createVisitor1.body.data.status === 'Pre-Approved' &&
        !!createVisitor1.body.data.passCode &&
        createVisitor1.body.data.passCode.startsWith('VIS-'),
      'Resident 1 pre-approves visitor (Robert Davis) with auto-generated pass code [201 Created]'
    );
    const visitor1Id = createVisitor1.body.data._id;
    const visitor1PassCode = createVisitor1.body.data.passCode;

    // 12. Resident 1 views their own visitors
    const r1Visitors = await makeRequest('/visitors/my', 'GET', null, resident1Token);
    const r1VisIds = r1Visitors.body.data.map((v) => v._id);
    assert(
      r1Visitors.status === 200 && r1VisIds.includes(visitor1Id),
      'Resident 1 accesses /api/visitors/my and sees their pre-approved visitor'
    );

    // 13. Resident 2 views their own visitors (Strict Data Isolation)
    const r2Visitors = await makeRequest('/visitors/my', 'GET', null, resident2Token);
    assert(
      r2Visitors.status === 200 && r2Visitors.body.count === 0,
      'Resident 2 receives isolated visitor history (does not see Resident 1 guest)'
    );

    // 14. Resident 2 blocked from viewing Resident 1 visitor by ID
    const r2GetR1Visitor = await makeRequest(`/visitors/${visitor1Id}`, 'GET', null, resident2Token);
    assert(
      r2GetR1Visitor.status === 403,
      'Resident blocked from viewing another resident\'s visitor details [403 Forbidden]'
    );

    // 15. Security guard views today's expected visitors
    const secTodayVisitors = await makeRequest('/visitors/today', 'GET', null, securityToken);
    const secTodayIds = secTodayVisitors.body.data.map((v) => v._id);
    assert(
      secTodayVisitors.status === 200 &&
        secTodayIds.includes(visitor1Id) &&
        secTodayVisitors.body.stats?.expectedToday >= 1,
      'Security guard views today\'s expected visitors at gate checkpoint (/api/visitors/today)'
    );

    // 16. Security verifies visitor by pass code
    const verifyPass = await makeRequest(`/visitors/verify/${visitor1PassCode}`, 'GET', null, securityToken);
    assert(
      verifyPass.status === 200 && verifyPass.body.data.visitorName === 'Robert Davis',
      'Security guard verifies visitor pass code at gate checkpoint'
    );

    // 17. Security checks in visitor
    const checkInRes = await makeRequest(`/visitors/${visitor1Id}/checkin`, 'PATCH', {}, securityToken);
    assert(
      checkInRes.status === 200 &&
        checkInRes.body.data.status === 'Checked In' &&
        !!checkInRes.body.data.checkInTime &&
        !!checkInRes.body.data.securityGuard,
      'Security checks in visitor (status: "Checked In", timestamp & guard ID recorded)'
    );

    // 18. Security checks out visitor
    const checkOutRes = await makeRequest(`/visitors/${visitor1Id}/checkout`, 'PATCH', {}, securityToken);
    assert(
      checkOutRes.status === 200 &&
        checkOutRes.body.data.status === 'Checked Out' &&
        !!checkOutRes.body.data.checkOutTime,
      'Security checks out visitor (status: "Checked Out", exit timestamp recorded)'
    );

    // 19. Resident 1 pre-approves and cancels a second visitor
    const createVisitor2 = await makeRequest('/visitors', 'POST', {
      visitorName: 'Quick Delivery Courier',
      phone: '+1-555-9900',
      purpose: 'Delivery',
      expectedDate: todayStr,
    }, resident1Token);
    const visitor2Id = createVisitor2.body.data._id;

    const cancelRes = await makeRequest(`/visitors/${visitor2Id}/cancel`, 'PATCH', {}, resident1Token);
    assert(
      cancelRes.status === 200 && cancelRes.body.data.status === 'Cancelled',
      'Resident cancels their own pre-approved visitor pass'
    );

    // 20. Admin views all society visitor logs
    const allVisitorsAdmin = await makeRequest('/visitors', 'GET', null, adminToken);
    assert(
      allVisitorsAdmin.status === 200 && allVisitorsAdmin.body.count >= 2,
      'Admin views complete society visitor registry (/api/visitors)'
    );

    // ==========================================
    // DASHBOARD METRICS INTEGRATION
    // ==========================================
    console.log('\n--- 3. Dashboard Statistics Integration Tests ---');

    // 21. Resident Dashboard stats
    const residentDash = await makeRequest('/dashboard/resident', 'GET', null, resident1Token);
    assert(
      residentDash.status === 200 &&
        residentDash.body.data.stats.pendingBills === 0 &&
        residentDash.body.data.stats.totalPendingAmount === 0,
      'Resident Dashboard dynamically reflects updated billing and visitor metrics'
    );

    // 22. Admin Dashboard stats
    const adminDash = await makeRequest('/dashboard/admin', 'GET', null, adminToken);
    assert(
      adminDash.status === 200 &&
        adminDash.body.data.stats.billing?.totalBills >= 1 &&
        adminDash.body.data.stats.billing?.totalCollectedDues >= 250 &&
        adminDash.body.data.stats.visitors?.totalVisitors >= 2,
      'Admin Dashboard reflects dynamic billing sums and visitor counts'
    );

    // 23. Security Dashboard stats
    const securityDash = await makeRequest('/dashboard/security', 'GET', null, securityToken);
    assert(
      securityDash.status === 200 &&
        securityDash.body.data.stats.completedVisitsToday >= 1,
      'Security Dashboard reflects dynamic gate checkpoint visitor counts'
    );

    console.log(`\n📊 Phase 2B Test Summary: ${passed} Passed, ${failed} Failed\n`);
    serverInstance.close();
    await teardownTestDatabase();
    if (failed === 0) {
      console.log('🎉 ALL PHASE 2B BILLS & VISITOR TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution error:', error);
    serverInstance.close();
    await teardownTestDatabase();
    process.exit(1);
  }
}

const serverInstance = app.listen(TEST_PORT, () => {
  setTimeout(() => runPhase2BTests(serverInstance), 500);
});
