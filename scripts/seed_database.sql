-- Script para popular o banco de dados com dados de exemplo

-- Inserir livros de exemplo
INSERT OR IGNORE INTO livros (titulo, autor, isbn, categoria) VALUES
('Dom Casmurro', 'Machado de Assis', '978-85-359-0277-5', 'Literatura Brasileira'),
('O Cortiço', 'Aluísio Azevedo', '978-85-359-0276-8', 'Literatura Brasileira'),
('1984', 'George Orwell', '978-0-452-28423-4', 'Ficção Científica'),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', '978-85-359-0658-2', 'Infantil'),
('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Tecnologia'),
('O Alquimista', 'Paulo Coelho', '978-85-325-1158-9', 'Ficção'),
('Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 'História'),
('O Nome da Rosa', 'Umberto Eco', '978-85-359-0123-5', 'Romance'),
('Cem Anos de Solidão', 'Gabriel García Márquez', '978-85-359-0789-3', 'Literatura Latino-americana'),
('A Revolução dos Bichos', 'George Orwell', '978-85-359-0456-4', 'Fábula');

-- Inserir leitores de exemplo
INSERT OR IGNORE INTO leitores (nome, email, telefone, endereco) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo, SP'),
('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo, SP'),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo, SP'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-4444', 'Rua Oscar Freire, 321 - São Paulo, SP'),
('Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 99999-5555', 'Av. Faria Lima, 654 - São Paulo, SP'),
('Lucia Rodrigues', 'lucia.rodrigues@email.com', '(11) 99999-6666', 'Rua Consolação, 987 - São Paulo, SP'),
('Roberto Lima', 'roberto.lima@email.com', '(11) 99999-7777', 'Av. Rebouças, 147 - São Paulo, SP'),
('Fernanda Alves', 'fernanda.alves@email.com', '(11) 99999-8888', 'Rua Haddock Lobo, 258 - São Paulo, SP');

-- Inserir alguns empréstimos de exemplo (alguns atrasados para demonstração)
INSERT OR IGNORE INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES
(1, 1, datetime('now', '-20 days'), datetime('now', '-6 days'), 'emprestado'),
(3, 2, datetime('now', '-10 days'), datetime('now', '+4 days'), 'emprestado'),
(5, 3, datetime('now', '-25 days'), datetime('now', '-11 days'), 'emprestado'),
(2, 4, datetime('now', '-5 days'), datetime('now', '+9 days'), 'emprestado'),
(7, 5, datetime('now', '-30 days'), datetime('now', '-16 days'), 'emprestado');

-- Atualizar status dos livros emprestados
UPDATE livros SET disponivel = 0 WHERE id IN (1, 2, 3, 5, 7);
