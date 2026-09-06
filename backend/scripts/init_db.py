import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import init_db

init_db()
print("Database and tables created successfully.")