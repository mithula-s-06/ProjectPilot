import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.skill_extractor import SkillExtractor
from services.similarity_engine import SimilarityEngine
from services.ai_detector import AIDetector
from services.document_parser import DocumentParser

def run_audit():
    print("=" * 66)
    print("   PROJECTPILOT AI SERVICE - COMPREHENSIVE FEATURE AUDIT")
    print("=" * 66 + "\n")

    # -------------------------------------------------------------
    # 1. RESUME SKILL EXTRACTION TEST
    # -------------------------------------------------------------
    print("--- [1/3] TESTING RESUME SKILL EXTRACTION ---")
    sample_resume = """
    Alex Rivera - Senior Full Stack Engineer
    Summary: Experienced software developer specializing in scalable distributed microservices.
    Core Competencies & Technical Skills:
    - Languages: Python, Java, TypeScript, SQL, Bash
    - Frameworks & Web: Spring Boot, React, Next.js, FastAPI, Node.js, Express.js, Tailwind CSS
    - Databases & Storage: PostgreSQL, MongoDB, Redis, Elasticsearch
    - Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, CI/CD, GitHub Actions, Linux
    - Data & Machine Learning: PyTorch, Scikit-Learn, Pandas, NumPy
    - Testing & Methodologies: Unit Testing, Jest, JUnit, System Design, Agile, Scrum
    """

    skills_extracted = SkillExtractor.extract_skills(sample_resume)
    print(f"-> Extracted {len(skills_extracted)} skills from multi-stack resume:")
    print(f"   {skills_extracted}\n")

    assert "Java" in skills_extracted, "Java missing"
    assert "Python" in skills_extracted, "Python missing"
    assert "Spring Boot" in skills_extracted, "Spring Boot missing"
    assert "React" in skills_extracted, "React missing"
    assert "Docker" in skills_extracted, "Docker missing"
    assert "Kubernetes" in skills_extracted, "Kubernetes missing"
    assert "PostgreSQL" in skills_extracted, "PostgreSQL missing"
    print("[PASS] Resume Skill Extraction is working properly and accurately!\n")

    # -------------------------------------------------------------
    # 2. SEMANTIC SIMILARITY / REPORT DUPLICATION DETECTION
    # -------------------------------------------------------------
    print("--- [2/3] TESTING SEMANTIC SIMILARITY ENGINE ---")
    current_report = "Configured Spring Security filter chain with JWT authentication and integrated MongoDB repositories."

    historical_reports = [
        {
            "id": "rep_marketing_01",
            "text": "Designed color palettes and marketing logos in Adobe Illustrator and Figma."
        },
        {
            "id": "rep_auth_clone",
            "text": "Configured Spring Security filter chain with JWT authentication and integrated MongoDB repositories."
        },
        {
            "id": "rep_auth_paraphrased",
            "text": "Implemented Spring Security JWT token filter authentication and setup database connections for MongoDB."
        }
    ]

    # Test exact duplicate
    sim_exact = SimilarityEngine.compute_similarity(current_report, [historical_reports[0], historical_reports[1]])
    print(f"-> Exact Duplicate Test: score = {sim_exact['similarity_score']}%, matchedId = {sim_exact['matched_report_id']}")
    assert sim_exact['similarity_score'] >= 99.0, "Exact match failed"
    assert sim_exact['matched_report_id'] == "rep_auth_clone", "Matched ID wrong"

    # Test paraphrased similar report
    sim_para = SimilarityEngine.compute_similarity(current_report, [historical_reports[0], historical_reports[2]])
    print(f"-> Paraphrased Semantic Similarity: score = {sim_para['similarity_score']}%, matchedId = {sim_para['matched_report_id']}")
    assert sim_para['similarity_score'] >= 35.0, "Paraphrased similarity too low"
    assert sim_para['matched_report_id'] == "rep_auth_paraphrased", "Matched ID wrong"

    # Test completely unrelated report
    sim_unrelated = SimilarityEngine.compute_similarity(current_report, [historical_reports[0]])
    print(f"-> Unrelated Report Test: score = {sim_unrelated['similarity_score']}%, matchedId = {sim_unrelated['matched_report_id']}")
    assert sim_unrelated['similarity_score'] <= 15.0, "Unrelated text similarity too high"

    print("[PASS] Semantic Similarity Engine is working properly!\n")

    # -------------------------------------------------------------
    # 3. AI / PLAGIARISM / GENERATED TEXT DETECTOR
    # -------------------------------------------------------------
    print("--- [3/3] TESTING AI & PLAGIARISM CONTENT DETECTOR ---")

    # Sample A: Authentic Human Student Progress Update
    human_report = """
    This week I worked on fixing the user registration endpoint. Found out that the database unique index
    on email was throwing an unhandled duplicate key exception. I wrote a custom exception handler,
    tested it with Postman, and verified that it returns a clean 400 Bad Request message.
    Next week I will start working on the frontend integration.
    """

    human_result = AIDetector.detect(human_report)
    print("-> Human Report Analysis:")
    print(f"   Score: {human_result['score']}% | Classification: {human_result['classification']}")
    print(f"   Burstiness Variance: {human_result['burstiness_variance']}, Lexical Diversity: {human_result['lexical_diversity_ttr']}")
    assert human_result['score'] < 40.0, f"Human report falsely flagged as AI: {human_result['score']}"

    # Sample B: Typical LLM / ChatGPT Generated Report
    ai_report = """
    Furthermore, it is important to note that our team has successfully navigated the dynamic landscape 
    of this project. Moreover, in conclusion, this serves as a testament to our holistic vision, 
    delving deeply into key architectural paradigms and fostering a seamless collaboration across all milestones.
    Additionally, we spearheaded innovative solutions that play an integral role in our development journey.
    """

    ai_result = AIDetector.detect(ai_report)
    print("\n-> AI-Generated Report Analysis:")
    print(f"   Score: {ai_result['score']}% | Classification: {ai_result['classification']}")
    print(f"   Matched Markers: {ai_result['matched_markers']}")
    print(f"   Marker Count: {ai_result['marker_count']}")
    assert ai_result['score'] >= 60.0, f"AI report failed detection threshold: {ai_result['score']}"

    print("\n[PASS] AI Content & Plagiarism Detector is working properly!\n")
    print("=" * 66)
    print("   ALL 3 CORE AI CAPABILITIES ARE 100% OPERATIONAL & VERIFIED")
    print("=" * 66)

if __name__ == "__main__":
    run_audit()
