import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import express from "express";
import connection from "./mysql_connection.js";
import MysqlErrorHandle from "./mysql_error_handle.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// ================== TIPOS ==================

interface IPessoa extends RowDataPacket {
  id: number;
  nome: string;
}

interface IProduto extends RowDataPacket {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  data_criacao: Date;
  data_modificacao: Date | null;
}

// ================== ROTAS PESSOA ==================

// Lista todas as pessoas
app.get("/pessoas", async (req, res) => {
  try {
    const [dados] = await connection.execute<IPessoa[]>(
      "SELECT * FROM pessoa"
    );
    return res.status(200).json(dados);
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Cadastra nova pessoa
app.post("/pessoas", async (req, res) => {
  const { id, nome } = req.body;

  if (!id || !nome) {
    return res
      .status(400)
      .json({ mensagem: "Campos id e nome são obrigatórios!" });
  }

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO pessoa VALUES (?, ?)",
      [id, nome]
    );

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao inserir a pessoa!" });
    }

    return res
      .status(201)
      .json({ mensagem: "Pessoa cadastrada com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Atualiza parcialmente o nome da pessoa
app.patch("/pessoa/:id", async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res
      .status(400)
      .json({ mensagem: "O campo nome é obrigatório!" });
  }

  try {
    const [rows] = await connection.execute<IPessoa[]>(
      "SELECT * FROM pessoa WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: "Pessoa não encontrada!" });
    }

    await connection.execute(
      "UPDATE pessoa SET nome = ? WHERE id = ?",
      [nome, id]
    );

    return res
      .status(200)
      .json({ mensagem: "Pessoa atualizada com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Deleta pessoa
app.delete("/pessoa/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM pessoa WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Pessoa não encontrada!" });
    }

    return res
      .status(200)
      .json({ mensagem: "Pessoa deletada com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// ================== ROTAS PRODUTO ==================

// Lista todos os produtos
app.get("/produtos", async (req, res) => {
  try {
    const [dados] = await connection.execute<IProduto[]>(
      "SELECT * FROM produto"
    );
    return res.status(200).json(dados);
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Cadastra novo produto (datas geradas no servidor)
app.post("/produtos", async (req, res) => {
  const { id, nome, categoria, preco } = req.body;

  if (!id || !nome || !categoria || !preco) {
    return res.status(400).json({
      mensagem: "Campos id, nome, categoria e preco são obrigatórios!",
    });
  }

  const dataCriacao = new Date();
  const dataModificacao = null;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO produto VALUES (?, ?, ?, ?, ?, ?)",
      [id, nome, categoria, preco, dataCriacao, dataModificacao]
    );

    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao inserir o produto!" });
    }

    return res
      .status(201)
      .json({ mensagem: "Produto cadastrado com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Atualiza parcialmente um produto
app.patch("/produto/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, preco, categoria } = req.body;

  try {
 const [rows] = await connection.execute<IProduto[]>(
  "SELECT * FROM produto WHERE id = ?",
  [id]
);

if (rows.length === 0) {
  return res.status(404).json({ mensagem: "Produto não encontrado!" });
}

// aqui o TS ainda acha que rows[0] pode ser undefined
const produtoAtual = rows[0] as IProduto;

const novoNome = nome ?? produtoAtual.nome;
const novoPreco = preco ?? produtoAtual.preco;
const novaCategoria = categoria ?? produtoAtual.categoria;
const dataModificacao = new Date();

    await connection.execute(
      `UPDATE produto
       SET nome = ?, preco = ?, categoria = ?, data_modificacao = ?
       WHERE id = ?`,
      [novoNome, novoPreco, novaCategoria, dataModificacao, id]
    );

    return res
      .status(200)
      .json({ mensagem: "Produto atualizado com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// Deleta produto
app.delete("/produto/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      "DELETE FROM produto WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado!" });
    }

    return res
      .status(200)
      .json({ mensagem: "Produto deletado com sucesso!" });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    mysqlErrorHandle.validar();
  }
});

// ================== SERVIDOR ==================

app.listen(8000, () => {
  console.log("Iniciando o servidor na porta 8000");
});