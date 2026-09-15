from pymongo import MongoClient
import sys, os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.skill_extractor import SkillExtractor

def deduplicate_mongo_users():
    client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
    db = client["projectpilot"]

    for user in db["users"].find():
        if "skills" in user and user["skills"]:
            clean = SkillExtractor._deduplicate_and_filter(set(user["skills"]))
            db["users"].update_one({"_id": user["_id"]}, {"$set": {"skills": clean}})
            print(f"Updated user: {user.get('email')} -> {clean}")

if __name__ == "__main__":
    deduplicate_mongo_users()
