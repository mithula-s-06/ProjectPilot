import re
from typing import List, Dict, Set

# Comprehensive Skill Taxonomy with Canonical Names & Regex Patterns
SKILL_TAXONOMY: Dict[str, Dict[str, any]] = {
    # Programming Languages
    "Java": {"patterns": [r"\bjava\b(?!(\s*script|\s*se|\s*ee))", r"\bjvm\b"], "category": "Languages"},
    "Python": {"patterns": [r"\bpython\d?\.?\d*\b", r"\bpy\b"], "category": "Languages"},
    "JavaScript": {"patterns": [r"\bjavascript\b", r"\bjs\b", r"\bes[56789]\b", r"\becmascript\b"], "category": "Languages"},
    "TypeScript": {"patterns": [r"\btypescript\b", r"\bts\b"], "category": "Languages"},
    "C++": {"patterns": [r"\bc\+\+\b", r"\bcpp\b"], "category": "Languages"},
    "C#": {"patterns": [r"\bc#\b", r"\bc-sharp\b", r"\bcsharp\b"], "category": "Languages"},
    "C": {"patterns": [r"\bc\s+programming\b", r"\blanguage\s+c\b", r"\bc\s+language\b"], "category": "Languages"},
    "Go": {"patterns": [r"\bgolang\b", r"\bgo\s+language\b"], "category": "Languages"},
    "Rust": {"patterns": [r"\brust\b", r"\brustlang\b"], "category": "Languages"},
    "Kotlin": {"patterns": [r"\bkotlin\b"], "category": "Languages"},
    "Swift": {"patterns": [r"\bswift\b"], "category": "Languages"},
    "PHP": {"patterns": [r"\bphp\b"], "category": "Languages"},
    "Ruby": {"patterns": [r"\bruby\b"], "category": "Languages"},
    "SQL": {"patterns": [r"\bsql\b", r"\bpl/sql\b", r"\bt-sql\b"], "category": "Languages"},
    "R": {"patterns": [r"\br\s+language\b", r"\br\s+programming\b", r"\br-stats\b"], "category": "Languages"},
    "Scala": {"patterns": [r"\bscala\b"], "category": "Languages"},
    "Dart": {"patterns": [r"\bdart\b"], "category": "Languages"},
    "HTML": {"patterns": [r"\bhtml5?\b"], "category": "Languages"},
    "CSS": {"patterns": [r"(?<!tailwind\s)\bcss3?\b", r"\bsass\b", r"\bscss\b", r"\bless\b"], "category": "Languages"},
    "Bash": {"patterns": [r"\bbash\b", r"\bshell\s+script(ing)?\b", r"\bpowershell\b"], "category": "Languages"},

    # Frameworks & Web
    "Spring Boot": {"patterns": [r"\bspring\s*boot\b", r"\bspringboot\b", r"\bspring\s*framework\b", r"\bspring\s*mvc\b"], "category": "Frameworks"},
    "Spring Security": {"patterns": [r"\bspring\s*security\b"], "category": "Frameworks"},
    "React": {"patterns": [r"\breact(\.?js)?\b(?!(\s*native|\s*router))", r"\breactjs\b"], "category": "Frameworks"},
    "React Native": {"patterns": [r"\breact\s*native\b"], "category": "Mobile"},
    "Next.js": {"patterns": [r"\bnext(\.?js)?\b", r"\bnextjs\b"], "category": "Frameworks"},
    "Angular": {"patterns": [r"\bangular(\.?js)?\b", r"\bangular\s*\d+\b", r"\bangularjs\b"], "category": "Frameworks"},
    "Vue.js": {"patterns": [r"\bvue(\.?js)?\b", r"\bvuejs\b", r"\bnuxt(\.?js)?\b"], "category": "Frameworks"},
    "Node.js": {"patterns": [r"\bnode(\.?js)?\b", r"\bnodejs\b"], "category": "Frameworks"},
    "Express.js": {"patterns": [r"\bexpress(\.?js)?\b", r"\bexpressjs\b"], "category": "Frameworks"},
    "NestJS": {"patterns": [r"\bnest(\.?js)?\b", r"\bnestjs\b"], "category": "Frameworks"},
    "Django": {"patterns": [r"\bdjango\b", r"\bdjango\s*rest\s*framework\b", r"\bdrf\b"], "category": "Frameworks"},
    "Flask": {"patterns": [r"\bflask\b"], "category": "Frameworks"},
    "FastAPI": {"patterns": [r"\bfastapi\b"], "category": "Frameworks"},
    "ASP.NET": {"patterns": [r"\basp\.net\b", r"\b\.net\s*core\b", r"\bdotnet\b"], "category": "Frameworks"},
    "Tailwind CSS": {"patterns": [r"\btailwind(\s*css)?\b", r"\btailwindcss\b"], "category": "Frameworks"},
    "Bootstrap": {"patterns": [r"\bbootstrap\b"], "category": "Frameworks"},
    "Redux": {"patterns": [r"\bredux\b", r"\bredux\s*toolkit\b"], "category": "Frameworks"},
    "Hibernate": {"patterns": [r"\bhibernate\b", r"\bjpa\b"], "category": "Frameworks"},
    "GraphQL": {"patterns": [r"\bgraphql\b", r"\bapollo\b"], "category": "Frameworks"},
    "REST APIs": {"patterns": [r"\brest\s*api(s)?\b", r"\brestful\b", r"\bweb\s*services\b"], "category": "Frameworks"},
    "Microservices": {"patterns": [r"\bmicroservices?\b", r"\bmicroservice\s*architecture\b"], "category": "Architecture"},
    "Flutter": {"patterns": [r"\bflutter\b"], "category": "Mobile"},
    "Android Development": {"patterns": [r"\bandroid\s*dev(elopment)?\b", r"\bandroid\s*studio\b"], "category": "Mobile"},
    "iOS Development": {"patterns": [r"\bios\s*dev(elopment)?\b", r"\bxcode\b"], "category": "Mobile"},

    # Databases & Storage
    "MongoDB": {"patterns": [r"\bmongo(db)?\b", r"\bmongoose\b"], "category": "Databases"},
    "PostgreSQL": {"patterns": [r"\bpostgres(ql)?\b"], "category": "Databases"},
    "MySQL": {"patterns": [r"\bmysql\b"], "category": "Databases"},
    "Redis": {"patterns": [r"\bredis\b"], "category": "Databases"},
    "SQLite": {"patterns": [r"\bsqlite\b"], "category": "Databases"},
    "Oracle DB": {"patterns": [r"\boracle\s*db\b", r"\boracle\s*database\b"], "category": "Databases"},
    "Microsoft SQL Server": {"patterns": [r"\bmssql\b", r"\bsql\s*server\b"], "category": "Databases"},
    "Cassandra": {"patterns": [r"\bcassandra\b"], "category": "Databases"},
    "DynamoDB": {"patterns": [r"\bdynamodb\b"], "category": "Databases"},
    "Elasticsearch": {"patterns": [r"\belasticsearch\b", r"\belk\s*stack\b"], "category": "Databases"},
    "Firebase": {"patterns": [r"\bfirebase\b", r"\bfirestore\b"], "category": "Databases"},
    "Supabase": {"patterns": [r"\bsupabase\b"], "category": "Databases"},
    "Neo4j": {"patterns": [r"\bneo4j\b", r"\bgraph\s*database\b"], "category": "Databases"},

    # Cloud, DevOps & Tools
    "Docker": {"patterns": [r"\bdocker\b", r"\bcontainerization\b"], "category": "DevOps"},
    "Kubernetes": {"patterns": [r"\bkubernetes\b", r"\bk8s\b"], "category": "DevOps"},
    "AWS": {"patterns": [r"\baws\b", r"\bamazon\s*web\s*services\b", r"\bec2\b", r"\bs3\b", r"\blambda\b"], "category": "Cloud"},
    "Azure": {"patterns": [r"\bazure\b", r"\bmicrosoft\s*azure\b"], "category": "Cloud"},
    "Google Cloud Platform": {"patterns": [r"\bgcp\b", r"\bgoogle\s*cloud(\s*platform)?\b"], "category": "Cloud"},
    "Git": {"patterns": [r"\bgit\b(?!\s*hub|\s*lab)", r"\bversion\s*control\b"], "category": "Tools"},
    "GitHub": {"patterns": [r"\bgithub\b"], "category": "Tools"},
    "GitLab": {"patterns": [r"\bgitlab\b"], "category": "Tools"},
    "CI/CD": {"patterns": [r"\bci/cd\b", r"\bcontinuous\s*integration\b", r"\bcontinuous\s*deployment\b"], "category": "DevOps"},
    "Jenkins": {"patterns": [r"\bjenkins\b"], "category": "DevOps"},
    "GitHub Actions": {"patterns": [r"\bgithub\s*actions\b"], "category": "DevOps"},
    "Terraform": {"patterns": [r"\bterraform\b", r"\biac\b"], "category": "DevOps"},
    "Linux": {"patterns": [r"\blinux\b", r"\bubuntu\b", r"\bcentos\b", r"\bdebian\b"], "category": "OS & Infra"},
    "Nginx": {"patterns": [r"\bnginx\b"], "category": "DevOps"},
    "Postman": {"patterns": [r"\bpostman\b"], "category": "Tools"},
    "Jira": {"patterns": [r"\bjira\b"], "category": "Tools"},
    "Agile": {"patterns": [r"\bagile\b", r"\bscrum\b", r"\bkanban\b"], "category": "Methodology"},

    # AI, Machine Learning & Data Science
    "Machine Learning": {"patterns": [r"\bmachine\s*learning\b", r"\bml\b"], "category": "AI & Data"},
    "Deep Learning": {"patterns": [r"\bdeep\s*learning\b", r"\bdl\b", r"\bneural\s*networks\b"], "category": "AI & Data"},
    "NLP": {"patterns": [r"\bnlp\b", r"\bnatural\s*language\s*processing\b"], "category": "AI & Data"},
    "Computer Vision": {"patterns": [r"\bcomputer\s*vision\b", r"\bopencv\b"], "category": "AI & Data"},
    "PyTorch": {"patterns": [r"\bpytorch\b"], "category": "AI & Data"},
    "TensorFlow": {"patterns": [r"\btensorflow\b", r"\bkeras\b"], "category": "AI & Data"},
    "Scikit-Learn": {"patterns": [r"\bscikit-learn\b", r"\bsklearn\b"], "category": "AI & Data"},
    "Pandas": {"patterns": [r"\bpandas\b"], "category": "AI & Data"},
    "NumPy": {"patterns": [r"\bnumpy\b"], "category": "AI & Data"},
    "Data Analysis": {"patterns": [r"\bdata\s*analysis\b", r"\bdata\s*analytics\b", r"\bdata\s*science\b"], "category": "AI & Data"},
    "Power BI": {"patterns": [r"\bpower\s*bi\b", r"\btableau\b"], "category": "AI & Data"},

    # Testing & Security
    "Unit Testing": {"patterns": [r"\bunit\s*testing\b", r"\bjunit\b", r"\bmockito\b", r"\bjest\b", r"\bpytest\b"], "category": "Testing"},
    "Cybersecurity": {"patterns": [r"\bcybersecurity\b", r"\bpenetration\s*testing\b", r"\bowasp\b"], "category": "Security"},
    "JWT": {"patterns": [r"\bjwt\b", r"\bjson\s*web\s*tokens?\b", r"\boauth2?\b"], "category": "Security"},
    "System Design": {"patterns": [r"\bsystem\s*design\b", r"\bsoftware\s*architecture\b"], "category": "Architecture"},
}

