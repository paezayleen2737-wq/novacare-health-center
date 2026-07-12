const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || "./database/novacare.db";

// Nos aseguramos de que exista la carpeta donde vivirá el archivo .db
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1);
  }
  console.log(`✅ Conectado a SQLite en ${DB_PATH}`);
});

// SQLite no aplica las foreign keys por defecto: hay que activarlas explícitamente
db.run("PRAGMA foreign_keys = ON");

const schema = `
CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre            TEXT NOT NULL,
  apellido          TEXT NOT NULL,
  documento         TEXT NOT NULL UNIQUE,
  sexo              TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'Otro')),
  telefono          TEXT NOT NULL,
  email             TEXT,
  fecha_nacimiento  TEXT,
  created_at        TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL,
  apellido       TEXT NOT NULL,
  especialidad   TEXT NOT NULL,
  consultorio    TEXT NOT NULL,
  telefono       TEXT,
  email          TEXT,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id    INTEGER NOT NULL,
  medico_id      INTEGER NOT NULL,
  motivo         TEXT NOT NULL,
  observaciones  TEXT,
  fecha          TEXT NOT NULL,
  hora           TEXT NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'Pendiente'
                 CHECK (estado IN ('Pendiente', 'Confirmada', 'Atendida', 'Cancelada')),
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
`;

function initSchema() {
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ Error al crear el esquema de base de datos:", err.message);
        return reject(err);
      }
      console.log("✅ Esquema de base de datos verificado/creado");
      resolve();
    });
  });
}

module.exports = { db, initSchema };
