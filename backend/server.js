const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: [],
      chamadas: [],
      historicoChamadas: []
    };
  }

  const data = JSON.parse(fs.readFileSync(DB_FILE));
  if (!data.chamadas) data.chamadas = [];
  if (!data.historicoChamadas) data.historicoChamadas = [];
  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post("/login", (req, res) => {
  const db = readDB();

  const user = db.usuarios.find(u =>
    u.usuario === req.body.usuario &&
    u.senha === req.body.senha
  );

  if (!user) {
    return res.status(400).json({
      erro: "Login inválido"
    });
  }
  res.json(user);
});

app.get("/usuarios", (req, res) => {
  const db = readDB();
  res.json(db.usuarios);
});

app.post("/usuarios", (req, res) => {
  const db = readDB();
  const novoUsuario = {
    id: Date.now(),
    usuario: req.body.usuario,
    senha: req.body.senha,
    tipo: req.body.tipo
  };
  db.usuarios.push(novoUsuario);
  writeDB(db);
  res.json(novoUsuario);
});

app.post("/atendimento", (req, res) => {
  const db = readDB();

  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);
  writeDB(db);

  res.json(paciente);
});

app.get("/atendimento", (req, res) => {
  const db = readDB();
  res.json(db.pacientes);
});

app.post("/triagem", (req, res) => {
  const db = readDB();

  let risco = req.body.risco;

  if (req.body.temperatura >= 39) {
    risco = "vermelho";
  } else if (req.body.temperatura >= 38) {
    risco = "amarelo";
  } else if (!risco) {
    risco = "verde";
  }

  const triagem = {
    id: Date.now(),
    nome: req.body.nome,
    sintoma: req.body.sintoma,
    temperatura: req.body.temperatura,
    alergia: req.body.alergia,
    observacao: req.body.observacao,
    risco,
    status: "aguardando_medico",
    createdAt: new Date()
  };

  db.triagens.push(triagem);
  writeDB(db);

  res.json(triagem);
});

app.get("/triagens", (req, res) => {
  const db = readDB();
  res.json(db.triagens);
});

app.get("/lista-medicacoes", (req, res) => {
  res.json([
    "Dipirona",
    "Paracetamol",
    "Ibuprofeno",
    "Amoxicilina",
    "Azitromicina",
    "Loratadina",
    "Omeprazol",
    "Buscopan",
    "Dramin",
    "Soro fisiológico"
  ]);
});

app.post("/consulta", (req, res) => {
  const db = readDB();

  const consulta = {
    id: Date.now(),
    paciente: req.body.paciente,
    diagnostico: req.body.diagnostico,
    medicacao: req.body.medicacao,
    obs: req.body.obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);
  writeDB(db);

  res.json(consulta);
});

app.get("/medicacoes", (req, res) => {
  const db = readDB();
  res.json(db.consultas);
});

app.post("/tv/chamar", (req, res) => {
  const db = readDB();
  const chamada = {
    id: Date.now(),
    paciente: req.body.paciente,
    localTipo: req.body.localTipo || "GUICHÊ",
    localNumero: req.body.localNumero || "01"
  };

  db.chamadas.push(chamada);
  db.historicoChamadas.unshift(chamada);
  writeDB(db);

  res.json(chamada);
});

app.get("/tv/chamada", (req, res) => {
  const db = readDB();
  const ultimaChamada = db.chamadas[db.chamadas.length - 1] || null;
  res.json({
    chamada: ultimaChamada,
    historico: db.historicoChamadas || []
  });
});

app.listen(3000, () => {
  console.log("🏥 Hospital Pro rodando em http://localhost:3000");
});