# ProjectPilot 🚀

ProjectPilot is an AI-assisted academic project management and monitoring platform built for student project teams, team leaders, mentors, and administrators. It combines project planning, task and milestone tracking, weekly reports, team management, performance monitoring, notifications, file handling, and AI-assisted analysis in one application.

The repository contains a **React + Vite frontend** and three **backend microservices**:

- `auth-service` (Java Spring Boot) – authentication, registration, roles, JWT generation, and MySQL persistence (Port 8081).
- `project-service` (Java Spring Boot) – projects, teams, tasks, milestones, reports, notifications, suggestions, files, and member metrics (Port 8082).
- `ai-service` (Python FastAPI) – standalone, independent AI & NLP microservice for resume skill extraction, AI content detection, semantic similarity comparison, and document parsing (Port 8083).
- React frontend – role-based dashboards and modern user interface (Port 5173).

---

## 📌 Main Features

### Authentication and User Management
- User registration and login.
- JWT-based authentication.
- Role-based access.
- Student, Team Leader, Mentor, and System Administrator workflows.
- User profile management.
- Resume upload and skill extraction.
- Google authentication UI components are included in the frontend.

### Project Management
- Create, view, update, and delete projects.
- Track project domain, description, phase, status, progress, and health.
- Assign teams and mentors.
- View project details from role-specific dashboards.

### Team Management
- Create and manage teams.
- Assign team leaders, mentors, and members.
- View team details and member information.
- Monitor team-level project progress.

### Tasks and Milestones
- Create and assign tasks.
- Set task deadlines and status.
- Create milestones and monitor completion.
- Automatic deadline reminder logic for upcoming tasks and milestones.

### Reports
- Submit weekly reports.
- Review reports as a mentor.
- Re-analyze reports.
- Update and delete reports.
- Track report similarity and AI-generated-text probability.

### AI-Assisted Analysis
The application includes a standalone Python AI microservice (`ai-service`) operating 100% independently without any external LLM or Google Gemini APIs:

- AI-generated text probability analysis for weekly reports (burstiness, perplexity heuristics, discourse markers, lexical diversity).
- Semantic and lexical similarity analysis between reports using sublinear TF-IDF and cosine vectorization.
- Deterministic text embeddings for report comparison and caching.
- Resume text and technical skill extraction across categorized software development domains.
- Native document text extraction (PDF, DOCX, TXT, Base64).
- Weekly report auditing and automatic threshold flagging (Similarity >= 50% or AI probability >= 60%).

### Performance and Contributions
- Team/member performance views.
- Member metrics.
- Contribution percentages.
- GitHub contribution information can be displayed through the project data and frontend contribution components.

### Files and Documents
- Upload project-related files.
- Store files in the backend database.
- Download uploaded files.
- Browser-side IndexedDB is also used as a local fallback for file storage.

### Notifications
- Project notifications.
- Task deadline reminders.
- Milestone deadline reminders.
- Team/member/mentor notification targeting.
- Backend persistence with local-storage fallback.

### UI
- Responsive React interface.
- Role-specific navigation.
- Dashboard cards and data tables.
- Dark/light theme support.
- Tailwind CSS styling.
- React Icons.

---

# 🏗️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React 19 | User interface |
| Vite 8 | Frontend development server and build tool |
| JavaScript / JSX | Application development |
| Tailwind CSS 3 | Styling and responsive UI |
| React Icons | Icons |
| Context API | Application/page/theme state |
| LocalStorage | Client-side session and fallback data |
| IndexedDB | Local file fallback storage |

## Backend

| Technology | Purpose |
|---|---|
| Java 21 | Backend programming language |
| Spring Boot 4.1 | Backend framework |
| Spring Web | REST APIs |
| Spring Security | Authentication and authorization |
| Spring Data JPA | MySQL persistence |
| Spring Data MongoDB | MongoDB persistence |
| JJWT 0.13 | JWT creation and verification |
| FastAPI / Uvicorn | Python AI microservice (Port 8083) |
| Scikit-learn / NumPy | TF-IDF, embeddings & cosine similarity |

## Databases

### MySQL
Used by `auth-service` for authentication/user credentials and role information.

Default database configuration:

```text
Database: projectpilot
Host: localhost
Port: 3306
```

### MongoDB
Used by `project-service` for application/project data.

Default database configuration:

```text
Database: projectpilot
Host: localhost
Port: 27017
```

MongoDB stores entities such as:

- Users
- Projects
- Teams
- Tasks
- Milestones
- Weekly Reports
- Notifications
- Suggestions
- Member Metrics
- Uploaded Files
- Similarity Records
- AI Detection Records

---

# 📁 Project Structure

