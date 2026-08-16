# ProjectPilot API Payload Catalog

This catalog outlines the request and response JSON payloads for all 48 endpoints in the ProjectPilot microservices ecosystem: `auth-service` (Port 8081), `project-service` (Port 8082), and `ai-service` (Port 8083).

---

## 1. Authentication & Session (`auth-service` - Port 8081)

### 🔐 Register User
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
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
* **Endpoint**: `/api/auth/login`
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
* **Endpoint**: `/api/users/me`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (Text)**:
  ```text
  Logged in as: ankit.s@pp.edu
  ```

---

## 2. User Profiles CRUD (`project-service` - Port 8082)

### 💼 List All Users
* **Method**: `GET`
* **Endpoint**: `/api/users`
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
* **Endpoint**: `/api/users/{id}`
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
* **Endpoint**: `/api/users`
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
* **Endpoint**: `/api/users/{id}`
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
* **Response Body (JSON)**: Returns the updated User JSON structure.

### 💼 Delete User
* **Method**: `DELETE`
* **Endpoint**: `/api/users/{id}`
* **Headers**: `Authorization: Bearer <TOKEN>` (Requires role `ADMIN`)
* **Response Status**: `204 No Content`

---

## 3. Projects Management Core (`project-service` - Port 8082)

### 🚀 List All Projects
* **Method**: `GET`
* **Endpoint**: `/api/projects`
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
* **Endpoint**: `/api/projects/{id}`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Body (JSON)**: Returns complete Project document JSON.

### 🚀 Create Project
* **Method**: `POST`
* **Endpoint**: `/api/projects`
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
* **Response Body (JSON)**: Returns the newly initialized Project JSON.

### 🚀 Update Project
* **Method**: `PUT`
* **Endpoint**: `/api/projects/{id}`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**: Full project schema update body.
* **Response Body (JSON)**: Returns updated Project document JSON.

### 🚀 Delete Project
* **Method**: `DELETE`
* **Endpoint**: `/api/projects/{id}`
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response Status**: `204 No Content`

---

## 4. Project-Embedded Operations (`project-service` - Port 8082)

### 📋 Add Task to Project
* **Method**: `POST`
* **Endpoint**: `/api/projects/{id}/tasks`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Optimize CNN model using WASM",
    "deadline": "2026-08-15",
    "priority": "High"
  }
  ```
* **Response Body (JSON)**: Returns the updated Project JSON.

### 📋 Update Project Task
* **Method**: `PUT`
* **Endpoint**: `/api/projects/{id}/tasks/{taskId}`
* **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Request Body (JSON)**: Task fields to update.
* **Response Body (JSON)**: Returns the updated Project JSON.

### 📋 Delete Project Task
* **Method**: `DELETE`
* **Endpoint**: `/api/projects/{id}/tasks/{taskId}`
* **Response Body (JSON)**: Returns updated Project JSON.

### 🎯 Add Milestone to Project
* **Method**: `POST`
* **Endpoint**: `/api/projects/{id}/milestones`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Deploy CNN to Cloud Server",
    "dueDate": "2026-08-30"
  }
  ```
* **Response Body (JSON)**: Returns updated Project JSON containing the new Milestone.

### 🎯 Update Project Milestone
* **Method**: `PUT`
* **Endpoint**: `/api/projects/{id}/milestones/{milestoneId}`
* **Request Body (JSON)**:
  ```json
  {
    "name": "Deploy CNN to Cloud Server",
    "dueDate": "2026-08-30",
    "progress": 100,
    "status": "Completed"
  }
  ```
* **Response Body (JSON)**: Returns updated Project JSON.

### 📊 Submit Weekly Report
* **Method**: `POST`
* **Endpoint**: `/api/projects/{id}/reports`
* **Request Body (JSON)**:
  ```json
  {
    "week": "Week 4 (Sprint 3 Summary)",
    "remarks": "Sprint 3 finished successfully. Ready for evaluation.",
    "fileUrl": "http://localhost:8082/api/files/download/file-123",
    "fileName": "sprint3.pdf",
    "fileSize": "1.24 MB"
  }
  ```
* **Response Body (JSON)**: Returns updated Project JSON containing the WeeklyReport with Similarity details.

### 📊 Review Weekly Report
* **Method**: `PUT`
* **Endpoint**: `/api/projects/{id}/reports/{reportId}/review`
* **Request Body (JSON)**:
  ```json
  {
    "remarks": "Approved and graded.",
    "submissionStatus": "Approved"
  }
  ```
* **Response Body (JSON)**: Returns updated Project JSON.

### 📊 Re-run AI Analysis on Report
* **Method**: `POST`
* **Endpoint**: `/api/projects/{id}/reports/{reportId}/analyze`
* **Response Body (JSON)**: Returns updated Project JSON with refreshed AI parameters.

---

## 5. Standalone Component Direct APIs (`project-service` - Port 8082)

These endpoints provide direct access to the database entities.

### 👥 Teams CRUD (5 APIs)
* `GET /api/teams` — List teams.
* `GET /api/teams/{id}` — Get team details.
* `POST /api/teams` — Create team.
* `PUT /api/teams/{id}` — Update team details.
* `DELETE /api/teams/{id}` — Delete team.

