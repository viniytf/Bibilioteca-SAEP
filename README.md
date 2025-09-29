# Sistema de Biblioteca

Um sistema completo de gerenciamento de biblioteca desenvolvido com HTML, CSS, JavaScript vanilla, Node.js, Express e SQLite.

## Funcionalidades

- **Dashboard**: Visão geral com estatísticas e empréstimos recentes
- **Gerenciamento de Livros**: CRUD completo (Criar, Ler, Atualizar, Deletar)
- **Gerenciamento de Leitores**: CRUD completo para cadastro de usuários
- **Controle de Empréstimos**: Sistema de empréstimo e devolução
- **Controle de Atrasos**: Identificação automática de devoluções em atraso
- **Interface Responsiva**: Funciona em desktop e mobile
- **Busca**: Sistema de busca para livros e leitores

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite3
- **Estilo**: CSS Grid, Flexbox, Design Responsivo

## Como Executar

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- VS Code (recomendado)

### Instalação

1. **Clone ou baixe o projeto**
2. **Abra o terminal no VS Code** (Ctrl + ` ou Terminal > New Terminal)
3. **Instale as dependências**:
   \`\`\`bash
   npm install
   \`\`\`

4. **Execute o servidor**:
   \`\`\`bash
   npm start
   \`\`\`
   
   Ou para desenvolvimento com auto-reload:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Acesse o sistema**:
   Abra seu navegador e vá para: `http://localhost:3000`

### Populando o Banco com Dados de Exemplo

Para adicionar dados de exemplo ao sistema:

1. **No terminal do VS Code**, execute:
   \`\`\`bash
   node -e "
   const sqlite3 = require('sqlite3').verbose();
   const fs = require('fs');
   const db = new sqlite3.Database('./biblioteca.db');
   const sql = fs.readFileSync('./scripts/seed_database.sql', 'utf8');
   db.exec(sql, (err) => {
     if (err) console.error(err);
     else console.log('Dados de exemplo inseridos com sucesso!');
     db.close();
   });
   "
   \`\`\`

2. **Recarregue a página** no navegador para ver os dados

## Estrutura do Projeto

\`\`\`
sistema-biblioteca/
├── public/
│   ├── index.html      # Interface principal
│   ├── styles.css      # Estilos da aplicação
│   └── script.js       # Lógica do frontend
├── scripts/
│   └── seed_database.sql # Script para popular o banco
├── server.js           # Servidor Express
├── package.json        # Dependências do projeto
├── biblioteca.db       # Banco SQLite (criado automaticamente)
└── README.md          # Este arquivo
\`\`\`

## Como Usar

### Dashboard
- Visualize estatísticas gerais do sistema
- Veja empréstimos recentes e atrasados

### Livros
- **Adicionar**: Clique em "Adicionar Livro" e preencha os dados
- **Editar**: Clique em "Editar" na linha do livro desejado
- **Excluir**: Clique em "Excluir" (confirme a ação)
- **Buscar**: Use a barra de busca para filtrar por título, autor ou categoria

### Leitores
- **Adicionar**: Clique em "Adicionar Leitor" e preencha os dados
- **Editar**: Clique em "Editar" na linha do leitor desejado
- **Excluir**: Clique em "Excluir" (confirme a ação)
- **Buscar**: Use a barra de busca para filtrar por nome ou email

### Empréstimos
- **Novo Empréstimo**: Selecione livro e leitor, defina prazo de devolução
- **Devolver**: Clique em "Devolver" para registrar a devolução
- **Atrasos**: Empréstimos atrasados aparecem destacados em vermelho

## Recursos Especiais

- **Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Validação**: Formulários com validação de dados
- **Feedback Visual**: Mensagens de sucesso e erro
- **Status em Tempo Real**: Atualização automática de disponibilidade
- **Design Moderno**: Interface limpa e intuitiva

## Troubleshooting

### Erro "Cannot find module"
\`\`\`bash
npm install
\`\`\`

### Banco não está sendo criado
Verifique se você tem permissão de escrita na pasta do projeto.

### Porta 3000 já está em uso
Altere a porta no arquivo `server.js`:
\`\`\`javascript
const PORT = 3001; // ou outra porta disponível
\`\`\`

## Contribuição

Este é um projeto educacional. Sinta-se livre para:
- Adicionar novas funcionalidades
- Melhorar o design
- Otimizar o código
- Corrigir bugs

## Licença

Projeto livre para uso educacional e pessoal.
