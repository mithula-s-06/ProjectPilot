import { fileStorage } from './fileStorage';

const AUTH_URL = (import.meta.env?.VITE_AUTH_API_URL || 'http://localhost:8081').replace(/\/+$/, '');
const PROJECT_URL = (import.meta.env?.VITE_PROJECT_API_URL || 'http://localhost:8082').replace(/\/+$/, '');

export function cleanAndDeduplicateSkills(skills) {
  if (!skills || !Array.isArray(skills)) return [];

  const aliasMap = {
    'springboot': 'Spring Boot',
    'spring-boot': 'Spring Boot',
    'spring': 'Spring Boot',
    'reactjs': 'React',
    'react.js': 'React',
    'react': 'React',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'expressjs': 'Express.js',
    'express.js': 'Express.js',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'angularjs': 'Angular',
    'tailwindcss': 'Tailwind CSS',
    'tailwind': 'Tailwind CSS',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'py': 'Python',
    'python': 'Python',
    'cpp': 'C++',
    'cplusplus': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'golang': 'Go',
    'gcp': 'Google Cloud Platform',
    'aws': 'AWS',
    'cicd': 'CI/CD',
    'ci/cd': 'CI/CD',
    'html': 'HTML',
    'html5': 'HTML',
    'css': 'CSS',
    'css3': 'CSS',
    'github': 'GitHub',
    'git': 'Git',
    'docker': 'Docker',
    'postman': 'Postman',
    'firebase': 'Firebase',
    'mysql': 'MySQL',
    'cybersecurity': 'Cybersecurity'
  };

  const headerPrefixRegex = /^[^:]*:\s*/i;

  const seen = new Set();
  const result = [];

  for (const raw of skills) {
    if (!raw || typeof raw !== 'string') continue;
    let s = raw.trim();
    if (s.includes(':') && !s.startsWith('http')) {
      s = s.replace(headerPrefixRegex, '').trim();
    }
    if (!s || s.length < 2) continue;

    const lower = s.toLowerCase();
    const canonical = aliasMap[lower] || s;
    const normKey = canonical.toLowerCase().replace(/[\s\-_.:]/g, '');

    if (!seen.has(normKey)) {
      seen.add(normKey);
      result.push(canonical);
    }
  }

  return result;
}

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
    } catch {}
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
    documents: p.documents || [],
    referenceLinks: p.referenceLinks || [],
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
    weeklyReports: p.weeklyReports || [],
    documents: p.documents || [],
    referenceLinks: p.referenceLinks || []
  };
}