```text
ProjectPilot/
│
├── src/
│   ├── components/
│   │   ├── AIInsights.jsx
│   │   ├── GithubContributionCard.jsx
│   │   ├── HealthScoreCard.jsx
│   │   ├── MentorFeedbackCard.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ReportCard.jsx
│   │   ├── TaskCard.jsx
│   │   ├── TeamCard.jsx
│   │   └── ...
│   │
│   ├── context/
│   │   ├── PageContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── usePage.js
│   │   └── useTheme.js
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── MentorDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── TeamLeaderDashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Teams.jsx
│   │   ├── Tasks.jsx
│   │   ├── Milestones.jsx
│   │   ├── Reports.jsx
│   │   ├── WeeklyReports.jsx
│   │   ├── Performance.jsx
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── api.js
│   │   ├── fileStorage.js
│   │   └── reminders.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── Backend/
│   ├── auth-service/
│   │   ├── pom.xml
│   │   └── src/
│   │
│   └── project-service/
│       ├── pom.xml
│       └── src/
│
├── public/
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

# 💻 Prerequisites

Install the following before running ProjectPilot.

## 1. Node.js and npm

Install a current LTS version of Node.js.

Verify:

```bash
node -v
npm -v
```

The frontend uses npm and Vite.

## 2. Java JDK 21

The backend Maven projects are configured for Java 21.

Verify:

```bash
java -version
```

You should see Java 21 or a compatible Java 21 installation.

## 3. Maven

Install Apache Maven.

Verify:

```bash
mvn -version
```

Maven is required to build and run both Spring Boot services.

## 4. MySQL Server

Install MySQL Server and make sure it is running.

Verify that MySQL is available on:

```text
localhost:3306
```

The application is configured to use a database named:

```text
projectpilot
```

The configured JPA setting allows the database to be created automatically if it does not already exist, provided the MySQL user has permission to create databases.

## 5. MongoDB

Install MongoDB Community Server or use a local MongoDB installation.

The project expects:

```text
mongodb://localhost:27017/projectpilot
```

Make sure MongoDB is running before starting `project-service`.

## 6. Python AI Microservice (ai-service)

The AI capabilities run as a dedicated, standalone Python FastAPI microservice located in `Backend/ai-service`.

To install and run:

```bash
cd Backend/ai-service
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8083 --reload
```

No external API keys (Gemini, OpenAI, etc.) are needed. The service runs completely offline and independent.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ProjectPilot
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository URL.

---

# 🎨 Frontend Setup

Open a terminal in the project root:

```bash
npm install
```

This installs the dependencies listed in `package.json`, including:

- React
- React DOM
- Vite
- Tailwind CSS
- React Icons
- Oxlint
- Vite React plugin

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL, normally:

```text
http://localhost:5173
```

Open that address in a browser.

---

# 🔐 Backend Configuration

The frontend currently communicates with:

```text
Auth Service:    http://localhost:8081
Project Service: http://localhost:8082
```

These URLs are defined in:

```text
src/utils/api.js
```

If the backend ports are changed, update the frontend API configuration accordingly.

---

# 🔑 Auth Service Setup

Navigate to:

```bash
cd Backend/auth-service
```

Build the service:

```bash
mvn clean install
```

Run it:

```bash
mvn spring-boot:run
```

The service starts on:

```text
http://localhost:8081
```

### Auth Service Responsibilities

The authentication service handles:

- Registration
- Login
- User credentials
- Password authentication
- Role information
- JWT generation
- Current-user/session endpoint
- MySQL persistence

The JWT secret must be configured consistently with the project service.

---

# 📊 Project Service Setup

Open another terminal and navigate to:

```bash
cd Backend/project-service
```

Build:

```bash
mvn clean install
```

Run:

```bash
mvn spring-boot:run
```

The service starts on:

```text
http://localhost:8082
```

### Project Service Responsibilities

The project service handles:

- Users
- Projects
- Teams
- Tasks
- Milestones
- Weekly reports
- Notifications
- Suggestions
- Member metrics
- File uploads/downloads
- AI analysis
- Similarity analysis
- AI detection records

---

# 🧠 AI Microservice (`ai-service`)

The AI functionality is encapsulated in the independent Python microservice:

```text
Backend/ai-service/
├── main.py
├── services/
│   ├── document_parser.py
│   ├── skill_extractor.py
│   ├── ai_detector.py
│   └── similarity_engine.py
├── requirements.txt
└── run.bat
```

The AI microservice performs:

1. Extracting text from uploaded documents (PDF, DOCX, TXT).
2. Extracting technical skills and categorizing competencies from resumes.
3. Estimating AI-generated text probability using linguistic burstiness and marker heuristics.
4. Generating dense text vector embeddings.
5. Performing TF-IDF cosine similarity analysis across historical reports.

Spring Boot `project-service` communicates with `ai-service` via REST client at `http://localhost:8083` (`ai.service.url`).

