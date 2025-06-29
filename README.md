# TimetableProject

#### 📦 1. INSTALL NODE.JS AND NPM

**Node.js** includes both the `node` runtime and `npm` (Node Package Manager).

**Steps:**

1. Go to: [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (Long-Term Support)

   * It will be a file like `node-v18.x.x-x64.msi`
3. Run the `.msi` installer:

   * Accept license agreement
   * Select **default** options
   * ✅ Make sure "Add to PATH" is selected
4. After installation completes:

   * Open **Command Prompt**
   * Type:

     ```bash
     node -v
     npm -v
     ```
   * You should see version numbers like:

     ```
     v18.19.1
     9.6.7
     ```

---

#### 📦 2. INSTALL MONGODB & MONGODB COMPASS

**MongoDB** is your database server. **Compass** is the GUI to view your collections.

**Steps:**

1. Go to: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

2. Choose:

   * Version: **Current** or **LTS**
   * Package: `.msi`
   * Platform: **Windows**

3. During installation:

   * Select **Complete**
   * ✅ Keep **MongoDB Compass** checked
   * ✅ Enable MongoDB as a **Windows service**
   * Finish installation

4. Once installed, MongoDB will start running as a background service.

---

#### 🧪 3. CONNECT TO MONGODB USING COMPASS

1. Open **MongoDB Compass**
2. In the **Connection String field**, type:

   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**

✅ Now you’re connected to your local MongoDB server.

---

#### 📁 4. PROJECT STRUCTURE

Suppose your project folder is like this:

```
TimetableProject/
├── backend/
│   ├── server.js
│   ├── package.json
├── frontend/
│   ├── package.json
├── .env (inside backend)
```

---

#### ⚙️ 5. INSTALL NODE MODULES

1. Open **Command Prompt**
2. Navigate to the project root folder (e.g., where you unzipped):

   ```bash
   cd C:\Users\YourName\Downloads\TimetableProject
   ```

##### ⬅ Backend:

```bash
cd backend
npm install        # installs all server dependencies
```

##### ➡ Open new CMD for frontend:

```bash
cd C:\Users\YourName\Downloads\TimetableProject\frontend
npm install        # installs React dependencies
```

---

#### ▶️ 6. RUN THE PROJECT

##### In backend terminal:

```bash
node server.js     # Starts the backend server at http://localhost:5000
```

##### In frontend terminal:

```bash
npm start          # Opens the app at http://localhost:3000
```

---

#### 🔍 7. VERIFY MONGODB IS CONNECTED

1. Make sure `.env` file in **backend** contains:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/ttDB
   PORT=5000
   ```
2. MongoDB will automatically create the `ttDB` when you insert data.

You can view this using **Compass** under `ttDB > timetables`, `teachers`, etc.

---
