import sys
import os
from pathlib import Path
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv(Path(__file__).parent / ".env")

from supabase import create_client

sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
res = sb.from_("laws").select("id, cat, section, title, keywords").execute()

print(f"Total laws in Supabase: {len(res.data)}")
query = "ผู้ควบคุมข้อมูลส่วนบุคคลมีหน้าที่อะไรตาม PDPA"

print(f"\nTesting Query: '{query}'")
for l in res.data:
    q = query.lower()
    score = 0
    reasons = []
    
    # Check section
    if l.get("section") and l.get("section").lower() in q:
        score += 5
        reasons.append("section match")
        
    # Check title
    title = l.get("title", "")
    if title and (title.lower() in q or any(word in q for word in ["หน้าที่", "ผู้ควบคุมข้อมูล", "ผู้ประมวลผล"] if word in title)):
        score += 3
        reasons.append(f"title match ({title})")
        
    # Check keywords
    for kw in l.get("keywords") or []:
        if kw.lower() in q:
            score += 2
            reasons.append(f"kw: {kw}")
            
    if score > 0:
        print(f"-> Match [{score} pts]: {l.get('section')} - {l.get('title')} ({', '.join(reasons)})")
