-- -----------------------------------------------------------------------------
-- SCHEMA DO BANCO ARRUMAI
-- -----------------------------------------------------------------------------
-- Este script representa a base funcional do projeto para a primeira etapa.
-- Ele cobre os módulos principais do site sem incluir o login/cadastro.
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS arrumai;
USE arrumai;

CREATE TABLE IF NOT EXISTS servicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'documento',
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    protocolo VARCHAR(30) NOT NULL UNIQUE,
    usuario_id INT NULL,
    servico_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    norma VARCHAR(200),
    descricao TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'RECEBIDA',
    valor DECIMAL(10,2) NULL,
    entrega_prevista DATE NULL,
    metodo_pagamento VARCHAR(30) DEFAULT 'PIX',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_status_historico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_id INT NOT NULL,
    status_anterior VARCHAR(40),
    status_novo VARCHAR(40) NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_arquivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_id INT NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_armazenado VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    tamanho_bytes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);

CREATE TABLE IF NOT EXISTS propostas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    prazo_dias INT NOT NULL,
    observacao TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ENVIADA',
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta TIMESTAMP NULL,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);

CREATE TABLE IF NOT EXISTS pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_id INT NOT NULL,
    proposta_id INT NULL,
    chave_pix VARCHAR(200) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(30) DEFAULT 'PIX',
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_COMPROVANTE',
    comprovante_id INT NULL,
    data_comprovante TIMESTAMP NULL,
    data_conferencia TIMESTAMP NULL,
    motivo_recusa TEXT,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
    FOREIGN KEY (proposta_id) REFERENCES propostas(id)
);

CREATE TABLE IF NOT EXISTS solicitacao_comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_id INT NOT NULL,
    usuario_id INT NULL,
    autor_tipo VARCHAR(30) NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);

INSERT INTO servicos (nome, slug, icon, descricao, ativo, ordem) VALUES
('Criação', 'criacao', 'documento', 'Documentação montada do zero.', TRUE, 1),
('Revisão', 'revisao', 'aprovacao', 'Correção e revisão de documento existente.', TRUE, 2),
('Padronização', 'padronizacao', 'versoes', 'Ajustes para seguir a norma exigida.', TRUE, 3);
