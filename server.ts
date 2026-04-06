import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// If running on Cloud Run, it will use the default service account.
// Otherwise, it will need a service account key provided in env.
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback for Cloud Run or local dev without key
    admin.initializeApp({
      projectId: "sgs-coaching" // Hardcoded for now based on firebase.ts
    });
  }
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/admin/reset-password", async (req, res) => {
    const { userId, newPassword, idToken } = req.body;

    if (!userId || !newPassword || !idToken) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
      // 1. Verify the caller is an Admin
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const adminEmails = ['zozenusd@gmail.com', 'sgsworkvikas@gmail.com'];
      
      if (!adminEmails.includes(decodedToken.email || '')) {
        return res.status(403).json({ success: false, message: "Unauthorized. Admin access required." });
      }

      // 2. Update the user's password in Firebase Auth
      await admin.auth().updateUser(userId, {
        password: newPassword
      });

      console.log(`Password reset for user ${userId} by admin ${decodedToken.email}`);
      res.json({ success: true, message: "Password updated successfully." });
    } catch (error: any) {
      console.error("Admin Password Reset Error:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to reset password." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
