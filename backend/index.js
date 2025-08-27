import e from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./src/config/db.js"
import morgan from "morgan"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import generalLimiter from "./src/utils/generalLimiter.js"

// Routers
import authRouter from "./src/routes/Auth.js"



connectDB();
const app = e()
const PORT = process.env.PORT || 3030


// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));



// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      // Add production domains here
      // 'https://domain.com'
    ];

    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  // Important for cookies
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));


// Global rate limiting
app.use(generalLimiter)


// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}


// Body parsing middleware
app.use(e.json({ limit: '10mb' }));
app.use(e.urlencoded({ extended: true, limit: '10mb' }));


// Cookie parsing
app.use(cookieParser())


// Routes
app.use("/api/auth", authRouter)


// Health check endpoints

app.get("/", (req, res) => {
  res.json({
    message: "API is live",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

app.get("/test", (req, res) => {
  res.json({ status: 200, message: "API is live" });
});



app.listen(PORT, () => console.log(`✅ SERVER IS RUNNING ON PORT: ${PORT}`))