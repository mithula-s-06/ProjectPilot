ProjectPilot 🚀

ProjectPilot is an AI-assisted academic project management and monitoring platform built for student project teams, team leaders, mentors, and administrators. It combines project planning, task and milestone tracking, weekly reports, team management, performance monitoring, notifications, file handling, and AI-assisted analysis in one application.

The repository contains a React + Vite frontend and two Spring Boot backend microservices:

auth-service – authentication, registration, roles, JWT generation, and MySQL persistence.

project-service – projects, teams, tasks, milestones, reports, notifications, suggestions, files, member metrics, and AI-assisted analysis using Google Gemini.

React frontend – role-based dashboards and the user interface.

📌 Main Features

Authentication and User Management

User registration and login.

JWT-based authentication.

Role-based access.

Student, Team Leader, Mentor, and System Administrator workflows.

User profile management.

Resume upload and skill extraction.

Google authentication UI components are included in the frontend.

Project Management

Create, view, update, and delete projects.

Track project domain, description, phase, status, progress, and health.

Assign teams and mentors.

View project details from role-specific dashboards.

Team Management

Create and manage teams.

Assign team leaders, mentors, and members.

View team details and member information.

Monitor team-level project progress.

Tasks and Milestones

Create and assign tasks.

Set task deadlines and status.

Create milestones and monitor completion.

Automatic deadline reminder logic for upcoming tasks and milestones.

Reports

Submit weekly reports.

Review reports as a mentor.

Re-analyze reports.

Update and delete reports.

Track report similarity and AI-generated-text probability.

AI-Assisted Analysis

The backend integrates Google Gemini for several intelligent features, including:

AI-generated text probability analysis for weekly reports.

Semantic similarity analysis between reports.

Text embeddings for similarity comparison.

Resume text/skill extraction.

Document text extraction.

AI-assisted project/report analysis.

Project suggestions and insights.

The similarity service uses embedding-based cosine similarity when Gemini embeddings are available and falls back to a local Java bag-of-words cosine similarity implementation if the AI embedding request fails.

Performance and Contributions

Team/member performance views.

Member metrics.

Contribution percentages.

GitHub contribution information can be displayed through the project data and frontend contribution components.

Files and Documents

Upload project-related files.

Store files in the backend database.

Download uploaded files.

Browser-side IndexedDB is also used as a local fallback for file storage.

Notifications

Project notifications.

Task deadline reminders.

Milestone deadline reminders.

Team/member/mentor notification targeting.

Backend persistence with local-storage fallback.

UI

Responsive React interface.

Role-specific navigation.

Dashboard cards and data tables.

Dark/light theme support.

Tailwind CSS styling.

React Icons.

🏗️ Technology Stack

Frontend

Technology

Purpose

React 19

User interface

Vite 8

Frontend development server and build tool

JavaScript / JSX

Application development

Tailwind CSS 3

Styling and responsive UI

React Icons

Icons

Context API

Application/page/theme state

LocalStorage

Client-side session and fallback data

IndexedDB

Local file fallback storage

Backend

Technology

Purpose

Java 21

Backend programming language

Spring Boot 4.1

Backend framework

Spring Web

REST APIs

Spring Security

Authentication and authorization

Spring Data JPA

MySQL persistence

Spring Data MongoDB

MongoDB persistence

JJWT 0.13

JWT creation and verification

Maven

Backend dependency management/build

Google Gemini

AI analysis and embeddings

Databases

MySQL

Used by auth-service for authentication/user credentials and role information.

Default database configuration:

Database: projectpilot
Host: localhost
Port: 3306

MongoDB

Used by project-service for application/project data.

Default database configuration:

Database: projectpilot
Host: localhost
Port: 27017

MongoDB stores entities such as:

Users

Projects

Teams

Tasks

Milestones

Weekly Reports

Notifications

Suggestions

Member Metrics

Uploaded Files

Similarity Records

AI Detection Records

📁 Project Structure

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

💻 Prerequisites

Install the following before running ProjectPilot.

1. Node.js and npm

Install a current LTS version of Node.js.

Verify:

node -v
npm -v

The frontend uses npm and Vite.

2. Java JDK 21

The backend Maven projects are configured for Java 21.

Verify:

java -version

You should see Java 21 or a compatible Java 21 installation.

3. Maven

Install Apache Maven.

Verify:

mvn -version

Maven is required to build and run both Spring Boot services.

4. MySQL Server

Install MySQL Server and make sure it is running.

Verify that MySQL is available on:

localhost:3306

The application is configured to use a database named:

projectpilot

The configured JPA setting allows the database to be created automatically if it does not already exist, provided the MySQL user has permission to create databases.

5. MongoDB

Install MongoDB Community Server or use a local MongoDB installation.

The project expects:

mongodb://localhost:27017/projectpilot

Make sure MongoDB is running before starting project-service.

6. Google Gemini API Key

AI features require a valid Google Gemini API key.

Do not commit a real API key to GitHub.

