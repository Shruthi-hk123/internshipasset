import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type UserRole = "admin" | "employee";

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  notificationsEnabled: boolean;
  preferredTheme: "light" | "dark";
}

interface AssetRecord {
  id: string;
  companyId: string;
  assetTag: string;
  name: string;
  category: string;
  serialNumber: string;
  model: string;
  purchaseDate: string;
  cost: number;
  status: "Available" | "Assigned" | "Maintenance" | "Retired" | "Broken" | "Borrowed";
  currentHolderId: string | null;
  condition: number;
  trustScore: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
}

interface EmployeeRecord {
  id: string;
  companyId: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "On Leave" | "Terminated";
  createdAt: string;
}

interface StoreData {
  users: User[];
  assets: AssetRecord[];
  employees: EmployeeRecord[];
  metadata?: {
    seededDefaults?: boolean;
  };
}

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "store.json");
const sessions = new Map<string, User>();

async function ensureDataStore(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFilePath);
  } catch {
    const adminHash = await bcrypt.hash("admin123", 10);
    const employeeHash = await bcrypt.hash("employee123", 10);
    const seed: StoreData = {
      users: [
        {
          id: "u-admin-1",
          name: "Admin User",
          email: "admin@assetflow.local",
          passwordHash: adminHash,
          role: "admin",
          notificationsEnabled: true,
          preferredTheme: "light",
        },
        {
          id: "u-emp-1",
          name: "Employee User",
          email: "employee@assetflow.local",
          passwordHash: employeeHash,
          role: "employee",
          notificationsEnabled: true,
          preferredTheme: "light",
        },
      ],
      assets: [],
      employees: [],
      metadata: { seededDefaults: false },
    };
    await fs.writeFile(dataFilePath, JSON.stringify(seed, null, 2), "utf-8");
  }

  const store = await readStore();
  let updated = false;
  for (const user of store.users) {
    const mutableUser = user as User & { password?: string };
    if (mutableUser.password && !mutableUser.passwordHash) {
      mutableUser.passwordHash = await bcrypt.hash(mutableUser.password, 10);
      delete mutableUser.password;
      updated = true;
    }
    if (typeof mutableUser.notificationsEnabled !== "boolean") {
      mutableUser.notificationsEnabled = true;
      updated = true;
    }
    if (!mutableUser.preferredTheme) {
      mutableUser.preferredTheme = "light";
      updated = true;
    }
  }
  if (!Array.isArray((store as StoreData).employees)) {
    (store as StoreData).employees = [];
    updated = true;
  }
  if (!(store as StoreData).metadata) {
    (store as StoreData).metadata = { seededDefaults: false };
    updated = true;
  }
  if (!(store as StoreData).metadata?.seededDefaults) {
    const seedAssets: Array<Pick<AssetRecord, "assetTag" | "name" | "category" | "status" | "currentHolderId">> = [
      { assetTag: "AF-001", name: "MacBook Pro 16", category: "Laptop", status: "Assigned", currentHolderId: "EMP001" },
      { assetTag: "AF-002", name: "Dell Latitude 7440", category: "Laptop", status: "Available", currentHolderId: null },
      { assetTag: "AF-003", name: "HP EliteBook 840", category: "Laptop", status: "Maintenance", currentHolderId: null },
      { assetTag: "AF-004", name: "iPhone 15 Pro", category: "Mobile", status: "Assigned", currentHolderId: "EMP003" },
      { assetTag: "AF-005", name: "Samsung Galaxy S24", category: "Mobile", status: "Available", currentHolderId: null },
      { assetTag: "AF-006", name: "ThinkVision P24h", category: "Monitor", status: "Assigned", currentHolderId: "EMP002" },
      { assetTag: "AF-007", name: "Logitech MX Keys", category: "Peripheral", status: "Available", currentHolderId: null },
      { assetTag: "AF-008", name: "Cisco Desk Phone 8861", category: "Communication", status: "Retired", currentHolderId: null },
      { assetTag: "AF-009", name: "iPad Air", category: "Tablet", status: "Borrowed", currentHolderId: "EMP004" },
      { assetTag: "AF-010", name: "Lenovo ThinkCentre", category: "Desktop", status: "Broken", currentHolderId: null },
    ];
    const seedNow = new Date().toISOString();
    const existingTags = new Set(store.assets.map((asset) => asset.assetTag.toLowerCase()));
    const missingSeedAssets = seedAssets.filter((asset) => !existingTags.has(asset.assetTag.toLowerCase()));
    const assetsToInsert = missingSeedAssets.slice(0, Math.max(0, 10 - store.assets.length));

    if (assetsToInsert.length > 0) {
      const mappedAssets: AssetRecord[] = assetsToInsert.map((asset, index) => ({
        id: crypto.randomUUID(),
        companyId: "c1",
        assetTag: asset.assetTag,
        name: asset.name,
        category: asset.category,
        serialNumber: `SN-${asset.assetTag}`,
        model: "N/A",
        purchaseDate: seedNow.slice(0, 10),
        cost: 0,
        status: asset.status,
        currentHolderId: asset.currentHolderId,
        condition: 100,
        trustScore: 100,
        priority: index % 4 === 0 ? "High" : "Medium",
        createdAt: seedNow,
      }));
      store.assets = [...mappedAssets, ...store.assets];
      updated = true;
    }

    store.metadata = { ...store.metadata, seededDefaults: true };
    updated = true;
  }
  if (updated) {
    await writeStore(store);
  }
}

async function readStore(): Promise<StoreData> {
  const content = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(content) as StoreData;
}

async function writeStore(store: StoreData): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(store, null, 2), "utf-8");
}

