import io
import unittest
from services.skill_extractor import SkillExtractor
from services.ai_detector import AIDetector
from services.similarity_engine import SimilarityEngine
from services.document_parser import DocumentParser

class TestAIService(unittest.TestCase):

    def test_skill_extraction(self):
        sample_resume = """
        John Doe - Full Stack Software Engineer
        Skills:
        - Languages: Java, Python, TypeScript, SQL, Bash
        - Frameworks: React, Next.js, Spring Boot, FastAPI, Node.js, Express.js, Tailwind CSS
        - Databases: PostgreSQL, MongoDB, Redis
        - Cloud & Tools: Docker, Kubernetes, AWS, Git, CI/CD, Postman, Jira
        - Concepts: Microservices, REST APIs, System Design, Unit Testing
        """
        skills = SkillExtractor.extract_skills(sample_resume)
        self.assertIn("Java", skills)
        self.assertIn("Python", skills)
        self.assertIn("React", skills)
        self.assertIn("Spring Boot", skills)
        self.assertIn("MongoDB", skills)
        self.assertIn("Docker", skills)
        self.assertIn("Kubernetes", skills)
        self.assertGreater(len(skills), 10)

    def test_ai_detection_human(self):
        human_text = "I worked on fixing the login bug yesterday. The auth token was expiring too early because of a timezone offset in our database config. Added 3 unit tests and merged the pull request."
        result = AIDetector.detect(human_text)
        self.assertLess(result["score"], 45.0)
        self.assertEqual(result["classification"], "HUMAN")

    def test_ai_detection_ai(self):
        ai_text = """
        Furthermore, it is important to delve into the multi-faceted tapestry of this project. 
        Moreover, in conclusion, this serves as a testament to our holistic approach, 
        fostering an environment where we can seamlessly leverage cutting-edge paradigms.
        Additionally, the dynamic landscape underscores our pivotal milestones.
        """
        result = AIDetector.detect(ai_text)
        self.assertGreaterEqual(result["score"], 60.0)
        self.assertEqual(result["classification"], "AI_GENERATED")
        self.assertGreater(result["marker_count"], 3)

    def test_similarity_engine(self):
        text1 = "Completed database migration for user authentication service using MongoDB and Spring Security."
        previous_reports = [
            {"id": "rep_1", "text": "Designed the UI wireframes in Figma for the marketing dashboard page."},
            {"id": "rep_2", "text": "Completed database migration for user authentication service using MongoDB."}
        ]
        result = SimilarityEngine.compute_similarity(text1, previous_reports)
        self.assertEqual(result["matched_report_id"], "rep_2")
        self.assertGreater(result["similarity_score"], 70.0)

    def test_embedding_vector(self):
        text = "Machine learning and artificial intelligence project with Python and React."
        vec = SimilarityEngine.get_embedding_vector(text, dimension=64)
        self.assertEqual(len(vec), 64)
        self.assertTrue(any(v != 0.0 for v in vec))

    def test_document_parser_text(self):
        raw = b"Project Progress Report for Week 4: Implemented WebSocket streaming for chat."
        extracted = DocumentParser.extract_text_from_bytes(raw, "text/plain", "report.txt")
        self.assertIn("WebSocket", extracted)

if __name__ == "__main__":
    unittest.main()