Configure the key securely in the backend configuration or through your preferred environment/secret-management approach.

⚙️ Installation

1. Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ProjectPilot

Replace <YOUR_GITHUB_REPOSITORY_URL> with the repository URL.

🎨 Frontend Setup

Open a terminal in the project root:

npm install

This installs the dependencies listed in package.json, including:

React

React DOM

Vite

Tailwind CSS

React Icons

Oxlint

Vite React plugin

Start the frontend:

npm run dev

Vite will display the local development URL, normally:

http://localhost:5173

Open that address in a browser.

🔐 Backend Configuration

The frontend currently communicates with:

Auth Service:    http://localhost:8081
Project Service: http://localhost:8082

These URLs are defined in:

src/utils/api.js

If the backend ports are changed, update the frontend API configuration accordingly.

🔑 Auth Service Setup

Navigate to:

cd Backend/auth-service

Build the service:

mvn clean install

Run it:

mvn spring-boot:run

The service starts on:

http://localhost:8081

Auth Service Responsibilities

The authentication service handles:

Registration

Login

User credentials

Password authentication

Role information

JWT generation

Current-user/session endpoint

MySQL persistence

The JWT secret must be configured consistently with the project service.

📊 Project Service Setup

Open another terminal and navigate to:

cd Backend/project-service

Build:

mvn clean install

Run:

mvn spring-boot:run

The service starts on:

http://localhost:8082

Project Service Responsibilities

The project service handles:

Users

Projects

Teams

Tasks

Milestones

Weekly reports

Notifications

Suggestions

Member metrics

File uploads/downloads

AI analysis

Similarity analysis

AI detection records

🧠 AI Configuration

The project service contains the Gemini integration in:

Backend/project-service/src/main/java/com/project/service/GeminiService.java

AI-related services include:

GeminiService.java
AIService.java
AIDetectionService.java
SimilarityService.java

The Gemini service is used for operations such as:

Extracting text from uploaded documents.

Extracting skills from resumes.

Estimating AI-generated text probability.

Generating text embeddings.

Supporting semantic similarity analysis.

Security Recommendation

Before pushing the project to a public GitHub repository:

Remove any hard-coded Gemini API key.

Remove database passwords from committed configuration.

Move secrets into environment variables or a secure secrets manager.

Rotate any credentials that have previously been committed.

For example, avoid committing:

spring.datasource.password=YOUR_REAL_PASSWORD
gemini.api.key=YOUR_REAL_API_KEY

Instead, use environment variables or an external configuration mechanism.

🔄 How the Application Works

The overall architecture is:

                    ┌──────────────────────┐
                    │      React UI        │
                    │   Vite + Tailwind    │
                    └──────────┬───────────┘
                               │
                     REST API + JWT
                               │
                ┌──────────────┴──────────────┐
                │                             │
       ┌────────▼────────┐          ┌────────▼─────────┐
       │   Auth Service  │          │ Project Service  │
       │ Spring Boot     │          │ Spring Boot      │
       │ Port 8081       │          │ Port 8082        │
       └────────┬────────┘          └───────┬──────────┘
                │                           │
             MySQL                      MongoDB
                │                           │
                │                     ┌─────▼─────┐
                │                     │ Gemini AI │
                │                     └───────────┘

Authentication Flow

User opens ProjectPilot.

User registers or logs in.

React sends credentials to auth-service.

Auth service validates the credentials.

A JWT is generated.

React stores the token in browser local storage.

Subsequent API requests send the JWT in the Authorization header.

project-service verifies the same JWT secret before processing protected requests.

👤 Using ProjectPilot

Step 1 – Create an Account

Open:

http://localhost:5173

Select Sign Up.

Enter the required account details and select the appropriate role.

The registration process:

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

🔓 Login

Select Login and provide:

Email

Password

After successful authentication, ProjectPilot stores the JWT and redirects the user to the appropriate role-based experience.

🎓 Student Workflow

A student can use ProjectPilot to:

Log in.

View the student dashboard.

View assigned projects.

View team information.

Check assigned tasks.

Track milestones.

Submit weekly reports.

Upload supporting documents.

View project health and progress.

View suggestions and notifications.

View performance/contribution information.

👨‍💼 Team Leader Workflow

A Team Leader can:

View team dashboard.

Monitor team members.

View project progress.

Assign tasks.

Monitor task deadlines.

Track milestones.

Review team activity.

Monitor weekly submissions.

View performance metrics.

Monitor project health.

Receive deadline notifications.

👨‍🏫 Mentor Workflow

A Mentor can:

View assigned projects.

Monitor project progress.

Review weekly reports.

Provide feedback.

Review project health.

View team performance.

Review AI-assisted analysis.

Monitor similarity and AI-generated-text indicators.

View suggestions and project risks.

🛡️ Administrator Workflow

The System Administrator can manage platform-level information such as:

Users

Teams

Projects

Mentors

Team leaders

Platform activity

Administrative dashboards

📑 Weekly Report Analysis

