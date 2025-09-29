let currentSection = "dashboard"
let livros = []
let leitores = []
let emprestimos = []

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
})

function initializeApp() {
  loadDashboard()
  loadLivros()
  loadLeitores()
  loadEmprestimos()
}

function setupEventListeners() {
  // Navegação
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const section = this.dataset.section
      showSection(section)
    })
  })

  // Formulários
  document.getElementById("form-livro").addEventListener("submit", handleLivroSubmit)
  document.getElementById("form-leitor").addEventListener("submit", handleLeitorSubmit)
  document.getElementById("form-emprestimo").addEventListener("submit", handleEmprestimoSubmit)

  // Busca
  document.getElementById("search-livros").addEventListener("input", filterLivros)
  document.getElementById("search-leitores").addEventListener("input", filterLeitores)

  // Fechar modal ao clicar fora
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none"
    }
  })
}

// Navegação
function showSection(sectionName) {
  // Remover classe active de todas as seções e botões
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active")
  })
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Ativar seção e botão atual
  document.getElementById(sectionName).classList.add("active")
  document.querySelector(`[data-section="${sectionName}"]`).classList.add("active")

  currentSection = sectionName

  // Recarregar dados se necessário
  if (sectionName === "dashboard") {
    loadDashboard()
  }
}

// API Calls
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    alert("Erro na comunicação com o servidor: " + error.message)
    throw error
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const [livrosData, leitoresData, emprestimosData] = await Promise.all([
      apiCall("/api/livros"),
      apiCall("/api/leitores"),
      apiCall("/api/emprestimos"),
    ])

    livros = livrosData
    leitores = leitoresData
    emprestimos = emprestimosData

    updateDashboardStats()
    updateRecentEmprestimos()
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
  }
}

function updateDashboardStats() {
  document.getElementById("total-livros").textContent = livros.length
  document.getElementById("total-leitores").textContent = leitores.length

  const emprestimosAtivos = emprestimos.filter((e) => e.status === "emprestado").length
  document.getElementById("emprestimos-ativos").textContent = emprestimosAtivos

  const atrasados = emprestimos.filter((e) => e.atrasado === 1).length
  document.getElementById("devolucoes-atrasadas").textContent = atrasados
}

function updateRecentEmprestimos() {
  const container = document.getElementById("emprestimos-recentes")
  const recentEmprestimos = emprestimos.slice(0, 5)

  if (recentEmprestimos.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Nenhum empréstimo encontrado</p></div>'
    return
  }

  container.innerHTML = recentEmprestimos
    .map(
      (emprestimo) => `
        <div class="recent-item ${emprestimo.atrasado ? "overdue" : ""}">
            <div>
                <strong>${emprestimo.livro_titulo}</strong><br>
                <small>Leitor: ${emprestimo.leitor_nome}</small>
            </div>
            <div>
                ${
                  emprestimo.atrasado
                    ? '<span class="status-badge status-atrasado">ATRASADO</span>'
                    : '<span class="status-badge status-emprestado">ATIVO</span>'
                }
            </div>
        </div>
    `,
    )
    .join("")
}

// Livros
async function loadLivros() {
  try {
    livros = await apiCall("/api/livros")
    renderLivros(livros)
    updateLivrosSelect()
  } catch (error) {
    console.error("Erro ao carregar livros:", error)
  }
}

