import os
import joblib
import csv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Built-in dataset (used if no external dataset.csv is provided)
TRAINING_DATA = [
    # --- HUMAN WRITTEN (0) ---
    ("I finished writing the local unit test cases for the login form and resolved the routing issues.", 0),
    ("fixed the bug in the auth token retrieval from cookies. database connections are now closing correctly.", 0),
    ("Spent today debugging the database pool leak. Ran npm build and verified the bundle size.", 0),
    ("Working on the project details UI. Added icons from react-icons and aligned the card elements.", 0),
    ("completed the weekly milestone targets. team leader reviewed my progress on backend controllers.", 0),
    ("Just push my branch to git. The server compiles cleanly and starts on port 8080.", 0),
    ("I updated the dependencies in package.json and ran clean builds. Tested locally on edge browser.", 0),
    ("Writing some mock data for student dashboard. Aligned items vertically and changed backgrounds.", 0),
    ("Created the user profile page. Still need to style the submit button and handle upload responses.", 0),
    ("Tested the API endpoint for listing projects and verified that MongoDB updates are synced.", 0),
    ("Working with Team Leader on the figma design layout. Will submit report tomorrow.", 0),
    ("Fixed dashboard routing. The sidebar links now redirect to correct tabs.", 0),
    ("Added scrollbar styling. Tested settings inputs and successfully updated localstorage fields.", 0),
    ("Created custom alerts. Spaced out cards on the dashboard.", 0),
    ("Connected frontend details page to the backend. The list maps correctly.", 0),
    ("Writing report description. Added milestones list and updated due dates.", 0),
    ("Fixed the project deletion bug. Local storage cache now updates correctly.", 0),
    ("Removed unused routing switch cases from the mentor component.", 0),
    ("Compiled project service cleanly. Maven build returned code 0.", 0),
    ("Submitted weekly progress. Awaiting mentor grades and review remarks.", 0),

    # --- AI GENERATED (1) ---
    ("Furthermore, it is important to note that we have successfully resolved the routing challenges within the application, demonstrating a pivotal milestone.", 1),
    ("In conclusion, the database connection lifecycle has been demystified and optimized, serving as a testament to our structural integrity.", 1),
    ("We have successfully implemented a holistic approach to handle token authentication, utilizing a multi-faceted design pattern.", 1),
    ("Additionally, we have delved deep into resolving the database connection pool leak to ensure optimal runtime efficiency.", 1),
    ("The user interface features a tapestry of modern layout elements, designed to enhance the student interaction paradigm.", 1),
    ("Moreover, we have updated the configurations in order to establish a robust foundation for all subsequent development sprints.", 1),
    ("It is pivotal to delve into the unit testing suites to verify the correctness of the authentication controllers.", 1),
    ("In summary, our development progress is aligned with the target roadmap, showcasing exceptional execution metrics.", 1),
    ("This progress report underscores our dedication to providing a seamless, holistic dashboard experience.", 1),
    ("Additionally, the codebase has been compiled for production, verifying that all bundle optimizations are successfully established.", 1),
    ("To demystify the deployment cycle, we have configured specific properties in the resources directory.", 1),
    ("A holistic overview of the project milestones reveals that we have achieved all high priority sprint deadlines.", 1),
    ("Furthermore, the user profile UI has been refactored, yielding a highly responsive and aesthetically pleasing outcome.", 1),
    ("This implementation serves as a clear testament to our commitment to maintaining a robust engineering standard.", 1),
    ("Moreover, we analyzed the performance profiles to identify potential bottlenecks in the data streaming layer.", 1),
    ("In conclusion, the project successfully compiles, verifying that all dependencies are correctly aligned with design intent.", 1),
    ("It is important to note that the sidebar navigation was successfully integrated, presenting an intuitive user flow.", 1),
    ("Delving into the MongoDB configuration, we have established proper collection mappings for auditing purposes.", 1),
    ("We have designed a multi-faceted approach to dispatch notifications to the respective academic mentors.", 1),
    ("The report details card showcases a tapestry of interactive components, elevating the overall dashboard utility.", 1)
]

def load_data():
    csv_path = "dataset.csv"
    if os.path.exists(csv_path):
        print(f"Detecting external dataset file: {csv_path}...")
        texts = []
        labels = []
        try:
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if 'text' in row and 'label' in row:
                        texts.append(row['text'])
                        labels.append(int(row['label']))
            if texts:
                print(f"Successfully loaded {len(texts)} samples from {csv_path}!")
                return texts, np.array(labels)
            else:
                print("Warning: CSV file was empty or header columns ('text', 'label') were not found.")
        except Exception as e:
            print(f"Error reading external CSV dataset: {e}")
            
    print("No valid external dataset found. Loading built-in training data...")
    texts = [item[0] for item in TRAINING_DATA]
    labels = np.array([item[1] for item in TRAINING_DATA])
    return texts, labels

def train_model():
    # Load dataset (external CSV if present, otherwise built-in)
    texts, labels = load_data()
    
    # 2. Extract TF-IDF features
    print("Vectorizing training texts...")
    vectorizer = TfidfVectorizer(
        stop_words='english', 
        ngram_range=(1, 2), 
        min_df=1
    )
    X = vectorizer.fit_transform(texts)
    
    # 3. Train Logistic Regression Classifier
    print("Training Logistic Regression classifier...")
    model = LogisticRegression(C=10.0, random_state=42)
    model.fit(X, labels)
    
    # Save assets to disk
    joblib.dump(vectorizer, "vectorizer.pkl")
    joblib.dump(model, "model.pkl")
    print("Model trained successfully! Saved 'vectorizer.pkl' and 'model.pkl' to disk.")

if __name__ == "__main__":
    train_model()
