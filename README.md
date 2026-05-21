# 🗓️ Intelligent Timetable Generator

An AI-powered academic timetable generator using a **Genetic Algorithm**.
Automatically creates conflict-free timetables for multiple class sections
in seconds.

---

## 🚀 Features

- **Genetic Algorithm Engine** — Evolves conflict-free timetables automatically
- **Multi-section scheduling** — Handles A and B sections without teacher clashes
- **Elective subject pairing** — CC/HCA type subjects forced to same slot
- **Lab subject handling** — Labs assigned 2 consecutive slots automatically
- **Manual override** — Drag and drop slots, edit any slot via modal
- **History** — Save, view and delete previously generated timetables
- **PDF Export** — Download timetable as a colored PDF
- **JWT Authentication** — Secure admin login

---

## 🧬 Genetic Algorithm Details

| Component | Implementation |
|-----------|---------------|
| Encoding | Value encoding — each gene = one lecture slot |
| Population | 50 chromosomes per generation |
| Selection | Truncation selection (top 10) |
| Crossover | Uniform crossover |
| Mutation | Random resetting (10% rate) |
| Replacement | Elitist steady-state (top 2 preserved) |
| Termination | Score = 0 or 100 generations |

**Fitness Function:**
- Hard constraint violation (teacher clash, room clash) → **-100 points**
- Soft constraint violation (consecutive overload) → **-10 points**
- Perfect timetable = **score 0**

---

## 🛠️ Tech Stack

**Backend**
- Python 3.11
- Flask + Flask-SQLAlchemy
- Flask-JWT-Extended
- PostgreSQL
- Genetic Algorithm (custom implementation)

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- @dnd-kit (drag and drop)
- jsPDF + jspdf-autotable (PDF export)
- Axios

---

## 📁 Project Structure
timetable-generator/
├── backend/
│   ├── app/
│   │   ├── ga/              # Genetic Algorithm engine
│   │   │   ├── chromosome.py
│   │   │   ├── fitness.py
│   │   │   ├── operators.py
│   │   │   └── engine.py
│   │   ├── models/          # Database models
│   │   ├── routes/          # REST API endpoints
│   │   └── init.py
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
└── frontend/
└── src/
├── pages/           # React pages
├── components/      # Reusable components
├── context/         # Auth context
└── api/             # Axios API helper

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 15+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timetable_db
DB_USER=postgres
DB_PASSWORD=your_password

```bash
python run.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---


## 👨‍💻 Author

Built as a mini project to demonstrate full-stack development with
algorithm design using Genetic Algorithms.
