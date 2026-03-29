import pandas as pd
import numpy as np

np.random.seed(42)
n = 300

# Generate 3 distinct student profiles
groups = [
    # High performers
    {"study": (6, 10), "attend": (85, 100), "assign": (80, 100), "exam": (78, 100), "n": 100},
    # Average students
    {"study": (3, 6), "attend": (65, 85), "assign": (55, 80), "exam": (50, 78), "n": 100},
    # Struggling students
    {"study": (0, 3), "attend": (40, 65), "assign": (30, 55), "exam": (25, 50), "n": 100},
]

rows = []
for i, g in enumerate(groups):
    for j in range(g["n"]):
        rows.append({
            "student_id": f"S{len(rows)+1:04d}",
            "study_hours": round(np.random.uniform(*g["study"]), 1),
            "attendance": round(np.random.uniform(*g["attend"]), 1),
            "assignment_score": round(np.random.uniform(*g["assign"]), 1),
            "exam_score": round(np.random.uniform(*g["exam"]), 1),
        })

df = pd.DataFrame(rows)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv("students.csv", index=False)
print(f"Generated {len(df)} students")
print(df.describe())
