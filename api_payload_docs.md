# ProjectPilot API Payload Catalog

This catalog outlines the request and response JSON payloads for all endpoints in the `auth-service` (Oracle) and `project-service` (MongoDB).

---

## 1. Authentication & Users (`auth-service` - Port 8081)

### 🔐 Register User
* **Method**: `POST`
* **Endpoint**: `http://localhost:8081/api/auth/register`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Ankit Sharma",
    "email": "ankit.s@pp.edu",
    "password": "PASSWORD",
    "role": "STUDENT"
  }
  ```
* **Response Body (Text)**:
  ```text
  User registered successfully
  ```

### 🔐 Login User
* **Method**: `POST`
* **Endpoint**: `http://localhost:8081/api/auth/login`
* **Request Body (JSON)**:
  ```json
  {
    "email": "ankit.s@pp.edu",
    "password": "PASSWORD"
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
    "tokenType": "Bearer",
    "userId": 1,
    "email": "ankit.s@pp.edu",
    "role": "STUDENT"
  }
  ```

### 🔐 Current User Session
* **Method**: `GET`
* **Endpoint**: `http://localhost:8081/api/users/me`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (Text)**:
  ```text
  Logged in as: ankit.s@pp.edu
  ```

---

## 2. User Profiles CRUD (`project-service` - Port 8082)

### 💼 List All Users
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/users`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**:
  ```json
  [
    {
      "id": "64c5fae4f1a23c4a9c8d2345",
      "fullName": "Jane Doe",
      "email": "jane.doe@pp.edu",
      "password": "PASSWORD",
      "collegeName": "ABC Engineering College",
      "department": "Computer Science",
      "role": "STUDENT"
    }
  ]
  ```

### 💼 Get User by ID
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/users/64c5fae4f1a23c4a9c8d2345`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**:
  ```json
  {
    "id": "64c5fae4f1a23c4a9c8d2345",
    "fullName": "Jane Doe",
    "email": "jane.doe@pp.edu",
    "password": "PASSWORD",
    "collegeName": "ABC Engineering College",
    "department": "Computer Science",
    "role": "STUDENT"
  }
  ```

### 💼 Create User
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/users`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane.doe@pp.edu",
    "password": "PASSWORD",
    "collegeName": "ABC Engineering College",
    "department": "Computer Science",
    "role": "STUDENT"
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "id": "64c5fae4f1a23c4a9c8d2345",
    "fullName": "Jane Doe",
    "email": "jane.doe@pp.edu",
    "password": "PASSWORD",
    "collegeName": "ABC Engineering College",
    "department": "Computer Science",
    "role": "STUDENT"
  }
  ```

### 💼 Update User
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/users/64c5fae4f1a23c4a9c8d2345`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "fullName": "Jane Doe Updated",
    "email": "jane.doe@pp.edu",
    "password": "NEWPASSWORD",
    "collegeName": "ABC Engineering College",
    "department": "Information Technology",
    "role": "TEAM_LEADER"
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "id": "64c5fae4f1a23c4a9c8d2345",
    "fullName": "Jane Doe Updated",
    "email": "jane.doe@pp.edu",
    "password": "NEWPASSWORD",
    "collegeName": "ABC Engineering College",
    "department": "Information Technology",
    "role": "TEAM_LEADER"
  }
  ```

### 💼 Delete User
* **Method**: `DELETE`
* **Endpoint**: `http://localhost:8082/api/users/64c5fae4f1a23c4a9c8d2345`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Status**: `204 No Content` (Empty Response Body)

---

## 3. Projects Management (`project-service` - Port 8082)

