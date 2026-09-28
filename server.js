const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "troque-esta-senha";

const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");
const DB = path.join(DATA_DIR, "products.json");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "troque-esta-chave",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }
}));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

function readProducts() { return JSON.parse(fs.readFileSync(DB, "utf8")); }
function writeProducts(p) { fs.writeFileSync(DB, JSON.stringify(p, null, 2)); }
function auth(req,res,next) {
  if (req.session.authenticated) return next();
  res.status(401).json({ error: "Não autorizado" });
}

app.post("/api/login", (req,res) => {
  if (req.body.user === ADMIN_USER && req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Usuário ou senha incorretos" });
});
app.post("/api/logout", (req,res) => req.session.destroy(() => res.json({ ok:true })));
app.get("/api/me", (req,res) => res.json({ authenticated: !!req.session.authenticated }));

app.get("/api/products", (_,res) => res.json(readProducts()));

app.post("/api/products", auth, upload.single("photo"), (req,res) => {
  if (!req.file || !req.body.link) return res.status(400).json({error:"Foto e link são obrigatórios."});
  const products = readProducts();
  const product = {
    id: Date.now().toString(),
    photo: "/uploads/" + req.file.filename,
    link: req.body.link.trim()
  };
  products.unshift(product);
  writeProducts(products);
  res.json(product);
});

app.put("/api/products/:id", auth, upload.single("photo"), (req,res) => {
  const products = readProducts();
  const i = products.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({error:"Produto não encontrado."});
  if (req.body.link) products[i].link = req.body.link.trim();
  if (req.file) {
    const old = path.join(__dirname, "public", products[i].photo.replace(/^\//,""));
    if (fs.existsSync(old)) fs.unlinkSync(old);
    products[i].photo = "/uploads/" + req.file.filename;
  }
  writeProducts(products);
  res.json(products[i]);
});

app.delete("/api/products/:id", auth, (req,res) => {
  const products = readProducts();
  const i = products.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({error:"Produto não encontrado."});
  const old = path.join(__dirname, "public", products[i].photo.replace(/^\//,""));
  if (fs.existsSync(old)) fs.unlinkSync(old);
  products.splice(i,1);
  writeProducts(products);
  res.json({ok:true});
});

app.get("/admin", (_,res) => res.sendFile(path.join(__dirname,"public","admin.html")));
app.listen(PORT, () => console.log(`Achadinhos BR10: http://localhost:${PORT}`));
