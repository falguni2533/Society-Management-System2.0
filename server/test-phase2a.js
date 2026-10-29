process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const TEST_PORT = 5002;
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

const { setupTestDatabase, teardownTestDatabase } = require('./test-helper');

async function runPhase2ATests(serverInstance) {
  console.log('🧪 Starting Phase 2A (Complaints & Notices) Automated Verification Tests...\n');
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
    // 1. Authenticate Admin and Residents
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
    assert(resident1Login.status === 200 && !!resident1Token, 'Resident 1 (John) login succeeds');

    const resident2Login = await makeRequest('/auth/login', 'POST', {
      email: 'sarah@society.com',
      password: 'resident123',
    });
    const resident2Token = resident2Login.body?.token;
    assert(resident2Login.status === 200 && !!resident2Token, 'Resident 2 (Sarah) login succeeds');

    const securityLogin = await makeRequest('/auth/login', 'POST', {
      email: 'security@society.com',
      password: 'security123',
    });
    const securityToken = securityLogin.body?.token;
    assert(securityLogin.status === 200 && !!securityToken, 'Security guard login succeeds');

    // ==========================================
    // COMPLAINTS TESTS
    // ==========================================
    console.log('\n--- Complaints Management Tests ---');

    // 2. Resident 1 creates complaint
    const createComp1 = await makeRequest('/complaints', 'POST', {
      title: 'Water leakage in bathroom pipe',
      description: 'The master bathroom sink drain pipe has a steady leak.',
      category: 'Plumbing',
      priority: 'High',
    }, resident1Token);
    assert(
      createComp1.status === 201 &&
        createComp1.body.success === true &&
        createComp1.body.data.status === 'Open' &&
        createComp1.body.data.category === 'Plumbing' &&
        createComp1.body.data.priority === 'High',
      'Resident 1 raises a High priority Plumbing complaint [201 Created]'
    );
    const comp1Id = createComp1.body.data._id;

    // 3. Resident 2 creates complaint
    const createComp2 = await makeRequest('/complaints', 'POST', {
      title: 'Corridor light flickering on 2nd floor',
      description: 'The overhead bulb outside Flat B-201 keeps flickering continuously.',
      category: 'Electrical',
      priority: 'Medium',
    }, resident2Token);
    assert(
      createComp2.status === 201 && createComp2.body.data.category === 'Electrical',
      'Resident 2 raises an Electrical complaint [201 Created]'
    );
    const comp2Id = createComp2.body.data._id;

    // 4. Resident 1 gets their own complaints
    const myComplaintsRes = await makeRequest('/complaints/my', 'GET', null, resident1Token);
    const r1ComplaintIds = myComplaintsRes.body.data.map(c => c._id);
    assert(
      myComplaintsRes.status === 200 &&
        r1ComplaintIds.includes(comp1Id) &&
        !r1ComplaintIds.includes(comp2Id),
      'Resident only sees their own complaints (/api/complaints/my) and not other residents\' data'
    );

    // 5. Resident 1 accesses single complaint details
    const getOwnComp = await makeRequest(`/complaints/${comp1Id}`, 'GET', null, resident1Token);
    assert(
      getOwnComp.status === 200 && getOwnComp.body.data.title === 'Water leakage in bathroom pipe',
      'Resident can access details of their own complaint (/api/complaints/:id)'
    );

    // 6. Resident 1 blocked from accessing Resident 2's complaint
    const getOtherComp = await makeRequest(`/complaints/${comp2Id}`, 'GET', null, resident1Token);
    assert(
      getOtherComp.status === 403,
      'Resident blocked from viewing another resident\'s complaint [403 Forbidden]'
    );

    // 7. Admin gets all complaints
    const allComplaintsAdmin = await makeRequest('/complaints', 'GET', null, adminToken);
    const allIds = allComplaintsAdmin.body.data.map(c => c._id);
    assert(
      allComplaintsAdmin.status === 200 &&
        allIds.includes(comp1Id) &&
        allIds.includes(comp2Id),
      'Admin can view all society complaints (/api/complaints) with populated resident details'
    );

    // 8. Resident blocked from Admin all-complaints route
    const residentToAllComp = await makeRequest('/complaints', 'GET', null, resident1Token);
    assert(
      residentToAllComp.status === 403,
      'Resident blocked from Admin all-complaints route (/api/complaints) [403 Forbidden]'
    );

    // 9. Admin updates complaint status & resolution note
    const updateCompRes = await makeRequest(`/complaints/${comp1Id}/status`, 'PATCH', {
      status: 'In Progress',
      resolutionNote: 'Plumber assigned. Inspection scheduled today at 4:00 PM.',
    }, adminToken);
    assert(
      updateCompRes.status === 200 &&
        updateCompRes.body.data.status === 'In Progress' &&
        updateCompRes.body.data.resolutionNote.includes('Plumber assigned'),
      'Admin updates complaint status to "In Progress" with resolution note'
    );

    // 10. Admin marks complaint as Resolved
    const resolveCompRes = await makeRequest(`/complaints/${comp1Id}/status`, 'PATCH', {
      status: 'Resolved',
      resolutionNote: 'Washer and pipe connector replaced. Leak resolved.',
    }, adminToken);
    assert(
      resolveCompRes.status === 200 && resolveCompRes.body.data.status === 'Resolved',
      'Admin marks complaint as "Resolved"'
    );

    // 11. Resident blocked from updating complaint status
    const residentUpdateStatus = await makeRequest(`/complaints/${comp1Id}/status`, 'PATCH', {
      status: 'Resolved',
    }, resident1Token);
    assert(
      residentUpdateStatus.status === 403,
      'Resident blocked from updating complaint status [403 Forbidden]'
    );

    // ==========================================
    // NOTICES TESTS
    // ==========================================
    console.log('\n--- Notices Management Tests ---');

    // 12. Admin creates a notice
    const createNoticeRes = await makeRequest('/notices', 'POST', {
      title: 'Annual Society General Meeting (AGM) Notice',
      content: 'The Annual General Body Meeting is scheduled for Sunday at 10:00 AM in the Clubhouse. All flat owners and residents are requested to attend.',
    }, adminToken);
    assert(
      createNoticeRes.status === 201 &&
        createNoticeRes.body.success === true &&
        createNoticeRes.body.data.title.includes('Annual Society General Meeting'),
      'Admin creates and publishes society notice [201 Created]'
    );
    const noticeId = createNoticeRes.body.data._id;

    // 13. Resident views published notices
    const residentNotices = await makeRequest('/notices', 'GET', null, resident1Token);
    const noticeTitles = residentNotices.body.data.map(n => n.title);
    assert(
      residentNotices.status === 200 &&
        noticeTitles.includes('Annual Society General Meeting (AGM) Notice'),
      'Resident can view all published society notices (/api/notices)'
    );

    // 14. Security guard views published notices
    const securityNotices = await makeRequest('/notices', 'GET', null, securityToken);
    assert(
      securityNotices.status === 200 && securityNotices.body.count >= 1,
      'Security guard can view published society notices'
    );

    // 15. Resident blocked from creating notices
    const residentCreateNotice = await makeRequest('/notices', 'POST', {
      title: 'Unauthorized Resident Notice',
      content: 'This should be rejected.',
    }, resident1Token);
    assert(
      residentCreateNotice.status === 403,
      'Resident blocked from creating notices [403 Forbidden]'
    );

    // 16. Resident blocked from deleting notices
    const residentDeleteNotice = await makeRequest(`/notices/${noticeId}`, 'DELETE', null, resident1Token);
    assert(
      residentDeleteNotice.status === 403,
      'Resident blocked from deleting notices [403 Forbidden]'
    );

    // 17. Admin deletes a notice
    const adminDeleteNotice = await makeRequest(`/notices/${noticeId}`, 'DELETE', null, adminToken);
    assert(
      adminDeleteNotice.status === 200 && adminDeleteNotice.body.success === true,
      'Admin can delete notice (/api/notices/:id) [200 OK]'
    );

    // 18. Verify notice was deleted
    const verifyNotices = await makeRequest('/notices', 'GET', null, resident1Token);
    const remainingNoticeIds = verifyNotices.body.data.map(n => n._id);
    assert(
      !remainingNoticeIds.includes(noticeId),
      'Deleted notice is no longer returned in /api/notices'
    );

    // 19. Check updated dashboard stats reflect dynamic counts
    const residentDash = await makeRequest('/dashboard/resident', 'GET', null, resident1Token);
    assert(
      residentDash.status === 200 && residentDash.body.data.stats.resolvedComplaints >= 1,
      'Resident dashboard stats reflect dynamic complaint counts'
    );

    const adminDash = await makeRequest('/dashboard/admin', 'GET', null, adminToken);
    assert(
      adminDash.status === 200 && adminDash.body.data.stats.totalComplaints >= 2,
      'Admin dashboard stats reflect dynamic society complaint metrics'
    );

    console.log(`\n📊 Phase 2A Test Summary: ${passed} Passed, ${failed} Failed\n`);
    serverInstance.close();
    await teardownTestDatabase();
    if (failed === 0) {
      console.log('🎉 ALL PHASE 2A COMPLAINTS & NOTICES TESTS PASSED SUCCESSFULLY!');
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
  setTimeout(() => runPhase2ATests(serverInstance), 500);
});
