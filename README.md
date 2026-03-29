# 🎓 EduCluster — Student Academic Performance Dashboard

A full-stack ML dashboard that clusters students using **KMeans** and predicts new student groups with a **Decision Tree**, built with **React + FastAPI**.

---

## 📁 Project Structure

```
student-academic-clustering/
├── client/          # React + Vite + TailwindCSS v4
└── server/          # FastAPI + scikit-learn
```

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd server

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend (React)

```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open: http://localhost:5173

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/` | All students + summary stats |
| GET | `/students/correlation` | Correlation matrix for heatmap |
| POST | `/students/upload` | Upload new CSV dataset |
| POST | `/students/retrain` | Retrain all ML models |
| GET | `/clusters/?n_clusters=3` | KMeans clustering results |
| GET | `/clusters/elbow?max_k=10` | Elbow method data |
| POST | `/predict/` | Predict student cluster |

---

## 🤖 ML Algorithms

### KMeans Clustering
- Features: `study_hours`, `attendance`, `exam_score`
- StandardScaler normalization
- Cached with `joblib`
- PCA for 2D visualization
- Elbow method for optimal k

### Decision Tree Classifier
- Trained on KMeans cluster labels
- max_depth=5 to avoid overfitting
- Returns predicted cluster + confidence

---

## 📊 Features

- ✅ Dark / Light theme (persisted in localStorage)
- ✅ Interactive scatter plot with cluster colors
- ✅ Correlation heatmap
- ✅ Elbow method chart
- ✅ Cluster statistics cards
- ✅ At-risk student detection
- ✅ Interactive prediction with sliders
- ✅ CSV upload + model retraining
- ✅ Redux state management
- ✅ Responsive layout

---

## 📋 Dataset Format

```csv
student_id,study_hours,attendance,assignment_score,exam_score
S0001,7.5,92.3,88.1,91.4
S0002,2.1,55.0,41.2,38.9
...
```

A synthetic 300-student dataset is included in `server/dataset/students.csv`.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TailwindCSS v4, Redux Toolkit, Recharts, Lucide |
| Backend | FastAPI, Uvicorn, Pandas, NumPy, scikit-learn, joblib |
| ML | KMeans, Decision Tree, StandardScaler, PCA |