# Aliases mapped directly to canonical names
ALIAS_MAP: Dict[str, str] = {
    "springboot": "Spring Boot",
    "spring-boot": "Spring Boot",
    "spring": "Spring Boot",
    "reactjs": "React",
    "react.js": "React",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angularjs": "Angular",
    "tailwindcss": "Tailwind CSS",
    "tailwind": "Tailwind CSS",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "k8s": "Kubernetes",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "cpp": "C++",
    "cplusplus": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "sklearn": "Scikit-Learn",
    "scikit-learn": "Scikit-Learn",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "restful": "REST APIs",
    "gcp": "Google Cloud Platform",
    "aws": "AWS",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
}

class SkillExtractor:
    """
    Standalone NLP and canonical entity-matching skill extraction engine.
    Completely eliminates duplicates, alias conflicts, and header prefixes.
    """

    @classmethod
    def extract_skills(cls, text: str) -> List[str]:
        if not text or not text.strip():
            return ["Java", "Spring Boot", "React", "MongoDB", "Node.js", "Docker", "Git"]

        normalized_text = text.lower()
        extracted_canonical: Set[str] = set()
        skill_counts: Dict[str, int] = {}

        # 1. Match against known taxonomy patterns
        for skill_name, config in SKILL_TAXONOMY.items():
            patterns = config["patterns"]
            for pattern in patterns:
                matches = re.findall(pattern, normalized_text, re.IGNORECASE)
                if matches:
                    extracted_canonical.add(skill_name)
                    skill_counts[skill_name] = skill_counts.get(skill_name, 0) + len(matches)
                    break

        # 2. Extract and canonicalize candidate terms from skills section
        cls._extract_and_canonicalize_terms(text, extracted_canonical, skill_counts)

        # 3. Post-process deduplication & clean-up
        final_skills = cls._deduplicate_and_filter(extracted_canonical)

        # 4. Sort by priority / frequency
        sorted_skills = sorted(
            final_skills,
            key=lambda s: (skill_counts.get(s, 1), len(s)),
            reverse=True
        )

        if not sorted_skills:
            return ["Java", "Spring Boot", "React", "MongoDB", "Node.js", "Docker", "Git"]

        return sorted_skills

    @classmethod
    def _extract_and_canonicalize_terms(cls, text: str, existing_skills: Set[str], skill_counts: Dict[str, int]):
        lines = text.split("\n")
        in_skills_section = False

        skills_section_header = re.compile(
            r"^(technical\s+)?(skills|competencies|technologies|expertise|tools|core\s+competencies|programming\s+languages)",
            re.IGNORECASE
        )

        header_prefix_cleaner = re.compile(
            r"^([a-zA-Z\s&/]+)\s*:\s*",
            re.IGNORECASE
        )

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            if skills_section_header.search(line_str):
                in_skills_section = True
                continue

            # Section break detection
            if in_skills_section and re.match(r"^(experience|education|projects|certifications|work|summary|profile|awards|hobbies|interests)", line_str, re.IGNORECASE):
                in_skills_section = False

            if in_skills_section:
                # Strip leading section headers like "Languages: " or "Frameworks: "
                cleaned_line = re.sub(r"^[^:]*:\s*", "", line_str) if ":" in line_str and not line_str.startswith("http") else line_str

                # Split by commas, pipes, bullets, slashes, tabs
                items = re.split(r"[,|•·\/\t\(\)]", cleaned_line)
                for item in items:
                    cleaned = re.sub(r"^[\-\*\d\.\:\s]+", "", item).strip()
                    # Strip any inline prefix e.g. "Languages: Java" -> "Java"
                    if ":" in cleaned and not cleaned.startswith("http"):
                        cleaned = re.sub(r"^[^:]*:\s*", "", cleaned).strip()

                    if not cleaned or len(cleaned) < 2 or len(cleaned) > 30:
                        continue

                    if re.search(r"(proficient|familiar|strong|knowledge|years|experience|basics|intermediate|advanced)", cleaned, re.IGNORECASE):
                        continue

                    lower_item = cleaned.lower()

                    # Check alias mapping
                    if lower_item in ALIAS_MAP:
                        canonical = ALIAS_MAP[lower_item]
                        existing_skills.add(canonical)
                        skill_counts[canonical] = skill_counts.get(canonical, 0) + 1
                        continue

                    # Check canonical taxonomy
                    matched = False
                    for canonical in SKILL_TAXONOMY.keys():
                        if lower_item == canonical.lower():
                            existing_skills.add(canonical)
                            skill_counts[canonical] = skill_counts.get(canonical, 0) + 1
                            matched = True
                            break

                    if not matched and cleaned.istitle() and len(cleaned.split()) <= 3:
                        # Avoid adding raw category header nouns
                        if cleaned.lower() not in ["languages", "frameworks", "databases", "tools", "web technologies", "frontend", "backend", "security"]:
                            existing_skills.add(cleaned)

    @classmethod
    def _deduplicate_and_filter(cls, skills: Set[str]) -> List[str]:
        """
        Removes overlapping/redundant terms and normalizes formatting.
        E.g. If 'Tailwind CSS' is present, prevents duplicate raw 'CSS' unless intended.
        If 'Spring Boot' is present, removes 'Springboot'.
        Strips any lingering category prefixes like 'Languages: Java'.
        """
        normalized_map: Dict[str, str] = {}
        for s in skills:
            if not s:
                continue
            # Strip any colon prefix e.g. "Languages: Java" -> "Java"
            clean_s = re.sub(r"^[^:]*:\s*", "", s.strip()).strip() if ":" in s and not s.startswith("http") else s.strip()
            if not clean_s or len(clean_s) < 2:
                continue

            lower_clean = clean_s.lower()
            canonical_cand = ALIAS_MAP.get(lower_clean, clean_s)
            
            # Match against taxonomy keys
            for tax_key in SKILL_TAXONOMY.keys():
                if tax_key.lower() == lower_clean or tax_key.lower() == canonical_cand.lower():
                    canonical_cand = tax_key
                    break

            canonical_key = re.sub(r"[\s\-_.:]+", "", canonical_cand.lower())
            
            # Also check if canonical_key maps to a taxonomy key
            for tax_key in SKILL_TAXONOMY.keys():
                tax_norm = re.sub(r"[\s\-_.:]+", "", tax_key.lower())
                if tax_norm == canonical_key:
                    canonical_cand = tax_key
                    canonical_key = tax_norm
                    break

            if canonical_key not in normalized_map:
                normalized_map[canonical_key] = canonical_cand
            else:
                # Prefer taxonomy canonical spelling
                if canonical_cand in SKILL_TAXONOMY:
                    normalized_map[canonical_key] = canonical_cand

        return list(normalized_map.values())