function renderLivros(livrosToRender) {
  const tbody = document.querySelector("#table-livros tbody")

  if (livrosToRender.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum livro encontrado</td></tr>'
    return
  }

  tbody.innerHTML = livrosToRender
    .map(
      (livro) => `
        <tr>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.isbn || "-"}</td>
            <td>${livro.categoria || "-"}</td>
            <td>
                <span class="status-badge ${livro.disponivel ? "status-disponivel" : "status-emprestado"}">
                    ${livro.disponivel ? "Disponível" : "Emprestado"}
                </span>
            </td>
            <td>
                <button class="btn btn-warning" onclick="editLivro(${livro.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteLivro(${livro.id})">Excluir</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function filterLivros() {
  const searchTerm = document.getElementById("search-livros").value.toLowerCase()
  const filtered = livros.filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(searchTerm) ||
      livro.autor.toLowerCase().includes(searchTerm) ||
      (livro.categoria && livro.categoria.toLowerCase().includes(searchTerm)),
  )
  renderLivros(filtered)
}

async function handleLivroSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("livro-id").value
  const livroData = {
    titulo: document.getElementById("livro-titulo").value,
    autor: document.getElementById("livro-autor").value,
    isbn: document.getElementById("livro-isbn").value,
    categoria: document.getElementById("livro-categoria").value,
  }

  try {
    if (id) {
      await apiCall(`/api/livros/${id}`, {
        method: "PUT",
        body: JSON.stringify(livroData),
      })
    } else {
      await apiCall("/api/livros", {
        method: "POST",
        body: JSON.stringify(livroData),
      })
    }

    closeModal("modal-livro")
    loadLivros()
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao salvar livro:", error)
  }
}

function editLivro(id) {
  const livro = livros.find((l) => l.id === id)
  if (!livro) return

  document.getElementById("livro-id").value = livro.id
  document.getElementById("livro-titulo").value = livro.titulo
  document.getElementById("livro-autor").value = livro.autor
  document.getElementById("livro-isbn").value = livro.isbn || ""
  document.getElementById("livro-categoria").value = livro.categoria || ""
  document.getElementById("modal-livro-title").textContent = "Editar Livro"

  openModal("modal-livro")
}

async function deleteLivro(id) {
  if (!confirm("Tem certeza que deseja excluir este livro?")) return

  try {
    await apiCall(`/api/livros/${id}`, { method: "DELETE" })
    loadLivros()
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao excluir livro:", error)
  }
}

// Leitores
async function loadLeitores() {
  try {
    leitores = await apiCall("/api/leitores")
    renderLeitores(leitores)
    updateLeitoresSelect()
  } catch (error) {
    console.error("Erro ao carregar leitores:", error)
  }
}

function renderLeitores(leitoresToRender) {
  const tbody = document.querySelector("#table-leitores tbody")

  if (leitoresToRender.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum leitor encontrado</td></tr>'
    return
  }

  tbody.innerHTML = leitoresToRender
    .map(
      (leitor) => `
        <tr>
            <td>${leitor.nome}</td>
            <td>${leitor.email}</td>
            <td>${leitor.telefone || "-"}</td>
            <td>${leitor.endereco || "-"}</td>
            <td>
                <button class="btn btn-warning" onclick="editLeitor(${leitor.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteLeitor(${leitor.id})">Excluir</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function filterLeitores() {
  const searchTerm = document.getElementById("search-leitores").value.toLowerCase()
  const filtered = leitores.filter(
    (leitor) => leitor.nome.toLowerCase().includes(searchTerm) || leitor.email.toLowerCase().includes(searchTerm),
  )
  renderLeitores(filtered)
}

async function handleLeitorSubmit(e) {
  e.preventDefault()

  const id = document.getElementById("leitor-id").value
  const leitorData = {
    nome: document.getElementById("leitor-nome").value,
    email: document.getElementById("leitor-email").value,
    telefone: document.getElementById("leitor-telefone").value,
    endereco: document.getElementById("leitor-endereco").value,
  }

  try {
    if (id) {
      await apiCall(`/api/leitores/${id}`, {
        method: "PUT",
        body: JSON.stringify(leitorData),
      })
    } else {
      await apiCall("/api/leitores", {
        method: "POST",
        body: JSON.stringify(leitorData),
      })
    }

    closeModal("modal-leitor")
    loadLeitores()
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao salvar leitor:", error)
  }
}

function editLeitor(id) {
  const leitor = leitores.find((l) => l.id === id)
  if (!leitor) return

  document.getElementById("leitor-id").value = leitor.id
  document.getElementById("leitor-nome").value = leitor.nome
  document.getElementById("leitor-email").value = leitor.email
  document.getElementById("leitor-telefone").value = leitor.telefone || ""
  document.getElementById("leitor-endereco").value = leitor.endereco || ""
  document.getElementById("modal-leitor-title").textContent = "Editar Leitor"

  openModal("modal-leitor")
}

async function deleteLeitor(id) {
  if (!confirm("Tem certeza que deseja excluir este leitor?")) return

  try {
    await apiCall(`/api/leitores/${id}`, { method: "DELETE" })
    loadLeitores()
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao excluir leitor:", error)
  }
}

// Empréstimos
async function loadEmprestimos() {
  try {
    emprestimos = await apiCall("/api/emprestimos")
    renderEmprestimos()
  } catch (error) {
    console.error("Erro ao carregar empréstimos:", error)
  }
}

function renderEmprestimos() {
  const tbody = document.querySelector("#table-emprestimos tbody")

  if (emprestimos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum empréstimo encontrado</td></tr>'
    return
  }

  tbody.innerHTML = emprestimos
    .map(
      (emprestimo) => `
        <tr>
            <td>${emprestimo.livro_titulo}</td>
            <td>${emprestimo.leitor_nome}</td>
            <td>${formatDate(emprestimo.data_emprestimo)}</td>
            <td>${formatDate(emprestimo.data_devolucao_prevista)}</td>
            <td>
                <span class="status-badge ${getStatusClass(emprestimo)}">
                    ${getStatusText(emprestimo)}
                </span>
            </td>
            <td>
                ${
                  emprestimo.status === "emprestado"
                    ? `<button class="btn btn-success" onclick="devolverLivro(${emprestimo.id})">Devolver</button>`
                    : "<span>-</span>"
                }
            </td>
        </tr>
    `,
    )
    .join("")
}

function getStatusClass(emprestimo) {
  if (emprestimo.status === "devolvido") return "status-disponivel"
  if (emprestimo.atrasado) return "status-atrasado"
  return "status-emprestado"
}

function getStatusText(emprestimo) {
  if (emprestimo.status === "devolvido") return "DEVOLVIDO"
  if (emprestimo.atrasado) return "ATRASADO"
  return "EMPRESTADO"
}

async function handleEmprestimoSubmit(e) {
  e.preventDefault()

  const emprestimoData = {
    livro_id: Number.parseInt(document.getElementById("emprestimo-livro").value),
    leitor_id: Number.parseInt(document.getElementById("emprestimo-leitor").value),
    dias_emprestimo: Number.parseInt(document.getElementById("emprestimo-dias").value),
  }

  try {
    await apiCall("/api/emprestimos", {
      method: "POST",
      body: JSON.stringify(emprestimoData),
    })

    closeModal("modal-emprestimo")
    loadEmprestimos()
    loadLivros() // Atualizar status dos livros
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao realizar empréstimo:", error)
  }
}

async function devolverLivro(emprestimoId) {
  if (!confirm("Confirmar devolução do livro?")) return

  try {
    await apiCall(`/api/emprestimos/${emprestimoId}/devolver`, {
      method: "PUT",
    })

    loadEmprestimos()
    loadLivros() // Atualizar status dos livros
    if (currentSection === "dashboard") loadDashboard()
  } catch (error) {
    console.error("Erro ao devolver livro:", error)
  }
}

// Selects
function updateLivrosSelect() {
  const select = document.getElementById("emprestimo-livro")
  const livrosDisponiveis = livros.filter((livro) => livro.disponivel)

  select.innerHTML =
    '<option value="">Selecione um livro</option>' +
    livrosDisponiveis.map((livro) => `<option value="${livro.id}">${livro.titulo} - ${livro.autor}</option>`).join("")
}

function updateLeitoresSelect() {
  const select = document.getElementById("emprestimo-leitor")

  select.innerHTML =
    '<option value="">Selecione um leitor</option>' +
    leitores.map((leitor) => `<option value="${leitor.id}">${leitor.nome}</option>`).join("")
}

// Modais
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block"

  // Resetar formulário se for novo registro
  if (modalId === "modal-livro" && !document.getElementById("livro-id").value) {
    document.getElementById("form-livro").reset()
    document.getElementById("modal-livro-title").textContent = "Adicionar Livro"
  }
  if (modalId === "modal-leitor" && !document.getElementById("leitor-id").value) {
    document.getElementById("form-leitor").reset()
    document.getElementById("modal-leitor-title").textContent = "Adicionar Leitor"
  }
  if (modalId === "modal-emprestimo") {
    document.getElementById("form-emprestimo").reset()
    document.getElementById("emprestimo-dias").value = 14
    updateLivrosSelect()
    updateLeitoresSelect()
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"

  // Limpar campos hidden
  if (modalId === "modal-livro") {
    document.getElementById("livro-id").value = ""
  }
  if (modalId === "modal-leitor") {
    document.getElementById("leitor-id").value = ""
  }
}

// Utilitários
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}
