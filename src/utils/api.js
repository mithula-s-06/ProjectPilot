const AUTH_URL = 'http://localhost:8081';
const PROJECT_URL = 'http://localhost:8082';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = 'API request failed';
    try {
      const errorText = await response.text();
      errorMsg = errorText || errorMsg;
    } catch (err) {}
    throw new Error(errorMsg);
  }

  // Handle No Content response
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

function mapProjectToFrontend(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    domain: p.domain,
    description: p.description || 'No description provided.',
    teamName: p.teamName,
    phase: p.phase || 'Planning Phase',
    mentor: p.mentorName || 'Not Assigned',
    health: p.health !== undefined ? p.health : 100,
    progress: p.progress !== undefined ? p.progress : 0,
    status: p.status || 'Active',
    tasks: p.tasks || [],
    milestones: p.milestones || [],
    weeklyReports: p.weeklyReports || [],
    github: {
      repoUrl: p.repoUrl || '',
      commits: p.commits !== undefined ? p.commits : 0,
      prs: p.prs !== undefined ? p.prs : 0,
      issuesClosed: p.issuesClosed !== undefined ? p.issuesClosed : 0,
      contributionPercentage: p.contributionPercentage !== undefined ? p.contributionPercentage : 100
    },
    healthDetails: p.healthDetails || {
      scores: [p.health !== undefined ? p.health : 100],
      months: ['Jun'],
      aiSummary: 'Project synced from database.'
    },
    riskDetails: p.riskDetails || {
      riskLevel: 'Low Risk',
      factors: [],
      aiExplanation: 'Database synchronization active.',
      prediction: 0
    },
    mentorFeedback: p.mentorFeedback || { latestFeedback: 'New project initialized.', date: '--', allComments: [] }
  };
}

function mapProjectToBackend(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    domain: p.domain,
    health: p.health !== undefined ? p.health : 100,
    phase: p.phase || 'Planning Phase',
    mentorName: p.mentor || 'Not Assigned',
    progress: p.progress !== undefined ? p.progress : 0,
    status: p.status || 'Active',
    description: p.description || '',
    repoUrl: p.github?.repoUrl || '',
    commits: p.github?.commits !== undefined ? p.github.commits : 0,
    prs: p.github?.prs !== undefined ? p.github.prs : 0,
    issuesClosed: p.github?.issuesClosed !== undefined ? p.github.issuesClosed : 0,
    contributionPercentage: p.github?.contributionPercentage !== undefined ? p.github.contributionPercentage : 100,
    teamName: p.teamName,
    tasks: p.tasks || [],
    milestones: p.milestones || [],
    weeklyReports: p.weeklyReports || []
  };
}

export const api = {
  // Authentication & Users (auth-service)
  async login(email, password) {
    const data = await request(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      
      const mappedRole = data.role === 'ADMIN' ? 'System Administrator' 
                       : data.role === 'TEAM_LEADER' ? 'Team Leader' 
                       : data.role === 'MENTOR' ? 'Mentor' 
                       : 'Student';

      const userProfile = {
        fullName: data.name || (mappedRole === 'System Administrator' ? 'Administrator' : email.split('@')[0]),
        email: data.email,
        role: mappedRole,
        collegeName: 'ProjectPilot University',
        department: 'Computer Science & Engineering',
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userProfile));
      return { token: data.token, user: userProfile };
    }
    throw new Error('Invalid token returned');
  },

  async register(name, email, password, role) {
    // 1. Register in auth-service (Oracle / MongoDB)
    const authRole = role === 'Team Leader' ? 'TEAM_LEADER' 
                   : role === 'Mentor' ? 'MENTOR' 
                   : role === 'Student' ? 'STUDENT' 
                   : role.toUpperCase();

    const registerResult = await request(`${AUTH_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: authRole }),
    });

    // 2. Try to auto-login to get token for project-service profile creation
    try {
      const loginData = await this.login(email, password);
      
      // 3. Create profile in project-service (MongoDB)
      await request(`${PROJECT_URL}/api/users`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${loginData.token}` },
        body: JSON.stringify({
          name,
          email,
          role: authRole,
          department: 'Computer Science & Engineering',
          salary: 50000.0,
          joinDate: new Date().toISOString().split('T')[0]
        }),
      });
    } catch (err) {
      console.warn('Auto profile syncing to project-service failed:', err);
    }

    return registerResult;
  },

  async getSession() {
    return await request(`${AUTH_URL}/api/users/me`);
  },

  // Users CRUD (project-service)
  async listUsers() {
    return await request(`${PROJECT_URL}/api/users`);
  },

  async createUserProfile(profileData) {
    return await request(`${PROJECT_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async deleteUserProfile(id) {
    return await request(`${PROJECT_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  async updateUserProfile(id, profileData) {
    return await request(`${PROJECT_URL}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Projects CRUD (project-service)
  async listProjects() {
    const data = await request(`${PROJECT_URL}/api/projects`);
    return (data || []).map(mapProjectToFrontend);
  },

  async getProjectById(id) {
    const data = await request(`${PROJECT_URL}/api/projects/${id}`);
    return mapProjectToFrontend(data);
  },

  async createProject(projectData) {
    const payload = mapProjectToBackend(projectData);
    const data = await request(`${PROJECT_URL}/api/projects`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapProjectToFrontend(data);
  },

  async updateProject(id, projectData) {
    const payload = mapProjectToBackend(projectData);
    const data = await request(`${PROJECT_URL}/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapProjectToFrontend(data);
  },

  async deleteProject(id) {
    return await request(`${PROJECT_URL}/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Teams CRUD (project-service)
  async listTeams() {
    return await request(`${PROJECT_URL}/api/teams`);
  },

  async createTeam(teamData) {
    return await request(`${PROJECT_URL}/api/teams`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },

  async updateTeam(id, teamData) {
    return await request(`${PROJECT_URL}/api/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  },

  // Project Subresources (project-service)
  async addTask(projectId, taskData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(projectId, taskId, taskData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async deleteTask(projectId, taskId) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async addMilestone(projectId, milestoneData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  },

  async addWeeklyReport(projectId, reportData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/reports`, {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  async reviewWeeklyReport(projectId, reportId, reviewData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/reports/${reportId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }
};