export const api = {
  PROJECT_URL,
  // Authentication & Users (auth-service)
  async login(email, password, department = null, collegeName = null) {
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

      // Read from backend profile if possible to get persistent department & collegeName!
      let dbProfile = null;
      try {
        const users = await request(`${PROJECT_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        dbProfile = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
      } catch (err) {
        console.warn('Fetching profile on login failed:', err);
      }

      // If user profile is missing in MongoDB (e.g. after re-registration, direct auth, or DB reset),
      // auto-create their profile in MongoDB so they can seamlessly use the system!
      if (!dbProfile && email.toLowerCase() !== 'admin@pp.edu') {
        try {
          const authRole = data.role || 'STUDENT';
          const newProfile = {
            name: data.name || email.split('@')[0],
            email: data.email,
            role: authRole,
            department: department || 'Computer Science & Engineering',
            collegeName: collegeName || ''
          };
          dbProfile = await request(`${PROJECT_URL}/api/users`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${data.token}` },
            body: JSON.stringify(newProfile),
          });
        } catch (syncErr) {
          console.warn('Auto-creating MongoDB profile during login failed:', syncErr);
        }
      }

      const userProfile = {
        fullName: data.name || (mappedRole === 'System Administrator' ? 'Administrator' : email.split('@')[0]),
        email: data.email,
        role: mappedRole,
        collegeName: (dbProfile && dbProfile.collegeName) || collegeName || (mappedRole === 'System Administrator' ? 'ProjectPilot Platform' : ''),
        department: (dbProfile && dbProfile.department) || department || 'Computer Science & Engineering',
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userProfile));
      return { token: data.token, user: userProfile };
    }
    throw new Error('Invalid token returned');
  },

  async register(name, email, password, role, department = 'Computer Science & Engineering', collegeName = '', yearOfStudy = '', resumeId = '', resumeName = '', resumeUrl = '', skills = []) {
    // 1. Register in auth-service (MySQL)
    const authRole = role === 'Team Leader' ? 'TEAM_LEADER' 
                   : role === 'Mentor' ? 'MENTOR' 
                   : role === 'Student' ? 'STUDENT' 
                   : role.toUpperCase();

    try {
      await request(`${AUTH_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role: authRole }),
      });
    } catch (regErr) {
      // If email is already registered in auth-service (e.g. from previous account or re-registration),
      // we proceed to login and ensure the profile in project-service is created/synced.
      if (regErr.message && regErr.message.includes('Email already registered')) {
        console.info('Email already registered in auth-service, proceeding to sync profile.');
      } else {
        throw regErr;
      }
    }

    // 2. Login to get token and set up session
    const loginData = await this.login(email, password, department, collegeName);

    // 3. Ensure profile exists and is updated in project-service (MongoDB)
    try {
      const users = await request(`${PROJECT_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      const existingUser = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
      let finalProfile = null;
      if (!existingUser) {
        finalProfile = await request(`${PROJECT_URL}/api/users`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${loginData.token}` },
          body: JSON.stringify({
            name,
            email,
            role: authRole,
            department,
            collegeName,
            yearOfStudy,
            resumeId,
            resumeName,
            resumeUrl,
            skills
          }),
        });
      } else {
        // If profile exists, ensure collegeName and department are up to date from signup form
        finalProfile = await request(`${PROJECT_URL}/api/users/${existingUser.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${loginData.token}` },
          body: JSON.stringify({
            ...existingUser,
            name,
            collegeName: collegeName || existingUser.collegeName,
            department: department || existingUser.department,
            role: authRole,
            yearOfStudy: yearOfStudy || existingUser.yearOfStudy,
            resumeId: resumeId || existingUser.resumeId,
            resumeName: resumeName || existingUser.resumeName,
            resumeUrl: resumeUrl || existingUser.resumeUrl,
            skills: skills && skills.length > 0 ? skills : existingUser.skills
          }),
        });
      }

      if (finalProfile) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const currentUser = JSON.parse(storedUser);
          currentUser.team = finalProfile.team || currentUser.team || 'Not Assigned';
          currentUser.collegeName = finalProfile.collegeName || currentUser.collegeName || '';
          currentUser.department = finalProfile.department || currentUser.department || 'Computer Science & Engineering';
          currentUser.yearOfStudy = finalProfile.yearOfStudy || '';
          currentUser.resumeId = finalProfile.resumeId || '';
          currentUser.resumeName = finalProfile.resumeName || '';
          currentUser.resumeUrl = finalProfile.resumeUrl || '';
          currentUser.skills = finalProfile.skills || [];
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    } catch (err) {
      console.warn('Auto profile syncing to project-service failed:', err);
    }

    return loginData;
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

  async listAllSubmissions() {
    return await request(`${PROJECT_URL}/api/projects/submissions`);
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

    async uploadFile(file) {
    if (!file) {
      throw new Error('No file selected');
    }

    const formData = new FormData();

    // IMPORTANT:
    // Send the original File object directly.
    // Do not convert it to text, JSON, Base64, or anything else.
    formData.append('file', file, file.name);

    const token = localStorage.getItem('token');

    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${PROJECT_URL}/api/files/upload`,
      {
        method: 'POST',
        headers,
        body: formData
      }
    );

    if (!response.ok) {
      let message = `Upload failed with status: ${response.status}`;

      try {
        const errorText = await response.text();

        if (errorText) {
          message = errorText;
        }
      } catch (error) {
        console.error('Unable to read upload error:', error);
      }

      throw new Error(message);
    }

    const data = await response.json();

    /*
     * The backend MUST return the ID of the stored file.
     *
     * Example:
     * {
     *   id: "...",
     *   fileName: "report.pdf",
     *   contentType: "application/pdf",
     *   fileSize: "12345",
     *   fileUrl: "..."
     * }
     */

    if (!data || !data.id) {
      throw new Error(
        'File was uploaded but the server did not return a file ID.'
      );
    }

    return {
      id: data.id,

      fileName:
        data.fileName || file.name,

      contentType:
        data.contentType ||
        file.type ||
        'application/octet-stream',

      fileSize:
        data.fileSize ||
        String(file.size),

      fileUrl:
        data.fileUrl ||
        `${PROJECT_URL}/api/files/download/${data.id}`
    };
  },

  async extractSkills(fileId) {
    if (!fileId) {
      throw new Error('No file ID provided for skill extraction');
    }
    const response = await fetch(
      `${PROJECT_URL}/api/users/extract-skills`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileId })
      }
    );
    if (!response.ok) {
      throw new Error('Skills extraction failed');
    }
    const data = await response.json();
    const rawSkills = data.skills || [];
    return cleanAndDeduplicateSkills(rawSkills);
  },

  async downloadFile(fileIdOrUrl) {
    if (
      !fileIdOrUrl ||
      fileIdOrUrl === '#' ||
      fileIdOrUrl === 'undefined' ||
      fileIdOrUrl === 'null' ||
      fileIdOrUrl === '' ||
      (typeof fileIdOrUrl === 'string' && fileIdOrUrl.endsWith('/api/files/download/'))
    ) {
      throw new Error('No valid file ID or file URL provided');
    }

    // 1. Try to extract fileId and check local IndexedDB first
    let fileId = null;
    if (typeof fileIdOrUrl === 'string') {
      if (fileIdOrUrl.startsWith('local-file:')) {
        fileId = fileIdOrUrl.substring('local-file:'.length);
      } else if (fileIdOrUrl.includes('/api/files/download/')) {
        fileId = fileIdOrUrl.split('/api/files/download/')[1];
      } else if (!fileIdOrUrl.startsWith('http://') && !fileIdOrUrl.startsWith('https://')) {
        fileId = fileIdOrUrl;
      }
    }

    if (fileId) {
      try {
        const localBlob = await fileStorage.getFile(fileId);
        if (localBlob && localBlob.size > 0) {
          console.log('Retrieving file from local IndexedDB storage:', fileId);
          return localBlob;
        }
      } catch (err) {
        console.warn('Failed to retrieve file from IndexedDB:', err);
      }
    }

    // 2. Fall back to backend fetch
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url;
    if (
      typeof fileIdOrUrl === 'string' &&
      (fileIdOrUrl.startsWith('http://') || fileIdOrUrl.startsWith('https://'))
    ) {
      url = fileIdOrUrl;
    } else {
      url = `${PROJECT_URL}/api/files/download/${fileIdOrUrl}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      return blob;
    } catch (err) {
      console.warn('Backend download failed, attempting final local IndexedDB fallback:', err);
      if (fileId) {
        const fallbackBlob = await fileStorage.getFile(fileId);
        if (fallbackBlob && fallbackBlob.size > 0) {
          return fallbackBlob;
        }
      }
      throw err;
    }
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

  async deleteTeam(id) {
    return await request(`${PROJECT_URL}/api/teams/${id}`, {
      method: 'DELETE',
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
  },

  async reanalyzeWeeklyReport(projectId, reportId) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/reports/${reportId}/analyze`, {
      method: 'POST',
    });
  },
  
  async deleteWeeklyReport(projectId, reportId) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/reports/${reportId}`, {
      method: 'DELETE',
    });
  },

  async updateWeeklyReport(projectId, reportId, reportData) {
    return await request(`${PROJECT_URL}/api/projects/${projectId}/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  },

  async listNotifications() {
    return await request(`${PROJECT_URL}/api/notifications`, {
      method: 'GET',
    });
  },

  async createNotification(notificationData) {
    return await request(`${PROJECT_URL}/api/notifications`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  async deleteNotification(id) {
    return await request(`${PROJECT_URL}/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  async clearNotifications() {
    return await request(`${PROJECT_URL}/api/notifications`, {
      method: 'DELETE',
    });
  },

  async listSuggestions() {
    return await request(`${PROJECT_URL}/api/suggestions`, {
      method: 'GET',
    });
  },

  async getSuggestionsByProject(projectId) {
    return await request(`${PROJECT_URL}/api/suggestions/project/${projectId}`, {
      method: 'GET',
    });
  },

  async getSuggestionsByRecipient(email) {
    return await request(`${PROJECT_URL}/api/suggestions/email/${email}`, {
      method: 'GET',
    });
  },

  async getSuggestionsByTeam(teamName) {
    return await request(`${PROJECT_URL}/api/suggestions/team/${teamName}`, {
      method: 'GET',
    });
  },

  async createSuggestion(suggestionData) {
    return await request(`${PROJECT_URL}/api/suggestions`, {
      method: 'POST',
      body: JSON.stringify(suggestionData),
    });
  },

  async deleteSuggestion(id) {
    return await request(`${PROJECT_URL}/api/suggestions/${id}`, {
      method: 'DELETE',
    });
  },

  // Member Metrics API
  async listAllMemberMetrics() {
    return await request(`${PROJECT_URL}/api/member-metrics`);
  },

  async getMemberMetricsByTeam(teamName) {
    return await request(`${PROJECT_URL}/api/member-metrics/team/${encodeURIComponent(teamName)}`);
  },

  async getMemberMetricsByEmail(email) {
    return await request(`${PROJECT_URL}/api/member-metrics/member/${encodeURIComponent(email)}`);
  },

  async saveOrUpdateMemberMetric(metricData) {
    return await request(`${PROJECT_URL}/api/member-metrics`, {
      method: 'POST',
      body: JSON.stringify(metricData),
    });
  }
};

export const addNotification = async (title, message, targetEmail = null, targetTeam = null, type = 'info') => {
  try {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      type,
      targetEmail: targetEmail ? targetEmail.toLowerCase() : null,
      targetTeam: targetTeam ? targetTeam.toLowerCase() : null
    };

    // Save to backend database!
    try {
      await api.createNotification(newNotif);
    } catch (dbErr) {
      console.warn('Failed to save notification to backend:', dbErr);
    }

    // LocalStorage fallback for offline/instant sync
    const stored = localStorage.getItem('notifications');
    const list = stored ? JSON.parse(stored) : [];
    if (!list.some(n => n.id === newNotif.id)) {
      list.unshift(newNotif);
    }
    const serialized = JSON.stringify(list);
    localStorage.setItem('notifications', serialized);
    const storageEvent = new StorageEvent('storage', {
      key: 'notifications',
      newValue: serialized,
      storageArea: localStorage
    });
    window.dispatchEvent(storageEvent);
  } catch (e) {
    console.error('Failed to dispatch notification:', e);
  }
};

export const seedHistoricalNotifications = async () => {
  try {
    const stored = localStorage.getItem('notifications');
    let notificationsList = stored ? JSON.parse(stored) : [];

    // Fetch from backend
    let backendNotifs = [];
    try {
      backendNotifs = await api.listNotifications() || [];
    } catch (err) {
      console.warn('Failed to fetch notifications from backend:', err);
    }

    let updated = false;
    // Merge any backend notifications not present locally
    backendNotifs.forEach(bn => {
      if (!notificationsList.some(n => n.id === bn.id)) {
        notificationsList.push(bn);
        updated = true;
      }
    });

    if (updated) {
      const serialized = JSON.stringify(notificationsList);
      localStorage.setItem('notifications', serialized);
      const storageEvent = new StorageEvent('storage', {
        key: 'notifications',
        newValue: serialized,
        storageArea: localStorage
      });
      window.dispatchEvent(storageEvent);
    }
  } catch (e) {
    console.error('Failed to sync notifications:', e);
  }
};
