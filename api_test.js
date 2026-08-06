// End-to-end API test script for ProjectPilot Backend services
// Runs in Node.js (uses built-in fetch available in Node.js 18+)

const AUTH_URL = 'http://localhost:8081';
const PROJECT_URL = 'http://localhost:8082';

const randomId = Math.floor(Math.random() * 1000000);
const testUser = {
  name: `Test User ${randomId}`,
  email: `testuser.${randomId}@pp.edu`,
  password: 'password123',
  role: 'STUDENT'
};

const results = [];

function recordResult(name, success, info = '') {
  results.push({ name, success, info });
  if (success) {
    console.log(`[PASS] ${name} ${info ? `(${info})` : ''}`);
  } else {
    console.error(`[FAIL] ${name} - ${info}`);
  }
}

async function runTests() {
  console.log('Starting backend API integration tests...\n');
  let token = '';
  let registeredUserId = null;
  let createdProjectId = null;
  let createdTeamId = null;
  let createdTaskId = null;
  let createdMilestoneId = null;
  let createdReportId = null;

  // 1. Register User (auth-service)
  try {
    const res = await fetch(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const text = await res.text();
    if (res.status === 200 && text.includes('User registered successfully')) {
      recordResult('1. Register User (auth-service)', true);
    } else {
      recordResult('1. Register User (auth-service)', false, `Status: ${res.status}, Body: ${text}`);
      return;
    }
  } catch (err) {
    recordResult('1. Register User (auth-service)', false, err.message);
    return;
  }

  // 2. Login User (auth-service)
  try {
    const res = await fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      token = data.token;
      registeredUserId = data.userId;
      recordResult('2. Login User (auth-service)', true, `Token: ${token.substring(0, 15)}...`);
    } else {
      recordResult('2. Login User (auth-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      return;
    }
  } catch (err) {
    recordResult('2. Login User (auth-service)', false, err.message);
    return;
  }

  // Setup auth header
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Current User Session details (auth-service)
  try {
    const res = await fetch(`${AUTH_URL}/api/users/me`, {
      headers: authHeaders
    });
    const text = await res.text();
    if (res.status === 200 && text.includes(testUser.email)) {
      recordResult('3. Get Session Details (auth-service)', true, text);
    } else {
      recordResult('3. Get Session Details (auth-service)', false, `Status: ${res.status}, Body: ${text}`);
    }
  } catch (err) {
    recordResult('3. Get Session Details (auth-service)', false, err.message);
  }

  // 4. Create User Profile in project-service
  let profileUserId = '';
  try {
    const res = await fetch(`${PROJECT_URL}/api/users`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: testUser.name,
        email: testUser.email,
        department: 'Quality Assurance',
        salary: 75000.0,
        joinDate: '2026-08-05'
      })
    });
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    if (res.status === 200 || res.status === 201) {
      profileUserId = data.id;
      recordResult('4. Create User Profile (project-service)', true, `ID: ${profileUserId}`);
    } else {
      recordResult('4. Create User Profile (project-service)', false, `Status: ${res.status}, Body: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
    }
  } catch (err) {
    recordResult('4. Create User Profile (project-service)', false, err.message);
  }

  // 5. List Users (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/users`, {
      headers: authHeaders
    });
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      recordResult('5. List Users Profile (project-service)', true, `Count: ${data.length}`);
    } else {
      recordResult('5. List Users Profile (project-service)', false, `Status: ${res.status}`);
    }
  } catch (err) {
    recordResult('5. List Users Profile (project-service)', false, err.message);
  }

  // 6. Create Project (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `AI DevOps Tool-${randomId}`,
        domain: 'Cloud Computing',
        phase: 'Implementation Phase',
        mentorName: 'Dr. John Watson',
        description: 'Auto deployment pipeline checking tool.'
      })
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      createdProjectId = data.id;
      recordResult('6. Create Project (project-service)', true, `Project ID: ${createdProjectId}`);
    } else {
      recordResult('6. Create Project (project-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
      return;
    }
  } catch (err) {
    recordResult('6. Create Project (project-service)', false, err.message);
    return;
  }

  // 7. Create Team (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/teams`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Team Beta ${randomId}`,
        projectId: createdProjectId,
        projectName: `AI DevOps Tool-${randomId}`,
        mentorName: 'Dr. John Watson',
        leaderName: testUser.name,
        membersCount: 4
      })
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      createdTeamId = data.id;
      recordResult('7. Create Team (project-service)', true, `Team ID: ${createdTeamId}`);
    } else {
      recordResult('7. Create Team (project-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('7. Create Team (project-service)', false, err.message);
  }

  // 8. Add Task to Project (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/projects/${createdProjectId}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Configure GitHub Actions workflow',
        deadline: '2026-09-01',
        priority: 'High'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.tasks && data.tasks.length > 0) {
      const task = data.tasks[data.tasks.length - 1];
      createdTaskId = task.id;
      recordResult('8. Add Task to Project (project-service)', true, `Task ID: ${createdTaskId}`);
    } else {
      recordResult('8. Add Task to Project (project-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('8. Add Task to Project (project-service)', false, err.message);
  }

  // 9. Add Milestone to Project (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/projects/${createdProjectId}/milestones`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Deployment setup completed',
        dueDate: '2026-09-15'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.milestones && data.milestones.length > 0) {
      const milestone = data.milestones[data.milestones.length - 1];
      createdMilestoneId = milestone.id;
      recordResult('9. Add Milestone to Project (project-service)', true, `Milestone ID: ${createdMilestoneId}`);
    } else {
      recordResult('9. Add Milestone to Project (project-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('9. Add Milestone to Project (project-service)', false, err.message);
  }

  // 10. Submit Weekly Report (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/projects/${createdProjectId}/reports`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        week: 'Week 1',
        remarks: 'Configured project boilerplates and verified connectivity.',
        fileUrl: 'https://drive.google.com/devops-sprint1'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.weeklyReports && data.weeklyReports.length > 0) {
      const report = data.weeklyReports[data.weeklyReports.length - 1];
      createdReportId = report.id;
      recordResult('10. Submit Weekly Report (project-service)', true, `Report ID: ${createdReportId}`);
    } else {
      recordResult('10. Submit Weekly Report (project-service)', false, `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('10. Submit Weekly Report (project-service)', false, err.message);
  }

  // 11. Fetch Project Details by ID (project-service)
  try {
    const res = await fetch(`${PROJECT_URL}/api/projects/${createdProjectId}`, {
      headers: authHeaders
    });
    const data = await res.json();
    if (res.status === 200 && data.name) {
      const verification = 
        data.tasks.some(t => t.id === createdTaskId) && 
        data.milestones.some(m => m.id === createdMilestoneId) && 
        data.weeklyReports.some(r => r.id === createdReportId);
      recordResult('11. Get Project and Embedded details (project-service)', verification, `Verified: ${verification}`);
    } else {
      recordResult('11. Get Project and Embedded details (project-service)', false, `Status: ${res.status}`);
    }
  } catch (err) {
    recordResult('11. Get Project and Embedded details (project-service)', false, err.message);
  }

  // 12. Delete Project Task (project-service)
  if (createdTaskId) {
    try {
      const res = await fetch(`${PROJECT_URL}/api/projects/${createdProjectId}/tasks/${createdTaskId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (res.status === 200 && data.tasks && !data.tasks.some(t => t.id === createdTaskId)) {
        recordResult('12. Delete Project Task (project-service)', true);
      } else {
        recordResult('12. Delete Project Task (project-service)', false, `Status: ${res.status}`);
      }
    } catch (err) {
      recordResult('12. Delete Project Task (project-service)', false, err.message);
    }
  }

  console.log('\n--- API Verification Summary ---');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  if (passed === total) {
    console.log('🚀 All APIs are working perfectly!');
  } else {
    console.log('⚠️ Some APIs failed. Please check the logs above.');
  }
}

runTests();