When a weekly report is submitted, the backend can perform several analysis steps.

Conceptually:

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

The similarity process uses embeddings and cosine similarity when the Gemini embedding service is available.

If the AI embedding operation fails, the service uses a local Java bag-of-words cosine similarity calculation as a fallback.

AI detection and similarity scores should be treated as indicators rather than definitive proof of plagiarism or AI authorship.

📄 File Uploads

ProjectPilot supports file upload functionality through the project service.

The configured maximum upload size is:

50 MB

Uploaded files can be:

Stored in the backend database.

Retrieved through the file download endpoint.

Temporarily/fallback stored in browser IndexedDB.

The frontend file-storage helper is:

src/utils/fileStorage.js

🔔 Notifications and Reminders

ProjectPilot automatically checks upcoming task and milestone deadlines.

A reminder can be generated when a task or milestone is due within approximately three days.

Notifications can target:

Assigned student

Team Leader

Mentor

Team members

Notifications are persisted through the project service, with local browser storage used as a fallback.

🧪 Testing

Frontend Build

Run:

npm run build

If the build succeeds, the production bundle is generated in:

dist/

Linting

Run:

npm run lint

Production Preview

After building:

npm run preview

🔌 API Communication

The frontend centralizes API communication in:

src/utils/api.js

The main backend base URLs are:

http://localhost:8081
http://localhost:8082

The API utility automatically attaches the JWT when a token is available.

Example request pattern:

Authorization: Bearer <JWT_TOKEN>

🗄️ Database Initialization

MySQL

The auth service uses:

jdbc:mysql://localhost:3306/projectpilot

Hibernate is configured with:

spring.jpa.hibernate.ddl-auto=update

This allows Hibernate to update/create the required relational tables based on the entities.

MongoDB

The project service uses:

mongodb://localhost:27017/projectpilot

MongoDB collections are created as application data is persisted.

🚀 Recommended Startup Order

For a clean local development setup:

Terminal 1 – MySQL

Start MySQL Server.

Terminal 2 – MongoDB

Start MongoDB.

Terminal 3 – Auth Service

cd Backend/auth-service
mvn spring-boot:run

Terminal 4 – Project Service

cd Backend/project-service
mvn spring-boot:run

Terminal 5 – Frontend

From the project root:

npm run dev

Then open the Vite URL shown in the terminal.

🛠️ Common Problems

Frontend cannot connect to backend

Check that:

Auth Service → port 8081
Project Service → port 8082

Also verify the URLs in:

src/utils/api.js

MySQL connection error

Check:

MySQL is running.

Username is correct.

Password is correct.

Port 3306 is available.

The projectpilot database can be created/accessed.

MongoDB connection error

Check that MongoDB is running on:

localhost:27017

JWT authentication failure

Make sure the JWT secret configured in:

auth-service/application.properties

and:

project-service/application.properties

is exactly the same.

AI features are not working

Check:

Gemini API key configuration.

Internet connectivity.

Gemini API availability.

Backend logs for Gemini request errors.

API quota/limits.

Port already in use

If 8081, 8082, or the Vite development port is already occupied, stop the process using the port or change the corresponding configuration.

🔒 Security Notes

Before deploying this application publicly:

Never commit database passwords.

Never commit Gemini/API keys.

Replace development secrets with environment variables.

Use HTTPS in production.

Configure appropriate CORS policies.

Use strong JWT secrets.

Restrict database access.

Add production logging and monitoring.

Validate uploaded files and file types.

Review authorization rules for every protected API endpoint.

📦 Production Build

Frontend

npm install
npm run build

The production files will be generated in:

dist/

Backend

For each Spring Boot service:

mvn clean package

Then run the generated JAR.

Auth service:

java -jar target/auth-service.jar

Project service:

java -jar target/project-service.jar

🌱 Development Workflow

Recommended workflow:

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

📌 Current Architecture

ProjectPilot currently follows a microservice-oriented backend architecture:

Frontend
   │
   ├──────────────► Auth Service ─────► MySQL
   │
   └──────────────► Project Service ───► MongoDB
                              │
                              └────────► Gemini AI

This separation keeps authentication concerns independent from project-management and AI functionality.

🎯 Future Enhancements

Potential future improvements include:

Dedicated AI microservice.

GitHub API integration for live repository analysis.

Advanced plagiarism detection against external sources.

Improved semantic similarity models.

Automated project risk prediction.

Real-time collaboration.

WebSocket-based notifications.

Production-grade secret management.

Containerization with Docker.

CI/CD deployment.

Cloud database integration.

Automated unit, integration, and end-to-end testing.

👩‍💻 Contributing

Fork the repository.

Create a feature branch.

git checkout -b feature/your-feature

Make your changes.

Test the application.

Run lint/build checks.

Commit your changes.

git add .
git commit -m "Add your feature"

Push the branch.

git push origin feature/your-feature

Open a Pull Request.

ProjectPilot
Manage Projects • Track Progress • Analyze Performance • Build Better Projects 🚀