---

# 🔄 How the Application Works

The overall architecture is:

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │   Vite + Tailwind    │
                    └──────────┬───────────┘
                               │
                      REST API + JWT
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
        ┌────────▼────────┐        ┌─────────▼────────┐
        │   Auth Service  │        │ Project Service  │
        │ Spring Boot     │        │ Spring Boot      │
        │ Port 8081       │        │ Port 8082        │
        └────────┬────────┘        └────┬────────┬────┘
                 │                      │        │
              MySQL                  MongoDB     │ REST
                 │                               │
                                       ┌─────────▼────────┐
                                       │    AI Service    │
                                       │  Python FastAPI  │
                                       │    Port 8083     │
                                       └──────────────────┘
```

### Authentication Flow

1. User opens ProjectPilot.
2. User registers or logs in.
3. React sends credentials to `auth-service`.
4. Auth service validates the credentials.
5. A JWT is generated.
6. React stores the token in browser local storage.
7. Subsequent API requests send the JWT in the `Authorization` header.
8. `project-service` verifies the same JWT secret before processing protected requests.

---

# 👤 Using ProjectPilot

## Step 1 – Create an Account

Open:

```text
http://localhost:5173
```

Select **Sign Up**.

Enter the required account details and select the appropriate role.

The registration process:

```text
Frontend
   ↓
Auth Service
   ↓
MySQL
   ↓
Login / JWT
   ↓
Project Service Profile
   ↓
MongoDB
```

---

# 🔓 Login

Select **Login** and provide:

- Email
- Password

After successful authentication, ProjectPilot stores the JWT and redirects the user to the appropriate role-based experience.

---

# 🎓 Student Workflow

A student can use ProjectPilot to:

1. Log in.
2. View the student dashboard.
3. View assigned projects.
4. View team information.
5. Check assigned tasks.
6. Track milestones.
7. Submit weekly reports.
8. Upload supporting documents.
9. View project health and progress.
10. View suggestions and notifications.
11. View performance/contribution information.

---

# 👨‍💼 Team Leader Workflow

A Team Leader can:

1. View team dashboard.
2. Monitor team members.
3. View project progress.
4. Assign tasks.
5. Monitor task deadlines.
6. Track milestones.
7. Review team activity.
8. Monitor weekly submissions.
9. View performance metrics.
10. Monitor project health.
11. Receive deadline notifications.

---

# 👨‍🏫 Mentor Workflow

A Mentor can:

1. View assigned projects.
2. Monitor project progress.
3. Review weekly reports.
4. Provide feedback.
5. Review project health.
6. View team performance.
7. Review AI-assisted analysis.
8. Monitor similarity and AI-generated-text indicators.
9. View suggestions and project risks.

---

# 🛡️ Administrator Workflow

The System Administrator can manage platform-level information such as:

- Users
- Teams
- Projects
- Mentors
- Team leaders
- Platform activity
- Administrative dashboards

---

# 📑 Weekly Report Analysis

When a weekly report is submitted, the backend can perform several analysis steps.

Conceptually:

```text
Weekly Report
     │
     ├── Extract report text
     │
     ├── AI-generated text analysis
     │
     ├── Semantic similarity analysis
     │
     ├── Compare with previous reports
     │
     └── Save analysis results
