# Blood-Alert-System
🩸 Blood Alert

Real-Time Blood Shortage Alerts & Donor Mobilization System






---

**📌 Overview**

Blood Alert is a real-time web platform built to connect hospitals, blood banks, and donors instantly during emergencies.

🚨 Hospitals raise urgent blood requests.

🩸 The system matches eligible donors by blood group, location, and donation history.

📩 Donors are instantly notified.


This project was designed for fast deployment, responsive UI, and real-time tracking, making it perfect for hackathons and real-world implementation.


---

✨ Features

✅ Role-based Dashboard — Hospitals, Blood Banks, Admins
✅ Donor Registration — Blood group, area, last donation date
✅ Emergency Requests — Raise, track, and fulfill requests
✅ Blood Inventory Management — IN/OUT stock with Chart.js graphs
✅ Offline Demo Mode — Stores in localStorage for quick testing
✅ Live Backend Mode — MongoDB database with full API


---

**🛠 Tech Stack**

Frontend

HTML5, CSS3, Vanilla JavaScript

Chart.js for blood stock visualization

Responsive design for desktop & mobile


Backend

Node.js + Express.js (REST APIs)

MongoDB + Mongoose (Database)

CORS & dotenv for environment configuration



---

**🚀 Getting Started**

1️⃣ Backend Setup

cd server
npm install
npm start

Server will run at http://localhost:5000

2️⃣ Frontend Setup

Option A — Open index.html with Live Server (VS Code Extension)
Option B — Serve via backend (public folder)


---

**📊 System Flow**

1. Donors register with blood group, location, and last donation date.


2. Hospitals raise alerts specifying required blood type and units.


3. System matches donors and updates hospital dashboard.


4. Inventory is updated with IN/OUT records to keep stock in sync.




---

**🎯 Why Blood Alert?**
In emergencies, minutes can save lives.
Blood Alert ensures that the right donors are notified instantly, hospitals can monitor requests in real time, and blood banks can keep inventory up to date — all in one streamlined platform.
