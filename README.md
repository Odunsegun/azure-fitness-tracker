# 🏋️‍♂️ Fitness Tracker API & Dashboard

A full-stack fitness tracking application built with **Azure Functions (API)** and **React + Tailwind (Dashboard)**.  
The project logs workouts, calories, and activities, and visualizes progress with charts and stats.  

Deployed on:  
- 🌐 **Azure Static Web Apps** → [Live Demo](https://wonderful-forest-08c0abc0f.1.azurestaticapps.net/)  
- ▲ **Vercel** → [Live Demo](https://azure-fitness-tracker-icqm.vercel.app/) (optional link once you deploy)  

---

## 🚀 Features
- 📊 Interactive dashboard with charts (calories, minutes, sessions).  
- 🧩 Modular API using **Azure Functions**.  
- ☁️ **Cosmos DB (planned)** for data persistence.  
- ⚡ CI/CD with **GitHub Actions → Azure Static Web Apps**.  
- 🎨 Responsive design with **React + TailwindCSS**.  

---

## 📂 Project Structure
```bash
azure-fitness-tracker/
│── fitness-dashboard/     # React + Tailwind frontend
│   ├── src/               # Components & pages
│   ├── public/            # Static assets
│   └── package.json       # Frontend config
│
│── function_app.py        # Azure Function entrypoint
│── host.json              # Azure Functions host config
│── requirements.txt       # Python dependencies (API)
│
│── .github/workflows/     # GitHub Actions CI/CD
│── README.md              # Project documentation
```

---

## 🛠️ Tech Stack
- **Frontend:** React, TailwindCSS, Recharts  
- **Backend:** Azure Functions (Python)  
- **Database:** Cosmos DB (planned)  
- **Deployment:** Azure Static Web Apps + GitHub Actions  
- **Extras:** ESLint, Prettier  

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/Odunsegun/azure-fitness-tracker.git
cd azure-fitness-tracker
```

### 2. Install frontend dependencies
```bash
cd fitness-dashboard
npm install
npm start
```

### 3. Run Azure Functions locally
```bash
cd ..
func start
```

---

## 📦 Deployment

### Azure Static Web Apps
This project is connected to **GitHub Actions**. Pushing to `main` triggers a redeploy automatically.

### Vercel (Optional)
1. Go to [vercel.com](https://vercel.com).  
2. Import your GitHub repo.  
3. Set project root to `/fitness-dashboard`.  
4. Build command: `npm run build`  
5. Output directory: `build`  

---

## 📸 Screenshots  
*(here)*  

---

## 📌 Roadmap
- [ ] Integrate Cosmos DB for persistent storage  
- [ ] Add authentication (Entra ID / OAuth)  
- [ ] Expand activity types & analytics  
- [ ] Mobile-optimized PWA  

---

## 👤 Author
**Israel Odunaiya**  
- 💼 [LinkedIn](https://www.linkedin.com/in/oluwasegun-odunaiya-444387205/)  
- 🌐 [Portfolio](https://profile-nine-sepia.vercel.app/)  
- 🐙 [GitHub](https://github.com/Odunsegun)  

---

🔥 This project demonstrates **cloud deployment, full-stack integration, and DevOps automation**.
