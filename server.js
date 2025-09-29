const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Conectar ao banco SQLite
const db = new sqlite3.Database("./biblioteca.db", (err) => {
  if (err) {
    console.error("Erro ao conectar com o banco:", err.message)
  } else {
    console.log("Conectado ao banco SQLite")
    initDatabase()
  }
})

// Inicializar tabelas
function initDatabase() {
  // Tabela de livros
  db.run(`CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        isbn TEXT UNIQUE,
        categoria TEXT,
        disponivel INTEGER DEFAULT 1,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

  // Tabela de leitores
  db.run(`CREATE TABLE IF NOT EXISTS leitores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        endereco TEXT,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

  // Tabela de empréstimos
  db.run(`CREATE TABLE IF NOT EXISTS emprestimos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER,
        leitor_id INTEGER,
        data_emprestimo DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_devolucao_prevista DATETIME NOT NULL,
        data_devolucao_real DATETIME,
        status TEXT DEFAULT 'emprestado',
        FOREIGN KEY (livro_id) REFERENCES livros (id),
        FOREIGN KEY (leitor_id) REFERENCES leitores (id)
    )`)
}

// ROTAS PARA LIVROS
app.get("/api/livros", (req, res) => {
  db.all("SELECT * FROM livros ORDER BY titulo", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json(rows)
    }
  })
})

app.post("/api/livros", (req, res) => {
  const { titulo, autor, isbn, categoria } = req.body
  db.run(
    "INSERT INTO livros (titulo, autor, isbn, categoria) VALUES (?, ?, ?, ?)",
    [titulo, autor, isbn, categoria],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json({ id: this.lastID, message: "Livro adicionado com sucesso!" })
      }
    },
  )
})

app.put("/api/livros/:id", (req, res) => {
  const { titulo, autor, isbn, categoria } = req.body
  const { id } = req.params

  db.run(
    "UPDATE livros SET titulo = ?, autor = ?, isbn = ?, categoria = ? WHERE id = ?",
    [titulo, autor, isbn, categoria, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json({ message: "Livro atualizado com sucesso!" })
      }
    },
  )
})

app.delete("/api/livros/:id", (req, res) => {
  const { id } = req.params
  db.run("DELETE FROM livros WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json({ message: "Livro removido com sucesso!" })
    }
  })
})

// ROTAS PARA LEITORES
app.get("/api/leitores", (req, res) => {
  db.all("SELECT * FROM leitores ORDER BY nome", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json(rows)
    }
  })
})

app.post("/api/leitores", (req, res) => {
  const { nome, email, telefone, endereco } = req.body
  db.run(
    "INSERT INTO leitores (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
    [nome, email, telefone, endereco],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json({ id: this.lastID, message: "Leitor adicionado com sucesso!" })
      }
    },
  )
})

app.put("/api/leitores/:id", (req, res) => {
  const { nome, email, telefone, endereco } = req.body
  const { id } = req.params

  db.run(
    "UPDATE leitores SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?",
    [nome, email, telefone, endereco, id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.json({ message: "Leitor atualizado com sucesso!" })
      }
    },
  )
})

app.delete("/api/leitores/:id", (req, res) => {
  const { id } = req.params
  db.run("DELETE FROM leitores WHERE id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json({ message: "Leitor removido com sucesso!" })
    }
  })
})

// ROTAS PARA EMPRÉSTIMOS
app.get("/api/emprestimos", (req, res) => {
  const query = `
        SELECT e.*, l.titulo as livro_titulo, r.nome as leitor_nome,
               CASE 
                   WHEN e.status = 'emprestado' AND date(e.data_devolucao_prevista) < date('now') THEN 1
                   ELSE 0
               END as atrasado
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN leitores r ON e.leitor_id = r.id
        ORDER BY e.data_emprestimo DESC
    `

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json(rows)
    }
  })
})

app.post("/api/emprestimos", (req, res) => {
  const { livro_id, leitor_id, dias_emprestimo = 14 } = req.body

  // Calcular data de devolução
  const dataDevolucao = new Date()
  dataDevolucao.setDate(dataDevolucao.getDate() + dias_emprestimo)

  db.run(
    "INSERT INTO emprestimos (livro_id, leitor_id, data_devolucao_prevista) VALUES (?, ?, ?)",
    [livro_id, leitor_id, dataDevolucao.toISOString()],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        // Marcar livro como indisponível
        db.run("UPDATE livros SET disponivel = 0 WHERE id = ?", [livro_id])
        res.json({ id: this.lastID, message: "Empréstimo realizado com sucesso!" })
      }
    },
  )
})

app.put("/api/emprestimos/:id/devolver", (req, res) => {
  const { id } = req.params

  // Primeiro, buscar o empréstimo para pegar o livro_id
  db.get("SELECT livro_id FROM emprestimos WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else if (row) {
      // Atualizar empréstimo
      db.run(
        'UPDATE emprestimos SET data_devolucao_real = CURRENT_TIMESTAMP, status = "devolvido" WHERE id = ?',
        [id],
        (err) => {
          if (err) {
            res.status(500).json({ error: err.message })
          } else {
            // Marcar livro como disponível
            db.run("UPDATE livros SET disponivel = 1 WHERE id = ?", [row.livro_id])
            res.json({ message: "Devolução realizada com sucesso!" })
          }
        },
      )
    }
  })
})

// Rota para servir o arquivo principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
