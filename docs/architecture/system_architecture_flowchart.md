# 🏛️ **System Architecture Flowchart**  

## 📡 Cloud ☁️ Capture  
📅 *Feb 9, 2025*  

---

## 📐 **Cloud Capture System Overview**  

This **System Architecture Diagram** illustrates the **interaction flow** between different components within Cloud Capture.  

---

```mermaid
flowchart TD

    Client[📱 Client Device] -->|🔗 HTTPS Request| WebApp[🌐 Web App (React/Next.js)]

    WebApp -->|🔌 API Calls| APIGateway[🖥️ API Gateway (Node.js/Express/GraphQL)]

    APIGateway --> Auth[🔑 Authentication Service (Firebase/OAuth)]
    APIGateway --> AIService[🤖 AI Processing (OpenAI)]
    APIGateway --> Database[🗄️ Supabase PostgreSQL Database]
    APIGateway --> CloudStorage[☁️ AWS S3] (TBD)

    AIService --> CloudStorage
    CloudStorage --> CDN[🚀 Cloudflare CDN] (TBD)
```

---

## 🛠️ **System Components**  

### 📱 **Client (User Devices)**  
✔️ Users access Cloud Capture via **mobile & desktop browsers**.  
✔️ **QR-based login** for frictionless event entry.  

### 🌐 **Web App (Frontend)**  
✔️ **Next.js + React.js** for dynamic user experiences.  
✔️ **Tailwind CSS** for responsive design.
✔️ **Shadcn UI** for rapid UI development.  

### 🖥️ **API Gateway (Backend)**  
✔️ **Node.js + Express.js + GraphQL API**.  
✔️ Routes requests to **authentication, AI, database, and storage layers**.  

### 🔑 **Authentication Service**  
✔️ **Supabase Auth, OAuth 2.0** for secure access.  
✔️ Supports **Google, Apple, & social logins**.  

### 🤖 **AI Processing Layer**  
✔️ **OpenAI** enhance and categorize images.  
✔️ **Duplicate & quality detection, facial recognition**.  

### 🗄️ **Database (PostgreSQL)**  
✔️ Stores **user profiles, event details, and metadata**.  
✔️ **Supabase integration** for real-time data.  

### ☁️ **Cloud Storage (AWS S3)**  
✔️ Securely **stores all event photos**.  
✔️ **Cloudflare CDN integration** for fast delivery.  

---

## 🔒 **Security & Performance Considerations**  
✔️ **JWT Authentication** – Secure login and API access.  
✔️ **End-to-End Encryption** – Protects all user data.  
✔️ **Global CDN Optimization** – Ensures low-latency content delivery.  

---

## 🎯 **Conclusion**  
This **System Architecture Flowchart** provides a **clear, structured overview** of Cloud Capture’s backend, frontend, and AI-driven operations. Designed for **scalability, security, and real-time performance**, Cloud Capture **delivers a next-gen event photography experience**. 🚀  

---
