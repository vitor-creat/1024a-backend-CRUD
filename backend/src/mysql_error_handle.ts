import { type Response } from 'express';
class MysqlErrorHandle {
    constructor(readonly err: unknown, readonly res: Response) { }
    ehErroMysql(err: unknown) {
        if (err instanceof Error && 'code' in err) {
            return true
        }
        return false
    }
    validar() {
        console.log(this.err)
        if (this.err instanceof Error && 'code' in this.err) {
            if ( this.err.code === 'ECONNREFUSED') {
                return this.res.status(500).json({ mensagem: "ERRO: LIGUE O LARAGON e confira o usuário e senha da conexão" })
            } else if (this.err.code === 'ENOTFOUND') {
                return this.res.status(500).json({ mensagem: "ERRO: Você digitou algo errado no host da conexão" })
            } else if (this.err.code === 'ER_BAD_DB_ERROR') {
                return this.res.status(500).json({ mensagem: "ERRO: Confira o nome do banco de dados ou crie um banco com o nome que você passou na conexão" })
            } else if (this.err.code === 'ER_ACCESS_DENIED_ERROR') {
                return this.res.status(500).json({ mensagem: "ERRO: Confira usuario e senha na conexão" })
            } else if (this.err.code === 'ER_PARSE_ERROR') {
                return this.res.status(500).json({ mensagem: "ERRO: Você tem um erro na sua SQL, confira o Execute" })
            } else if (this.err.code === 'ER_NO_SUCH_TABLE') {
                return this.res.status(500).json({ mensagem: "ERRO: Você digitou o nome da tabela errado, confira o Execute!" })
            } else if (this.err.code === 'ER_DUP_ENTRY') {
                return this.res.status(500).json({ mensagem: "ERRO: Já existe um id cadastrado anteriomente no banco de dados!" })
            } else {
                return this.res.status(500).json({ mensagem: "ERRO MYSQL: Desconhecido!" })
            }
        }
        return this.res.status(500).json({ mensagem: "ERRO: Desconhecido!" })

    }
}

export default MysqlErrorHandle