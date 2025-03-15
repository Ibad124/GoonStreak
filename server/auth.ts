import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'session_id', // Custom name to avoid default 'connect.sid'
  };

  // Trust first proxy for secure cookies behind reverse proxy
  app.set("trust proxy", 1);

  // Setup express session
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Login attempt for user:", username);
        const user = await storage.getUserByUsername(username);

        if (!user || !(await comparePasswords(password, user.password))) {
          console.log("Login failed: Invalid credentials for user:", username);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log("Login successful for user:", username);
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const user = await storage.getUser(id);

      if (!user) {
        console.log("Deserialization failed: User not found:", id);
        return done(null, false);
      }

      console.log("User deserialized successfully:", id);
      done(null, user);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt:", req.body.username);
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        console.log("Registration and login successful for user:", user.id);
        res.status(201).json({ user });
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  // Login route with enhanced error handling
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body.username);

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Login failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return next(err);
        }

        console.log("Login successful. Session established for user:", user.id);
        // Return minimal user data
        const { password, ...userData } = user;
        res.json({ user: userData });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    const userId = req.user?.id;
    console.log("Logout attempt for user:", userId);

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return next(err);
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return next(err);
        }

        console.log("Logout successful for user:", userId);
        res.sendStatus(200);
      });
    });
  });

  // Auth check route
  app.get("/api/user", (req, res) => {
    console.log("Auth check for user:", req.user?.id);

    if (!req.isAuthenticated()) {
      console.log("Auth check failed: User not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log("Auth check successful for user:", req.user?.id);
    // Return minimal user data
    const { password, ...userData } = req.user;
    res.json(userData);
  });
}