```

The similarity process uses TF-IDF and cosine vectorization from the Python `ai-service`.

If the Python `ai-service` is temporarily offline, `project-service` seamlessly falls back to a local Java cosine similarity calculation.

> AI detection and similarity scores should be treated as indicators rather than definitive proof of plagiarism or AI authorship.

---

# 📄 File Uploads

ProjectPilot supports file upload functionality through the project service.

The configured maximum upload size is:

```text
50 MB
```

Uploaded files can be:

- Stored in the backend database.
- Retrieved through the file download endpoint.
- Temporarily/fallback stored in browser IndexedDB.

The frontend file-storage helper is:

```text
src/utils/fileStorage.js
```

---

# 🔔 Notifications and Reminders

ProjectPilot automatically checks upcoming task and milestone deadlines.

A reminder can be generated when a task or milestone is due within approximately three days.

Notifications can target:

- Assigned student
- Team Leader
- Mentor
- Team members

Notifications are persisted through the project service, with local browser storage used as a fallback.

---

# 🧪 Testing

## Frontend Build

Run:

```bash
npm run build
```

If the build succeeds, the production bundle is generated in:

```text
dist/
```

## Linting

Run:

```bash
npm run lint
```

## Production Preview

After building:

```bash
npm run preview
```

---

# 🔌 API Communication

The frontend centralizes API communication in:

```text
src/utils/api.js
```

The main backend base URLs are:

```text
http://localhost:8081
http://localhost:8082
```

The API utility automatically attaches the JWT when a token is available.

Example request pattern:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 🗄️ Database Initialization

## MySQL

The auth service uses:

```text
jdbc:mysql://localhost:3306/projectpilot
```

Hibernate is configured with:

```text
spring.jpa.hibernate.ddl-auto=update
```

This allows Hibernate to update/create the required relational tables based on the entities.

## MongoDB

The project service uses:

```text
mongodb://localhost:27017/projectpilot
```

MongoDB collections are created as application data is persisted.

---

# 🚀 Recommended Startup Order

For a clean local development setup:

### Terminal 1 – MySQL

Start MySQL Server.

### Terminal 2 – MongoDB

Start MongoDB.

### Terminal 3 – Auth Service

```bash
cd Backend/auth-service
mvn spring-boot:run
```

### Terminal 4 – Project Service

```bash
cd Backend/project-service
mvn spring-boot:run
```

### Terminal 5 – Frontend

From the project root:

```bash
npm run dev
```

Then open the Vite URL shown in the terminal.

---

# 🛠️ Common Problems

## Frontend cannot connect to backend

Check that:

```text
Auth Service → port 8081
Project Service → port 8082
```

Also verify the URLs in:

```text
src/utils/api.js
```

## MySQL connection error

Check:

- MySQL is running.
- Username is correct.
- Password is correct.
- Port `3306` is available.
- The `projectpilot` database can be created/accessed.

## MongoDB connection error

Check that MongoDB is running on:

```text
localhost:27017
```

## JWT authentication failure

Make sure the JWT secret configured in:

```text
auth-service/application.properties
```

and:

```text
project-service/application.properties
```

is exactly the same.

## AI features are not working

Check:

- Ensure `ai-service` is running on port 8083 (`python -m uvicorn main:app --port 8083`).
- Verify `http://localhost:8083/health` returns status `UP`.
- Check `project-service` console logs for HTTP connection timeouts to `ai.service.url`.

## Port already in use

If `8081`, `8082`, or the Vite development port is already occupied, stop the process using the port or change the corresponding configuration.

---

# 🔒 Security Notes

Before deploying this application publicly:

1. Never commit database passwords or production secrets.
2. Use HTTPS in production.
5. Configure appropriate CORS policies.
6. Use strong JWT secrets.
7. Restrict database access.
8. Add production logging and monitoring.
9. Validate uploaded files and file types.
10. Review authorization rules for every protected API endpoint.

---

# 📦 Production Build

## Frontend

```bash
npm install
npm run build
```

The production files will be generated in:

```text
dist/
```

## Backend

For each Spring Boot service:

```bash
mvn clean package
```

Then run the generated JAR.

Auth service:

```bash
java -jar target/auth-service.jar
```

Project service:

```bash
java -jar target/project-service.jar
```

---

# 🌱 Development Workflow

Recommended workflow:

```text
Create Feature
     ↓
Develop Frontend / Backend
     ↓
Run Services Locally
     ↓
Test API + UI
     ↓
Run npm run lint
     ↓
Run npm run build
     ↓
Commit Changes
     ↓
Push Branch
     ↓
Create Pull Request
```

---

# 📌 Current Architecture

ProjectPilot currently follows a microservice-oriented backend architecture:

```text
Frontend (Port 5173)
   │
   ├──────────────► Auth Service (Port 8081) ─────► MySQL
   │
   └──────────────► Project Service (Port 8082) ───► MongoDB
                              │
                              └────────► AI Service (Python, Port 8083)
```

This 3-microservice architecture cleanly separates authentication, project management, and AI intelligence.

---

# 🎯 Future Enhancements

Potential future improvements include:

- Dedicated AI microservice.
- GitHub API integration for live repository analysis.
- Advanced plagiarism detection against external sources.
- Improved semantic similarity models.
- Automated project risk prediction.
- Real-time collaboration.
- WebSocket-based notifications.
- Production-grade secret management.
- Containerization with Docker.
- CI/CD deployment.
- Cloud database integration.
- Automated unit, integration, and end-to-end testing.

---

# 👩‍💻 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Run lint/build checks.
6. Commit your changes.

```bash
git add .
git commit -m "Add your feature"
```

7. Push the branch.

```bash
git push origin feature/your-feature
```

8. Open a Pull Request.

---


## ProjectPilot

**Manage Projects • Track Progress • Analyze Performance • Build Better Projects 🚀**