### 🚀 List All Projects
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/projects`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**:
  ```json
  [
    {
      "id": "64c5fb5ef1a23c4a9c8d2346",
      "name": "AI Attendance System",
      "domain": "Machine Learning",
      "health": 96,
      "phase": "Implementation Phase",
      "mentorName": "Dr. Kumar",
      "progress": 82,
      "status": "Healthy",
      "description": "Real-time attendance facial recognition tracker.",
      "commits": 142,
      "prs": 18,
      "issuesClosed": 24,
      "contributionPercentage": 72,
      "repoUrl": "https://github.com/projectpilot/smart-attendance",
      "teamName": "Team Alpha",
      "tasks": [],
      "milestones": [],
      "weeklyReports": []
    }
  ]
  ```

### 🚀 Get Project Details (Includes embedded Tasks, Milestones, Reports)
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**:
  ```json
  {
    "id": "64c5fb5ef1a23c4a9c8d2346",
    "name": "AI Attendance System",
    "domain": "Machine Learning",
    "health": 96,
    "phase": "Implementation Phase",
    "mentorName": "Dr. Kumar",
    "progress": 82,
    "status": "Healthy",
    "description": "Real-time attendance facial recognition tracker.",
    "commits": 142,
    "prs": 18,
    "issuesClosed": 24,
    "contributionPercentage": 72,
    "repoUrl": "https://github.com/projectpilot/smart-attendance",
    "teamName": "Team Alpha",
    "tasks": [
      {
        "id": "t1-1",
        "name": "Set up OpenCV pipeline",
        "assignedDate": "2026-06-01",
        "deadline": "2026-06-08",
        "priority": "High",
        "status": "Completed"
      }
    ],
    "milestones": [
      {
        "id": "m1-1",
        "name": "Requirement analysis",
        "dueDate": "2026-06-05",
        "progress": 100,
        "status": "Completed"
      }
    ],
    "weeklyReports": [
      {
        "id": "w1-1",
        "week": "Week 1",
        "submissionStatus": "Submitted",
        "submittedDate": "2026-06-07",
        "remarks": "Clean implementation.",
        "fileUrl": "https://drive.google.com/test-sprint1"
      }
    ]
  }
  ```

### 🚀 Create Project
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/projects`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "AI Attendance System",
    "domain": "Machine Learning",
    "phase": "Implementation Phase",
    "mentorName": "Dr. Kumar",
    "description": "Real-time attendance facial recognition tracker."
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "id": "64c5fb5ef1a23c4a9c8d2346",
    "name": "AI Attendance System",
    "domain": "Machine Learning",
    "health": 100,
    "phase": "Implementation Phase",
    "mentorName": "Dr. Kumar",
    "progress": 0,
    "status": "Healthy",
    "description": "Real-time attendance facial recognition tracker.",
    "commits": 0,
    "prs": 0,
    "issuesClosed": 0,
    "contributionPercentage": 0,
    "repoUrl": null,
    "teamName": null,
    "tasks": [],
    "milestones": [],
    "weeklyReports": []
  }
  ```

### 🚀 Update Project
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "AI Attendance System",
    "domain": "Computer Vision",
    "health": 95,
    "phase": "Testing Phase",
    "mentorName": "Dr. Kumar",
    "progress": 90,
    "status": "Healthy",
    "description": "WebGL CNN real-time attendance tracker.",
    "commits": 160,
    "prs": 20,
    "issuesClosed": 26,
    "contributionPercentage": 75,
    "repoUrl": "https://github.com/projectpilot/smart-attendance",
    "teamName": "Team Alpha"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON.

---

## 4. Teams Management (`project-service` - Port 8082)

### 👥 List All Teams
* **Method**: `GET`
* **Endpoint**: `http://localhost:8082/api/teams`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**:
  ```json
  [
    {
      "id": "64c5fc5ef1a23c4a9c8d2347",
      "name": "Team Alpha",
      "projectId": "64c5fb5ef1a23c4a9c8d2346",
      "projectName": "AI Attendance System",
      "mentorName": "Dr. Kumar",
      "health": 96,
      "leaderName": "Ankit Sharma",
      "membersCount": 4,
      "status": "Excellent",
      "rank": 1
    }
  ]
  ```

### 👥 Create Team
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/teams`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Team Alpha",
    "projectId": "64c5fb5ef1a23c4a9c8d2346",
    "projectName": "AI Attendance System",
    "mentorName": "Dr. Kumar",
    "leaderName": "Ankit Sharma",
    "membersCount": 4
  }
  ```
* **Response Body (JSON)**: Returns the created Team document JSON.

### 👥 Update Team (Assign Mentors, Change Ranks/Status)
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/teams/64c5fc5ef1a23c4a9c8d2347`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Team Alpha",
    "projectId": "64c5fb5ef1a23c4a9c8d2346",
    "projectName": "AI Attendance System",
    "mentorName": "Prof. Sharma",
    "health": 96,
    "leaderName": "Ankit Sharma",
    "membersCount": 5,
    "status": "Excellent",
    "rank": 1
  }
  ```
* **Response Body (JSON)**: Returns the updated Team document JSON.

---

## 5. Tasks Operations (`project-service` - Port 8082)

### 📋 Add Task to Project
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/tasks`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Optimize CNN model using WASM",
    "deadline": "2026-08-15",
    "priority": "High"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON containing the new Task (with its generated String ID).

### 📋 Update Project Task (Change status to In Progress / Completed)
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/tasks/REPLACE_WITH_TASK_ID`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Optimize CNN model using WASM",
    "deadline": "2026-08-15",
    "priority": "High",
    "status": "Completed"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON.

### 📋 Delete Project Task
* **Method**: `DELETE`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/tasks/REPLACE_WITH_TASK_ID`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**: Returns the updated Project document JSON with the task removed.

---

## 6. Milestones (`project-service` - Port 8082)

### 🎯 Add Milestone to Project
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/milestones`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Deploy CNN to Cloud Server",
    "dueDate": "2026-08-30"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON containing the new Milestone.

### 🎯 Update Milestone (Change progress % and status)
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/milestones/REPLACE_WITH_MILESTONE_ID`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Deploy CNN to Cloud Server",
    "dueDate": "2026-08-30",
    "progress": 100,
    "status": "Completed"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON.

---

## 7. Reports & Reviews (`project-service` - Port 8082)

### 📊 Submit Weekly Report
* **Method**: `POST`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/reports`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "week": "Week 4 (Sprint 3 Summary)",
    "remarks": "Sprint 3 finished successfully. Ready for evaluation.",
    "fileUrl": "https://drive.google.com/test-sprint3-doc"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON containing the new WeeklyReport.

### 📊 Review Weekly Report (Mentor Remarks & Grade Approval)
* **Method**: `PUT`
* **Endpoint**: `http://localhost:8082/api/projects/64c5fb5ef1a23c4a9c8d2346/reports/REPLACE_WITH_REPORT_ID/review`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "remarks": "Excellent work. Model precision matches target. Approved.",
    "submissionStatus": "Approved"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project document JSON.