function getUserFromHeader(authHeader?: string): User | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  return sessions.get(token) ?? null;
}

function createToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  await ensureDataStore();

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password, role } = req.body as { email?: string; password?: string; role?: UserRole };
    if (!email || !password || !role) {
      res.status(400).json({ message: "Email, password and role are required." });
      return;
    }
    if (role !== "admin" && role !== "employee") {
      res.status(400).json({ message: "Invalid role." });
      return;
    }

    const store = await readStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = createToken();
    sessions.set(token, user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredTheme: user.preferredTheme,
        notificationsEnabled: user.notificationsEnabled,
      },
    });
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
    };

    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      res.status(400).json({ message: "Name, email, password and role are required." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters." });
      return;
    }
    if (role !== "admin" && role !== "employee") {
      res.status(400).json({ message: "Invalid role." });
      return;
    }

    const store = await readStore();
    const emailTaken = store.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (emailTaken) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      notificationsEnabled: true,
      preferredTheme: "light",
    };
    store.users.push(newUser);
    await writeStore(store);

    const token = createToken();
    sessions.set(token, newUser);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        preferredTheme: newUser.preferredTheme,
        notificationsEnabled: newUser.notificationsEnabled,
      },
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredTheme: user.preferredTheme,
        notificationsEnabled: user.notificationsEnabled,
      },
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      sessions.delete(authHeader.slice("Bearer ".length));
    }
    res.status(204).send();
  });

  app.put("/api/users/profile", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, email, preferredTheme, notificationsEnabled } = req.body as {
      name?: string;
      email?: string;
      preferredTheme?: "light" | "dark";
      notificationsEnabled?: boolean;
    };

    if (!name?.trim() || !email?.trim()) {
      res.status(400).json({ message: "Name and email are required." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    const store = await readStore();
    const emailConflict = store.users.some(
      (entry) => entry.id !== user.id && entry.email.toLowerCase() === email.toLowerCase()
    );
    if (emailConflict) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const idx = store.users.findIndex((entry) => entry.id === user.id);
    if (idx < 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    store.users[idx] = {
      ...store.users[idx],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      preferredTheme: preferredTheme ?? store.users[idx].preferredTheme,
      notificationsEnabled: notificationsEnabled ?? store.users[idx].notificationsEnabled,
    };
    await writeStore(store);

    sessions.forEach((sessionUser, tokenKey) => {
      if (sessionUser.id === user.id) {
        sessions.set(tokenKey, store.users[idx]);
      }
    });

    const updatedUser = store.users[idx];
    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        preferredTheme: updatedUser.preferredTheme,
        notificationsEnabled: updatedUser.notificationsEnabled,
      },
    });
  });

  app.put("/api/users/password", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Current and new password are required." });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: "New password must be at least 8 characters." });
      return;
    }

    const store = await readStore();
    const idx = store.users.findIndex((entry) => entry.id === user.id);
    if (idx < 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const passwordOk = await bcrypt.compare(currentPassword, store.users[idx].passwordHash);
    if (!passwordOk) {
      res.status(401).json({ message: "Current password is incorrect." });
      return;
    }

    store.users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
    await writeStore(store);
    res.status(204).send();
  });

  app.get("/api/assets", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const store = await readStore();
    res.json({ assets: store.assets });
  });

  app.post("/api/assets", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (user.role !== "admin") {
      res.status(403).json({ message: "Only admin can add assets." });
      return;
    }

    const { name, assetTag, category, status, holder } = req.body as {
      name?: string;
      assetTag?: string;
      category?: string;
      status?: AssetRecord["status"];
      holder?: string;
    };

    if (!name || !assetTag || !category || !status) {
      res.status(400).json({ message: "All required fields must be provided." });
      return;
    }

    const store = await readStore();
    const duplicateTag = store.assets.some((asset) => asset.assetTag.toLowerCase() === assetTag.toLowerCase());
    if (duplicateTag) {
      res.status(409).json({ message: "Asset tag already exists." });
      return;
    }

    const now = new Date().toISOString();
    const asset: AssetRecord = {
      id: crypto.randomUUID(),
      companyId: "c1",
      assetTag,
      name,
      category,
      serialNumber: `SN-${assetTag.replace(/\s+/g, "-")}`,
      model: "N/A",
      purchaseDate: now.slice(0, 10),
      cost: 0,
      status,
      currentHolderId: holder || null,
      condition: 100,
      trustScore: 100,
      priority: "Medium",
      createdAt: now,
    };

    store.assets = [asset, ...store.assets];
    await writeStore(store);
    res.status(201).json({ asset });
  });

  app.get("/api/employees", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const store = await readStore();
    res.json({ employees: store.employees });
  });

  app.post("/api/employees", async (req, res) => {
    const user = getUserFromHeader(req.header("Authorization"));
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (user.role !== "admin") {
      res.status(403).json({ message: "Only admin can add employees." });
      return;
    }
    const { name, email, role } = req.body as { name?: string; email?: string; role?: string };
    if (!name?.trim() || !email?.trim() || !role?.trim()) {
      res.status(400).json({ message: "Name, email and role are required." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    const store = await readStore();
    const emailExists = store.employees.some((employee) => employee.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      res.status(409).json({ message: "Employee email already exists." });
      return;
    }
    const employeeNumber = store.employees.length + 1;
    const newEmployee: EmployeeRecord = {
      id: crypto.randomUUID(),
      companyId: "c1",
      employeeId: `EMP${String(employeeNumber).padStart(3, "0")}`,
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    store.employees = [newEmployee, ...store.employees];
    await writeStore(store);
    res.status(201).json({ employee: newEmployee });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