### 📋 Tasks CRUD (5 APIs)
* `GET /api/tasks` — List tasks.
* `GET /api/tasks/{id}` — Get task details.
* `POST /api/tasks` — Create task.
* `PUT /api/tasks/{id}` — Update task.
* `DELETE /api/tasks/{id}` — Delete task.

### 🎯 Milestones CRUD (5 APIs)
* `GET /api/milestones` — List milestones.
* `GET /api/milestones/{id}` — Get milestone details.
* `POST /api/milestones` — Create milestone.
* `PUT /api/milestones/{id}` — Update milestone.
* `DELETE /api/milestones/{id}` — Delete milestone.

---

## 6. Feedback & Suggestions (`project-service` - Port 8082)

### 💬 List Suggestions
* **Method**: `GET`
* **Endpoint**: `/api/suggestions`

### 💬 Get Suggestions by Project, Recipient, or Team
* **Method**: `GET`
* **Endpoints**: 
  * `/api/suggestions/project/{projectId}`
  * `/api/suggestions/email/{email}`
  * `/api/suggestions/team/{teamName}`

### 💬 Create Suggestion / Feedback Comment
* **Method**: `POST`
* **Endpoint**: `/api/suggestions`
* **Request Body (JSON)**:
  ```json
  {
    "projectId": "64c5fb5ef1a23c4a9c8d2346",
    "teamName": "SafeNova",
    "recipientEmail": "mithula.s@gmail.com",
    "commentText": "Consider optimizing your database query structures.",
    "mentorName": "Dr. Anusha Kaur"
  }
  ```

### 💬 Delete Suggestion
* **Method**: `DELETE`
* **Endpoint**: `/api/suggestions/{id}`

---

## 7. Notifications Log System (`project-service` - Port 8082)

### 🔔 List Notifications
* **Method**: `GET`
* **Endpoint**: `/api/notifications`

### 🔔 Publish Notification
* **Method**: `POST`
* **Endpoint**: `/api/notifications`
* **Request Body (JSON)**:
  ```json
  {
    "title": "Task Report Uploaded",
    "message": "Team member Mithula S uploaded a report for task Figma design.",
    "time": "09:02 AM",
    "date": "2026-08-14",
    "type": "info",
    "targetEmail": "anusha.k@pp.edu",
    "targetTeam": "SafeNova"
  }
  ```

### 🔔 Delete / Clear Notifications
* **Method**: `DELETE`
* **Endpoints**:
  * `/api/notifications/{id}` (Delete specific log entry)
  * `/api/notifications` (Clear all notification logs)

---

## 8. File Upload & Binary Storage (`project-service` - Port 8082)

### 📂 Upload File
* **Method**: `POST`
* **Endpoint**: `/api/files/upload`
* **Request Body (Form Data)**: Multipart file binary.
* **Response Body (JSON)**:
  ```json
  {
    "id": "file-1723635399090",
    "fileName": "ERD.png",
    "contentType": "image/png",
    "fileUrl": "http://localhost:8082/api/files/download/file-1723635399090"
  }
  ```

### 📂 Download/View File
* **Method**: `GET`
* **Endpoint**: `/api/files/download/{id}`
* **Response**: Binary File Stream response.

---

## 9. Individual Member GitHub Metrics (`project-service` - Port 8082)

### 📈 Fetch Metrics
* **Method**: `GET`
* **Endpoints**:
  * `/api/member-metrics` (List all)
  * `/api/member-metrics/team/{teamName}` (Get team records)
  * `/api/member-metrics/member/{memberEmail}` (Get student record)

### 📈 Update Metrics Count
* **Method**: `POST`
* **Endpoint**: `/api/member-metrics`
* **Request Body (JSON)**:
  ```json
  {
    "memberName": "Mithula S",
    "memberEmail": "mithula.s@gmail.com",
    "teamName": "SafeNova",
    "commitsCount": 9,
    "prsCount": 1
  }
  ```

---

## 10. AI Engine Auditing (`ai-service` - Port 8083)

FastAPI microservice executing Machine Learning prediction models.

### 🧠 Calculate Semantic Text Similarity
* **Method**: `POST`
* **Endpoint**: `/api/ai/similarity`
* **Request Body (JSON)**:
  ```json
  {
    "text": "Implementation of OpenCV face recognition",
    "compare_texts": [
      {
        "id": "rep-1",
        "text": "OpenCV real-time video streaming face detection"
      }
    ]
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "similarityScore": 75.5,
    "matchedReportId": "rep-1"
  }
  ```

### 🧠 Detect AI-Generated Text Probability
* **Method**: `POST`
* **Endpoint**: `/api/ai/detect-ai`
* **Request Body (JSON)**:
  ```json
  {
    "text": "In conclusion, this project is pivotal furthermore moreover..."
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "aiProbability": 88.5
  }
  ```

### 🧠 Combined File Extraction & Integrity Audit
* **Method**: `POST`
* **Endpoint**: `/api/ai/analyze-file`
* **Request Body (JSON)**:
  ```json
  {
    "file_content_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "content_type": "image/png",
    "file_name": "ERD.png",
    "remarks": "Figma design report",
    "compare_texts": [
      {
        "id": "rep-1",
        "text": "Previous Figma mockups"
      }
    ]
  }
  ```
* **Response Body (JSON)**:
  ```json
  {
    "similarityScore": 15.2,
    "matchedReportId": "rep-1",
    "aiProbability": 12.0,
    "extractedText": "Figma layout workspace canvas login register dashboard"
  }
  ```
