# Training Unit Management System 🏫

> **A lightning-fast, offline-first Windows desktop application built to streamline educational administration.**

🔒 **Note on Confidentiality:** *To respect client privacy and data security, all specific school branding, logos, and identifying information have been scrubbed and replaced with generic placeholders in this public repository.*

A comprehensive, native desktop software developed for a school's training unit. The system digitizes the management of employees, strategic plans, goals, and training reports, while maintaining an integrated local video library. 

## 🚀 Tech Stack
* **Frontend UI:** React.js (Highly responsive, modern interface)
* **Desktop Framework:** Tauri (Rust-based, ensuring a tiny footprint and native Windows performance)
* **Architecture:** Offline-First (Local embedded database, zero cloud dependency)
* **Key Features:** Client-side PDF generation, Local file-system media management

## 👨‍💻 My Role (Sole Software Engineer)
I was contracted by the school's administration to digitize their paper-heavy workflow. I acted as the sole technical partner: gathering their specific requirements, designing the UI/UX, and developing the end-to-end native Windows application. 

## 🧠 Architecture & Technical Challenges Overcome

The client strictly required a native Windows executable that was highly responsive, completely offline, and capable of generating complex reports securely on local machines. 

**The Solution:**
Instead of relying on heavy frameworks like Electron, I utilized **Tauri** to bridge a modern React frontend with a lightweight Rust backend. This architectural decision provided several massive benefits:
1. **Offline-First Security:** By utilizing a local database, all sensitive employee data and school plans remain entirely on the client's machine, eliminating backend server costs and data privacy concerns.
2. **Local Media Handling:** Bypassing standard web browser limitations, I leveraged Tauri's native OS APIs to seamlessly access and stream the school's local video training library directly within the app.
3. **Data-to-PDF Pipeline:** I engineered a client-side reporting module that takes complex, relational local data (goals, employee stats, and plans) and dynamically renders them into formatted PDF documents ready for printing.

**The Result:** A smooth, secure, and modern desktop application tailored precisely to the administration's needs, delivered as a lightweight `.exe` file.