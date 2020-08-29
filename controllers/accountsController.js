import { db } from "../models/config.js";

const Account = db.accounts;

const create = async (req, res) => {
  try {
    const account = new Account({
      agencia: req.body.name,
      conta: req.body.conta,
      name: req.body.name,
      balance: req.body.balance,
    });
    const data = await account.save();
  } catch (err) {
    res.status(500).send("Problema ao criar a conta " + err);
  }
};

const findAll = async (req, res) => {
  try {
    const data = await Account.find({});
    res.send(data);
  } catch (err) {
    res.status(500).send("Problema ao buscar as contas " + err);
  }
};

const findOne = async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;

  try {
    const data = await Account.findOne({ agencia: agencia, conta: conta });
    res.send("O saldo da conta é " + data.balance);
  } catch (err) {
    res.status(500).send("Está conta não existe" + err);
  }
};

const transfer = async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  const valor = req.body.valor;
  const contaOrigemId = req.params.ido;

  try {
    const contaDestino = await Account.findOne({
      agencia: agencia,
      conta: conta,
    });

    const contaOrigem = await Account.findById({ _id: contaOrigemId });

    if (contaDestino) {
      const transferDestino = await Account.updateOne(
        { conta: conta, agencia: agencia },
        { $inc: { balance: valor } },
        { new: true }
      );
      if (contaOrigem.agencia === contaDestino.agencia) {
        const transferOrigem = await Account.updateOne(
          { _id: contaOrigemId },
          { $inc: { balance: -valor } },
          { new: true }
        );
      } else {
        const transferOrigem = await Account.updateOne(
          { _id: contaOrigemId },
          { $inc: { balance: -valor - 8 } },
          { new: true }
        );
      }

      const contaDestinoAtualizada = await Account.findOne({
        agencia: agencia,
        conta: conta,
      });

      const contaOrigemAtualizada = await Account.findById({
        _id: contaOrigemId,
      });

      res.send(
        "O novo saldo na conta destino é " +
          contaDestinoAtualizada.balance +
          ", e o novo saldo na conta origem é " +
          contaOrigemAtualizada.balance
      );
    } else {
      res.send("Conta destino não existe");
    }
  } catch (err) {
    res.status(500).send("Transferencia não concluida" + err);
  }
};

const deposito = async (req, res) => {
  console.log("AQUI");
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  const valor = req.body.valor;

  try {
    const contaDestino = await Account.findOne({
      agencia: agencia,
      conta: conta,
    });
    console.log(contaDestino);
    if (contaDestino) {
      const depositoConta = await Account.updateOne(
        { agencia: agencia, conta: conta },
        { $inc: { balance: valor } }
      );

      const contaDestinoAtualizada = await Account.findOne({
        agencia: agencia,
        conta: conta,
      });

      res.send(
        "Novo saldo na conta destino é " + contaDestinoAtualizada.balance
      );
    } else {
      res.status(500).send("Conta não existente deposito não efetuado");
    }
  } catch (err) {
    res.status(500).send("Deposito não realizado" + err);
  }
};

const deleteAccount = async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  try {
    const agenciaDelete = await Account.deleteOne({
      agencia: agencia,
      conta: conta,
    });
    const todasContasAgencia = await Account.find({ agencia: agencia });
    res.send(
      "Conta deletada e o novo total de contas nessa egencia é " +
        todasContasAgencia.length
    );
  } catch (err) {
    res.status(500).send("Conta não existe");
  }
};

const mediaSaldo = async (req, res) => {
  const agencia = req.body.agencia;
  try {
    const mediaAgencias = await Account.aggregate([
      { $match: { agencia: agencia } },
      {
        $group: { _id: { agencia: "$agencia" }, media: { $avg: "$balance" } },
      },
    ]);
    res.send(
      "A media de saldo dessa agencia é " + mediaAgencias[0].media.toFixed(2)
    );
  } catch (err) {
    res.status(500).send("Agência não existe " + err);
  }
};

const saque = async (req, res) => {
  const agencia = req.body.agencia;
  const conta = req.body.conta;
  const valor = req.body.valor + 1;

  try {
    const contaDestino = await Account.findOne({
      agencia: agencia,
      conta: conta,
    });
    if (contaDestino.balance >= valor) {
      const saqueDestino = await Account.findOneAndUpdate(
        { conta: conta, agencia: agencia },
        { $inc: { balance: -valor } },
        { new: true }
      );

      res.send("Novo saldo da conta é " + saqueDestino.balance);
    } else {
      res.send("Saque não efetuado, sem saldo suficiente na conta.");
    }
  } catch (err) {
    res.status(500).send("Não foi possivel realizar o saque " + err);
  }
};

const menoresSaldos = async (req, res) => {
  const limite = req.body.limite;
  try {
    const menoresSaldos = await Account.find({})
      .limit(limite)
      .sort({ balance: 1 });
    res.send(menoresSaldos);
  } catch (err) {
    res.status(500).send("Oops houve algum problema " + err);
  }
};

const maioresSaldos = async (req, res) => {
  const limite = req.body.limite;
  try {
    const menoresSaldos = await Account.find({})
      .limit(limite)
      .sort({ balance: -1, name: 1 });
    res.send(menoresSaldos);
  } catch (err) {
    res.status(500).send("Oops houve algum problema " + err);
  }
};

const privateTransfer = async (req, res) => {
  try {
    const agencias = await Account.distinct("agencia");
    console.log(agencias);

    for (var i = 0; i < agencias.length; i++) {
      const agenciaTransferencia = await Account.findOneAndUpdate(
        { agencia: agencias[i] },
        { agencia: 99 }
      ).sort({ balance: -1 });
    }
    const privateAgencias = await Account.find({ agencia: 99 });
    res.send(privateAgencias);
  } catch (err) {
    res.status(500).send("Não foi possivel transferir as contas" + err);
  }
};

const deleteAll = async (req, res) => {
  try {
    const deleteAll = await Account.remove({});
    res.send("Todos arquivos foram removidos");
  } catch (err) {
    res.status(500).send("Não foi possivel remover todos" + err);
  }
};

export default {
  findAll,
  findOne,
  transfer,
  deposito,
  deleteAccount,
  mediaSaldo,
  saque,
  menoresSaldos,
  maioresSaldos,
  privateTransfer,
  deleteAll,
};
