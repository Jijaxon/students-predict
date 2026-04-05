# 🎓 EduCluster - Algoritm Solishtirish Tizimi (To'liq Tushuntirish)

> **Sana:** 2024-yil  
> **Tilida:** Uzbek tilida tushuntirish  
> **Maqsad:** KMeans va DBSCAN algoritmlarini solishtirish

---

## 📋 Mündəricat

1. [Backend Arxitekturasi](#backend-arxitekturasi)
2. [Frontend Arxitekturasi](#frontend-arxitekturasi)
3. [Algoritmlarnin Tavsifi](#algoritmlarnin-tavsifi)
4. [API Endpoint'lari](#api-endpointlari)

---

## Backend Arxitekturasi

### 🔧 Fayllar Tuzilishi

```
server/app/
├── services/
│   ├── evaluation_service.py        # Metrikalarni hisoblab beruvchi modul
│   ├── dbscan_service.py            # DBSCAN algoritmi
│   ├── comparison_service.py        # Ikkita algoritmni solishtirish
│   └── clustering_service.py        # KMeans algoritmi (oldindan kodi bor)
├── api/routes/
│   └── clustering.py                # API yo'llari
└── utils/
    └── preprocessing.py             # Ma'lumotlarni tayyorlash
```

---

## 🧠 Backend Kodlari Tushuntirishi

### 1️⃣ evaluation_service.py - Metrikalar Hisoblash

**Maqsadi:** Klasterlash algoritmlarini baholash uchun 5 ta metrika hisoblab beradi.

#### 📊 Beshta Metrika:

```python
def evaluate_clustering(X, labels, true_labels=None):
    """
    Klasterlash natijasini baholash.

    X: Ma'lumotlar matritsa (300 ta o'quvchi × 3 ta xususiyat)
    labels: Algoritm tomonidan belgilangan klaster raqamlari
    true_labels: Agar ma'lum bo'lsa, haqiqiy klaster raqamlari

    Qaytaradi: Metrikalar lug'ati
    """
```

**Metrika 1: Silhouette Score ([-1, 1] oraliq)**

```
Nima?  O'quvchi o'zining klasteriga qancha yaqin ekanligini o'lchaydigan qiymat
Yaxshi? +1 ga yaqin bo'lsa yaxshi
Yomon? -1 ga yaqin bo'lsa yomon

Misol:
- Silhouette = 0.75  ✓ (O'quvchi o'z klasterida to'g'ri joyida)
- Silhouette = 0.05  ⚠️ (O'quvchi klaster chegarasida)
- Silhouette = -0.3  ❌ (O'quvchi noto'g'ri klasterlashtirilgan)
```

**Metrika 2: Davies-Bouldin Index (Pastroq yaxshi)**

```
Nima?  Klaster ichidagi uzoqlikni, klasterlar orasidagi uzoqlikka nisbati
Yaxshi? Qiymati pastroq bo'lsa (1-2 oraliq) yaxshi
Yomon? Qiymati yuqori bo'lsa yomon

Mantiq:
- Klasterlar o'zaro yaqin bo'lsa → yomon (qayta-qamarlanish)
- Klasterlar o'zaro uzoq bo'lsa → yaxshi (yaxshi ajratilgan)
```

**Metrika 3: Calinski-Harabasz Index (Yuqoriroq yaxshi)**

```
Nima?  Klasterlar orasidagi farqni, klaster ichidagi bir-birligivga nisbati
Yaxshi? Qiymati yuqori bo'lsa yaxshi (100+ ideal)
Yomon? Qiymati pastki bo'lsa yomon

Sabab:
- Yuqori qiymat = Klasterlar aniq ajratilgan
- Past qiymat = Klasterlar aralashgan
```

**Metrika 4 & 5: Adjusted Rand Index va Fowlkes-Mallows Index**

```
Ular haqiqiy etiketlar bilan solishtirish uchun ishlatiladi
(Agar o'quvchilarning haqiqiy sinfini bilsak)
```

---

### 2️⃣ dbscan_service.py - DBSCAN Algoritmi

**Algoritm Nima?**

```
DBSCAN = Density-Based Spatial Clustering of Applications with Noise
(Zichlik-asosdan klasterlash)

Odatiy holatlarda:
- O'quvchilar "to'p-to'pga" to'plashadi
- DBSCAN bu to'plarni topib, yo'ldan chetda qolgan o'quvchilarni
  "Shuovlar" deb belgilaydi

Misol:
┌─────────────────────┐
│ ●●●    ✕    ●●●●   │ ← ● = o'quvchi, ✕ = shuovlar
│ ●●●●        ●●●    │    Jingalak to'plar = klasterlar
│  ●●         ●●●●   │
└─────────────────────┘
```

**Asosiy Parametrlar:**

```python
def find_optimal_eps(X, k=4):
    """
    eps - bu "qo'shnilash radiusi"

    Misol: eps=0.5 degan maoni:
    - Har bir o'quvchidan 0.5 birlik masofada bo'lgan boshqa
      o'quvchilar uni "qo'shni" deb hisoblanadi

    Qanday topsan?
    1. Har bir o'quvchining 4-qo'shnisigacha bo'lgan masofani o'lcho
    2. Bu masofalarni saralash (kamdin-kam)
    3. Burilish nuqtasini (elbow) topsang - shu eps!
    """
```

**Asosiy Ishlash Jarayoni:**

```python
def train_dbscan(df: pd.DataFrame, eps=None, min_samples=5):
    """
    1. Ma'lumotlarni normallash (standartlash)
       - Hamma qiymatlarni -3 dan +3 oralig'iga keltirish

    2. DBSCAN ni o'rnatish
       - eps=0.45 (o'zgaruvchan, avtomatik topish mumkin)
       - min_samples=5 (klaster bo'lishi uchun minimal 5 o'quvchi kerak)

    3. Modelni saqlash
       - Qattiq diskda saqlash (joblib.dump)
       - Ram'da kesh qilish (tezlik uchun)
    """
```

**Klaster Statistikasi:**

```python
def get_dbscan_clusters(eps=None, min_samples=5):
    """
    Qaytaradigan ma'lumotlar:

    {
        "students": [
            {"student_id": "S0001", "cluster": 0, "pca_x": 1.5, "pca_y": -0.3},
            {"student_id": "S0002", "cluster": 1, "pca_x": -2.1, "pca_y": 0.8},
            ...
        ],
        "cluster_stats": [
            {
                "cluster_id": 0,
                "size": 45,  # shu klasterdagi o'quvchilar soni
                "avg_study_hours": 6.5,   # o'rtacha o'rganish soati
                "avg_exam_score": 85.3,   # o'rtacha imtihon balli
                "label": "High Performers"  # klaster nomi
            },
            ...
        ],
        "n_clusters": 3,      # topilgan klasterlar soni
        "n_noise": 5,         # shuovlar (yo'ldan chetda qolgan)
        "eps": 0.45,          # foydalanilgan eps qiymati
    }
    """
```

---

### 3️⃣ comparison_service.py - Algoritmlarnin Solishtirishi

**Maqsadi:** KMeans va DBSCAN ni bir xil ma'lumotlar ustida ishlatib, natijalarni taqqosla.

```python
def compare_clustering_algorithms(n_clusters=3, eps=None, min_samples=5):
    """
    Jarayoni:

    1️⃣ KMeans ishga tushirish
       - 3 ta klaster yaratish (n_clusters=3)
       - Har bir o'quvchini eng yaqin klaster markaziga tayinlash

    2️⃣ DBSCAN ishga tushirish
       - Zichlik-asosdan klasterlarni topish
       - Yo'ldan chetda qolgan o'quvchilarni aniqlash

    3️⃣ Ikkisining metrikalarini hisoblash
       - Silhouette Score
       - Davies-Bouldin Index
       - Calinski-Harabasz Index

    4️⃣ G'alaba belgilash
       - Har bir metrika uchun qaysi algoritm yaxshi ekanligini aniqlash
       - Umumiy g'alaba hisoblab berish

    5️⃣ PCA visualization
       - 3 o'lchamni 2 o'lchamga kamaytirish (vizuallashtirishga)
       - Scatter plot uchun x,y koordinatalari tayyorlash
    """
```

**Qaytarigan Ma'lumotlar:**

```python
{
    "algorithms": {
        "kmeans": {
            "name": "KMeans",
            "n_clusters": 3,
            "inertia": 245.67,  # Klasterlashning sifat o'lchami
        },
        "dbscan": {
            "name": "DBSCAN",
            "cluster_count": 4,  # Topilgan klasterlar
            "noise_count": 8,    # Shuovlar
            "eps": 0.45,         # Foydalanilgan eps
        }
    },

    "metrics": {
        "kmeans": {
            "silhouette_score": 0.624,
            "davies_bouldin_index": 1.234,
            "calinski_harabasz_index": 156.8
        },
        "dbscan": {
            "silhouette_score": 0.589,
            "davies_bouldin_index": 1.456,
            "calinski_harabasz_index": 142.3
        }
    },

    "overall_winner": "KMeans",  # Qaysi yaxshi?
    "kmeans_wins": 2,            # KMeans 2 ta metrikada g'alaba
    "dbscan_wins": 1,            # DBSCAN 1 ta metrikada g'alaba

    "visualization": {
        "kmeans": [...],  # Scatter plot uchun nuqtalar
        "dbscan": [...],  # Scatter plot uchun nuqtalar
        "explained_variance": [0.52, 0.35]  # PCA muhimi
    }
}
```

---

### 4️⃣ clustering.py - API Endpoint'lari

**Yangi Endpoint:**

```python
@router.get("/clusters/compare")
async def compare_algorithms(
    n_clusters: int = 3,        # KMeans uchun klaster soni
    eps: float = None,          # DBSCAN uchun (avtomatik topish)
    min_samples: int = 5,       # DBSCAN uchun minimal o'quvchi
):
    """
    Frontend bu endpoint ga POST qilganda:
    GET http://localhost:8000/clusters/compare?n_clusters=3

    Qaytarish: Ikkita algoritmning to'liq taqqoslash natijalari
    """
```

---

## Frontend Arxitekturasi

### 📱 React Struktura

```
client/src/
├── pages/
│   ├── Comparison.jsx           # YANGI: Solishtirish sahifasi
│   ├── Clustering.jsx           # KMeans klasterlash
│   ├── Dashboard.jsx            # Bosh sahifa
│   └── PredictStudent.jsx       # O'quvchi prognozi
├── store/
│   └── studentSlice.js          # Redux: Ma'lumot saqlagich
├── components/
│   ├── Navbar.jsx               # Menu (yangilangan)
│   └── ...
```

---

## 💾 Redux Store - studentSlice.js

**Redux nima?** - Ma'lumotlarni markaziy joydan boshqaradi (butun app foydalanadi)

### Yangilangan Qismlar:

```javascript
// 1️⃣ YangiThunk (API chaqirish uchun)
export const fetchClusteringComparison = createAsyncThunk(
    'students/fetchComparison',
    async ({ nClusters = 3, eps = null, minSamples = 5 } = {}) => {
        // Frontend bu funktsiyani chaqirganda:
        const params = new URLSearchParams()
        params.append('n_clusters', nClusters)
        if (eps !== null) params.append('eps', eps)
        params.append('min_samples', minSamples)

        // Backend ga request yuborish
        const res = await api.get(`/clusters/compare?${params.toString()}`)
        return res.data  // Javobni qaytarish
    }
)

// 2️⃣ Redux Store ga yangi state
initialState: {
    // ... oldingi state ...
    comparisonData: null,      // API dan olingan solishtirish ma'lumoti
    loadingComparison: false,  // Loading holati
}

// 3️⃣ Reducer'lar (ma'lumot yangilash)
extraReducers: (builder) => {
    builder
        .addCase(fetchClusteringComparison.pending, (state) => {
            state.loadingComparison = true  // Cheklash
            state.comparisonData = null     // Bo'sh qilish
        })
        .addCase(fetchClusteringComparison.fulfilled, (state, action) => {
            state.loadingComparison = false
            state.comparisonData = action.payload  // Ma'lumot saqlash
        })
        .addCase(fetchClusteringComparison.rejected, (state, action) => {
            state.loadingComparison = false
            state.error = action.error.message  // Xato saqlash
        })
}
```

---

## 🎨 Frontend UI - Comparison.jsx

**Sahifa Qismlari:**

### 1️⃣ Header Section

```jsx
<h1>Algorithm Comparison</h1>
<p>KMeans vs DBSCAN: Performance Analysis & Metrics</p>

// K-claster tanlash (2, 3, 4, 5)
[2, 3, 4, 5].map(k => (
    <button onClick={() => setNClusters(k)}>
        {k}
    </button>
))

// Hisoblash tugmasi
<Button onClick={handleRunComparison}>
    Run Comparison
</Button>
```

### 2️⃣ Overall Winner Card

```jsx
// Katta kartocha - kim yaxshi ekanligini ko'rsatish

if (overall_winner === 'KMeans') {
	;<Card className='winner-kmeans'>
		🏆 KMeans
		<p>KMeans 2 ta metrikada g'alaba</p>
		<p>DBSCAN 1 ta metrikada g'alaba</p>
	</Card>
}
```

### 3️⃣ Algorithm Info Cards

```jsx
// Chap tomonda: KMeans ma'lumoti
<Card>
    📊 KMeans
    - Number of Clusters: 3
    - Inertia: 245.67
    - Description: Markaz-asosdan klasterlash
</Card>

// O'ng tomonda: DBSCAN ma'lumoti
<Card>
    🔍 DBSCAN
    - Clusters Found: 4
    - Noise Points: 8
    - Eps (ε): 0.45
    - Description: Zichlik-asosdan klasterlash
</Card>
```

### 4️⃣ Metrics Comparison Chart

```jsx
// Bar chart - metrikalarni taqqoslash
// X o'qida: Silhouette, Davies-Bouldin, Calinski-Harabasz
// Y o'qida: Qiymatlar (0-1 normalda)

BarChart(
	(data = [
		{ metric: 'Silhouette', kmeans: 0.624, dbscan: 0.589 },
		{ metric: 'Calinski-Harabasz', kmeans: 0.98, dbscan: 0.89 },
		{ metric: 'Davies-Bouldin', kmeans: 0.9, dbscan: 0.85 },
	]),
)
```

### 5️⃣ Cluster Visualization - Side by Side

```jsx
// Chap: KMeans scatter plot
<ScatterChart>
    // Rangli nuqtalar (klaster = rang)
    // Cluster 0 = qizil, Cluster 1 = ko'k, Cluster 2 = sariq
    // X o'qi = PC1 (birinchi asosiy komponenta)
    // Y o'qi = PC2 (ikkinchi asosiy komponenta)
</ScatterChart>

// O'ng: DBSCAN scatter plot
<ScatterChart>
    // Shunovlar = kichik romb shakli ◇
    // Klasterlar = yumshoq nuqtalar ●
</ScatterChart>
```

### 6️⃣ Detailed Metrics Table

```jsx
// Har bir metrika uchun alohida karta

for each metric in ['silhouette', 'davies_bouldin', 'calinski_harabasz']:
    <Card>
        <h4>Silhouette Score</h4>
        <p>Nima? O'quvchi o'z klasterida qancha yaxshi</p>

        <div>KMeans: 0.624 ✓ Winner</div>
        <div>DBSCAN: 0.589</div>
    </Card>
```

### 7️⃣ Key Insights

```jsx
// Xulosa va tavsiyal

if (overall_winner === 'KMeans') {
	;<Alert type='success'>
		✓ KMeans bu ma'lumotlar uchun yaxshi Sabablar: - Muvozanatli klasterlar -
		O'quvchilar aniq ajratilgan
	</Alert>
}
```

---

## 🔄 Ishlash Jarayoni (User Perspektivasi)

### 1️⃣ Foydalanuvchi "Comparison" Sahifasiga Kirganda

```
Frontend:
1. useEffect chaqiriladi → handleRunComparison ishga tushadi
2. dispatch(fetchClusteringComparison({ nClusters: 3 }))
3. Redux state: loadingComparison = true

Backend:
4. GET /clusters/compare?n_clusters=3 request olinadi
5. compare_clustering_algorithms(3) funksiyasi ishga tushadi

Ichida:
6. KMeans modelini yuklash: get_kmeans(3)
7. DBSCAN modelini ishga tushirish: get_dbscan()
8. Ikkitasini X ma'lumotlar ustida prediction berish
9. Metrikalarnin hisoblash: evaluate_clustering()
10. Ikkitani solishtirish: comparison_summary
11. PCA bilan 3D ni 2D ga kamaytirish
12. JSON tarzida qaytarish

Frontend:
13. Redux state: comparisonData = response.data
14. Redux state: loadingComparison = false
15. Componentlar re-render qilinadi (yangi ma'lumot bilan)
16. Chart'lar va kartalar ko'rinadi
```

---

### 2️⃣ Foydalanuvchi K-qiymatini O'zgartirganda

```
Frontend:
1. setNClusters(4) funksiyasi chaqiriladi
2. handleRunComparison() ni o'ziga togrila ishlaydi
3. dispatch(fetchClusteringComparison({ nClusters: 4 }))

Backend:
4. KMeans ni 4 ta klaster bilan o'rnatish
5. DBSCAN ni yangi eps bilan o'rnatish (agar kerak bo'lsa)
6. Hammasini qayta baholash va solishtirish
7. Yangi natijalarnin qaytarish

Frontend:
8. Chartlar va kartalar yangi ma'lumot bilan yangilanadi
```

---

## 📊 Metrika Tushunchalari (Oson Versiya)

### 🎯 Silhouette Score (Klassik Misol)

```
Tasavvur qiling:
- 5 ta o'quvchi: A, B, C, D, E
- 2 ta klaster: Klaster 1 = {A, B, C},  Klaster 2 = {D, E}

O'quvchi A uchun:
1. A ning o'z klasteridagi o'rtacha masofasi = 2
2. A ning boshqa klasteridagi o'rtacha masofasi = 10
3. Silhouette = (10 - 2) / max(2,10) = 8/10 = 0.8 ✓

Izohli:
- 0.8 juda yaxshi (A o'z klasterida to'g'ri)
- 0.5 va-vala (A klaster chegarasida)
- -0.5 yomon (A xato klasterlashtirilgan)
```

### 🎯 Davies-Bouldin Index

```
Misol:
Klaster 1: Markazdan avg masofasi = 1.5 (o'zaro yaqin)
Klaster 2: Markazdan avg masofasi = 1.3 (o'zaro yaqin)
Klasterlar orasidagi masofasi = 8 (uzoq)

Davies-Bouldin = (1.5+1.3)/8 = 0.35 ✓ (pastki = yaxshi)

Agar:
Klaster 1: 2.0 (o'zaro uzoq)
Klaster 2: 1.8 (o'zaro uzoq)
Klasterlar orasidagi masofasi = 2.5 (yaqin)

Davies-Bouldin = (2.0+1.8)/2.5 = 1.52 ❌ (yuqori = yomon)
```

### 🎯 Calinski-Harabasz Index

```
Nisbat:
- Yuqori = klasterlar ajratilgan
- Past = klasterlar aralashgan

Misollar:
- Kalinski = 200 ✓ (juda yaxshi, klasterlar aniq ajratilgan)
- Kalinski = 80  🤔 (o'rtacha)
- Kalinski = 30  ❌ (yomon, klasterlar aralashgan)
```

---

## 🚀 Qanday Ishlatish?

### Backend Startga Olish:

```bash
cd server

# Virtual environment yaratish
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Backend serverini ishga tushirish
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Startga Olish:

```bash
cd client

# Kutubxonalarni o'rnatish
npm install

# Frontend development serverini ishga tushirish
npm run dev
```

### Browser'da Tekshirish:

```
1. http://localhost:5173  ← Frontend shu yerde
2. "Comparison" sahifasiga o'tish (Navbar'dan)
3. "Run Comparison" tugmasini bosish
4. Natijalarni ko'rish
```

---

## 🎓 Quyidagi Git Fetch Qilinadigan Ma'lumotlar:

| Parameter     | Qiymat | Tavsifi                           |
| ------------- | ------ | --------------------------------- |
| `n_clusters`  | 2-10   | KMeans uchun klaster soni         |
| `eps`         | float  | DBSCAN radiusi (avtomatik topish) |
| `min_samples` | 2-20   | DBSCAN uchun minimal o'quvchilar  |

---

## 📌 Xulosa

```
Qisqa qilib aytganda:

1. BACKEND:
   ✓ evaluation_service.py → 5 ta metrika hisoblab beradi
   ✓ dbscan_service.py → DBSCAN algoritmini ishga tushiradi
   ✓ comparison_service.py → Ikkitani solishtiradi
   ✓ clustering.py API → /clusters/compare endpoint beradi

2. FRONTEND:
   ✓ Redux → comparisonData state'i saqlaydi
   ✓ Comparison.jsx → Ishoratni ko'rsatadi
   ✓ Navbar.jsx → "Comparison" linkini qo'shadi
   ✓ App.jsx → /comparison routeshni qo'shadi

3. ISHLASH:
   ✓ Foydalanuvchi tugmani bosganda → Backend ishga tushadi
   ✓ Backend metrikalarnin hisoblab beradi → Frontend'ga qaytaradi
   ✓ Frontend scatter plot'larni ko'rsatadi
   ✓ Foydalanuvchi g'alaba natijalasini ko'radi
```

---

## 🔗 Qayta Ishlatiladigan Kod (DRY Printsipi)

```python
# Eski kod (Clustering.jsx):
useSelector(s => s.students.clusters)

# Yangi kod (Comparison.jsx):
useSelector(s => s.students.comparisonData)

# Ikkisi ham Redux'dan olinadi
# Kodda takrorlanish yo'q ✓
```

---

## 📝 Xatoliklarnin Hal Qilish

### Agar /clusters/compare 404 error bersa:

```
1. Backend ichida clustering.py tekshirish:
   @router.get("/clusters/compare")  # Bu bo'lishi kerak

2. app.main.py tekshirish:
   app.include_router(clustering.router)  # Bu bo'lishi kerak

3. Terminal'da backend restartga olish:
   Ctrl+C → uvicorn app.main:app --reload
```

### Agar Frontend ma'lumot ko'rsatmasa:

```
1. Redux DevTools orqali tekshirish:
   - comparisonData null emasmi?
   - loadingComparison false emasmi?

2. Network Tab'ni tekshirish (F12):
   - /clusters/compare request kelishmi?
   - Response 200 mi?
   - Ma'lumotlar duzuvimi?
```

---

## 🎉 Tayyor!

Endi sizda to'liq ishlayotgan **KMeans vs DBSCAN** taqqoslash tizimi bor!

**Qo'shimcha xususiyatlar shunaqa qilinishi mumkin:**

- CSV fayldan ma'lumot yuklash → Model qayta o'rnatish
- HDBSCAN algoritmi qo'shish → Yana yaxshi natijalalar
- Custom K-orta soni → Foydalanuvchi o'zi tanlashi
- Ma'lumot guruhlari → Turli guruh foydalanuvchilari

**Savollar bo'lsa, qo'shimcha tushuntirish beraman!** 🚀
