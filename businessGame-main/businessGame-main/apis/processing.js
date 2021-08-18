import config from 'config';

module.exports = (app) => {
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  const gameSave = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const roomId = parseInt(req.params.id, 10);

      let roomFromDB = await app.models.room.where({ id: roomId }).fetch();
      roomFromDB = roomFromDB.toJSON();
      const { month } = roomFromDB;

      const gameFromMongo = await app.models.coins
        .where({ roomId, userId, month })
        .find();

      if (gameFromMongo.length >= 1) {
        await app.models.gameData.where({ roomId, userId, month }).updateOne({
          game: req.body,
        });
      } else {
        await app.models.coins.create({
          game: req.body,
          roomId,
          userId,
          month,
        });
      }

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send();
    }
  };

  const engine = async (req, res) => {
    try {
      const { equipment, employees } = req.body; // seto os valores de maquinas e empregados vindos do body
      const { id } = req.params; //seto id de room vindo de parametros
      let room = await app.models.room.where({ id }).fetch(); // busco a room do DB
      room = room.toJSON(); //transformo a query em json

      const employeesPrices = config.get('employees'); // seto os valores de maquinário
      const equipmentPrices = config.get('equipment'); // seto os valores de empregados
      const roomConfig = config.get(`industry.${room.industry}`); // seto os valores de room

      // const combined = [{machines, employees}, {machinePrices, employeePrices}].reduce((a, obj) => {
      //   Object.entries(obj).forEach(([key, val]) => {
      //     a[key] = (a[key] || 0) * val;
      //   });
      //   return a;
      // });

      if (room.month === 1)
        await app.models.coins.create({
          coins: roomConfig.income,
          userId: req.user.id,
          roomId: room.id,
        });

      //Conferir o que o usuário setou para o mês e somar pra calcular o gasto bruto do mês

      let equipmentObject = {};

      //confere maquinário
      if ((equipment.chicken_cut_line = 0 || 1)) {
        equipmentObject.chicken_cut_line =
          equipment.chicken_cut_line * equipmentPrices.chicken_cut_price;
      }

      if ((equipment.whole_chicken_line = 0 || 1)) {
        equipmentObject.whole_chicken_line =
          equipment.whole_chicken_line * equipmentPrices.whole_chicken_price;
      }

      if ((equipment.sausage_line = 0 || 1)) {
        equipmentObject.sausage_line =
          equipment.sausage_line * equipmentPrices.sausage_line_price;
      }

      if ((equipment.import_office = 0 || 1)) {
        equipmentsObject.import_office =
          equipments.import_office * equipmentPrices.import_office_price;
      }

      if ((equipment.storage_space = 0 || 1)) {
        equipmentObject.storage_space =
          equipment.storage_space * equipmentPrices.storage_space_price;
      }
      const equipmentSum = sum(equipmentObject);

      // Confere quais funcionários foram escolhidos

      let employeesObject = {};

      if (employees.production_assistant >= 1) {
        employeesObject.production_assistant =
          employees.production_assistant * employeesPrices.cost_with_charges;
      }

      // representa 5% dos aux de produção
      if ((employees.office_assistant = 1)) {
        employeesObject.office_assistant =
          employeesObject.office_assistant * employeesPrices.cost_with_charges;
      } else if (
        (employees.office_assistant =
          employeesObject.production_assistant * 0.5)
      ) {
        employeesObject.office_assistant =
          employeesObject.production_assistant *
          0.5 *
          employeesPrices.cost_with_charges;
      }

      if ((employees.production_manager = 0 || 1)) {
        employeesObject.production_manager =
          employees.production_manager * employeesPrices.cost_with_charges;
      }

      if ((employees.quality_control = 0 || 4)) {
        employeesObject.quality_control =
          employees.quality_control * employeesPrices.cost_with_charges;
      }

      if ((employees.commercial_manager = 1)) {
        employeesObject.commercial_manager =
          employees.commercial_manager * employeesPrices.cost_with_charges;
      }
      const employeeSum = sum(employeesObject);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const rawMaterial = async (req, res) => {
    try {
      const { id } = req.user;
      const { raw_material } = req.body;
      let user = await app.models.coins.where({ id }).fetch();
      user = user.toJSON();

      // tirar duvida sobre condição de pagamento
      let rawMaterialObject = {};

      if (raw_material.live_chicken_light > 1) {
        rawMaterialObject =
          raw_material.live_chicken_light * raw_material.live_chicken.price;
      }

        //MUDAR NOME DO FRANGO...
      if (raw_material.live_chicken_heavy > 1) {
        rawMaterialObject =
          raw_material.live_chicken_heavy * raw_material.live_chicken_heavy.price;
      }
      //tirar duvida
      if (raw_material.swine_raw_material > 1) {
        rawMaterialObject =
          (raw_material.swine_raw_material *
            raw_material.swine_raw_material.price) /
          28;
      }

      if (raw_material.plastic_bags > 1) {
        rawMaterialObject =
          raw_material.plastic_bags * raw_material.plastic_bags.price;
      }

      if (raw_material.cardboard_box > 1) {
        rawMaterialObject =
          raw_material.cardboard_box * raw_material.cardboard_box.price;
      }

      if (raw_material.condiment > 1) {
        rawMaterialObject =
          raw_material.condiment * raw_material.condiment.price;
      }

      if (raw_material.french_fries > 1) {
        rawMaterialObject =
          raw_material.french_fries * raw_material.french_fries.price;
      }
      const rawMaterialSum = sum(rawMaterialObject);

      const productsFromDB = await app.models.gameProducts
        .where({ userId, roomId, month })
        .find();

      if (productsFromDB.length >= 1) {
        await app.models.gameProducts
          .where({ roomId, userId })
          .updateMany({ remaining: 0 });
      }

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingLiveChicken,
        price: raw_material.live_chicken_light * 4.2,
        month,
        expire: 1,
        type: 'live_chicken',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingLiveCutChicken,
        price: raw_material.live_chicken_heavy * 4.05,
        month,
        expire: 1,
        type: 'live_cut_chicken',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingSwineRawMaterial,
        price: raw_material.swine_raw_material * 11.9,
        month,
        expire: 90,
        type: 'swine_raw_material',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingPlasticBags,
        price: raw_material.plastic_bags * 350,
        month,
        expire: 365,
        type: 'plastic_bags',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingCardBoardBox,
        price: raw_material.cardboard_box * 1.85,
        month,
        expire: 30,
        type: 'cardboard_box',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingCondiment,
        price: raw_material.condiment * 95.0,
        month,
        expire: 90,
        type: 'condiment',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingFrenchFries,
        price: raw_material.french_fries * 4.9,
        month,
        expire: 90,
        type: 'french_fries',
      });
    } catch (err) {
      console.log(err)
      return res .status(500).send(err);
    }
  };

  const shelfLife = async (req, res) => {
    const { userId } = req.user;
    const { expire } = req.params;
    const { raw_material } = req.user;
    let productFromDB = await app.models.gameProducts
      .where({ expire, userId })
      .find();

    try {
      //MUDAR O NOME
      if (raw_material.live_chicken_light.shelf_life > 1) {
        return res.status(400).send('Frango VIVO LEVE fora da validade.');
      }

      if (raw_material.live_chicken_heavy.shelf_life > 1) {
        return res.status(400).send('Frango VIVO PESADO fora da validade.');
      }

      if (raw_material.swine_raw_material.shelf_life > 90) {
        return res.status(400).send('Matéria prima suína fora da validade.');
      }

      if (raw_material.plastic_bags.shelf_life > 365) {
        return res.status(400).send('Sacos plasticos fora da validade.');
      }

      if (raw_material.cardboard_box.shelf_life > 30) {
        return res.status(400).send('Caixas de papelão fora da validade.');
      }

      if (raw_material.condiment.shelf_life > 90) {
        return res.status(400).send('Condimento fora da validade.');
      }

      if (raw_material.french_fries.shelf_life > 90) {
        return res.status(400).send('Batata frita fora da validade.');
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const production = async (req, res) => {
    try {
      const { id } = req.params;
      let roomFromDB = await app.models.room.where({ id }).fetch();
      roomFromDB = roomFromDB.toJSON();

      const { id: userId } = req.user;
      const { raw_material } = req.user;
      let userFromDB = await app.models.gameProducts
        .where({ id: userId })
        .fetch();
      userFromDB = userFromDB.toJSON();

      let breastFile = [];
      let wholeChicken = [];
      let sausage = [];
      let frozenFrenchFries = [];

      // produto - filé de peito: plástico + frango vivo + caixa de papelão;
      if (
        (raw_material.live_chicken_light > 1,
        raw_material.plastic_bags > 1,
        raw_material.cardboard_box > 1)
      ) {
        (breastFile = raw_material.live_chicken_light),
          raw_material.plastic_bags,
          raw_material.cardboard_box;
      }

      // frango inteiro: plástico, frango vivo, caixa de papelão
      if (
        (raw_material.live_chicken_light > 1,
        raw_material.plastic_bags > 1,
        raw_material.cardboard_box > 1)
      ) {
        (wholeChicken = raw_material.live_chicken_light),
          raw_material.plastic_bags,
          raw_material.cardboard_box;
      }

      // salsichão: plástico, frango vivo, materia prima suina, caixa de papelão, condimento
      if (
        (raw_material.live_chicken_light > 1,
        raw_material.plastic_bags > 1,
        raw_material.swine_raw_material > 1,
        raw_material.cardboard_box > 1,
        raw_material.condiment > 1)
      ) {
        (sausage = raw_material.live_chicken_light),
          raw_material.plastic_bags,
          raw_material.swine_raw_material,
          raw_material.cardboard_box,
          raw_material.condiment;
      }

      // batata frita congelada: batata congelada
      if (raw_material.french_fries > 1) {
        frozenFrenchFries = french_fries;
      }

      const productsFromDB = await app.models.gameProducts
        .where({ userId, roomId, month, object })
        .find();

      if (productsFromDB.length >= 1) {
        await app.models.gameProducts
          .where({ roomId, userId })
          .updateMany({ remaining: 0 });
      }

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingbreastFile,
        object: breastFile,
        month,
        type: 'breastFile',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingwholeChicken,
        object: wholeChicken,
        month,
        type: 'wholeChicken',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingsausage,
        object: sausage,
        month,
        type: 'sausage',
      });

      await app.models.gameProducts.create({
        userId,
        roomId,
        remaining: remainingfrozenFrenchFries,
        object: frozenFrenchFries,
        month,
        type: 'frozenFrenchFries',
      });
    } catch (err) {
      return res.status(500).send(err);
    }
  };
  const capacityProduction = async (req, res) => {
    try {
      const { id } = req.params;
      let room = await app.models.room.where({ id }).fetch();
      room = room.toJSON();

      const { id: userId } = req.user;
      const { equipment } = req.user;
      let user = await app.models.coins.where({ id: userId }).find();
      user = user.toJSON();

      const capacityBreastFile = {};
      const capacityWholeChicken = {};
      const capacitySausageLine = {};
      const capacityImportOffice = {};
      const capacityStoreSpace = {};

      // em caso de perdas

      const capacityLostBreastFile = {};
      const capacityLostWholeChicken = {};
      const capacityLostSausageLine = {};
      const capacityLostImportOffice = {};
      const capacityLostStoreSpace = {};

      // capacidade de produção e perdas de file de peito (breast_file)
      if (
        (equipment.chicken_cut_line.product.breast_file.employees_per_shift = 90)
      ) {
        capacityBreastFile =
          equipment.chicken_cut_line.product.breast_file.capacity_kg_per_shift;
      } else if (
        equipment.chicken_cut_line.product.breast_file.employees_per_shift < 90
      ) {
        capacityLostBreastFile =
          equipment.chicken_cut_line.product.breast_file.capacity_kg_per_shift *
          0.3;
      }

      // capacidade de produção e perdas de frango inteiro (whole_chicken)
      if (
        (equipment.whole_chicken_line.product.whole_chicken.employees_per_shift = 30)
      ) {
        capacityWholeChicken =
          equipment.whole_chicken_line.product.whole_chicken
            .capacity_kg_per_shift;
      } else if (
        equipment.whole_chicken_line.product.whole_chicken.employees_per_shift <
        30
      ) {
        capacityLostWholeChicken =
          equipment.whole_chicken_line.product.whole_chicken
            .capacity_kg_per_shift * 0.3;
      }

      // capacidade de produção e perdas de salsichão (sausage)
      if ((equipment.sausage_line.product.sausage.employees_per_shift = 20)) {
        capacitySausageLine =
          equipment.sausage_line.product.sausage.employees_per_shift;
      } else if (
        equipment.sausage_line.product.sausage.employees_per_shift < 20
      ) {
        capacityLostSausageLine =
          equipment.sausage_line.product.sausage.employees_per_shift * 0.3;
      }

      // capacidade de produção e perdas de batata frita congelada (frozen_french_fries)
      if (
        (equipment.import_office.product.frozen_french_fries.employees_per_shift = 10)
      ) {
        capacityImportOffice =
          equipment.import_office.product.frozen_french_fries
            .capacity_kg_per_shift;
      } else if (
        equipment.import_office.product.frozen_french_fries
          .employees_per_shift < 10
      ) {
        capacityLostImportOffice =
          equipment.import_office.product.frozen_french_fries
            .capacity_kg_per_shift * 0.3;
      }

      // capacidade de produção e perdas de espaço de armazenamento (store_space)
      if ((equipment.storage_space.product.all.employees_per_shift = 5)) {
        capacityStoreSpace =
          equipment.storage_space.product.all.capacity_kg_per_shift;
      } else if (equipment.storage_space.product.all.employees_per_shift < 5) {
        capacityLostStoreSpace =
          equipment.storage_space.product.all.capacity_kg_per_shift * 0.3;
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  const freight = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const {
        capacityBreastFile,
        capacityWholeChicken,
        capacitySausageLine,
        capacityImportOffice,
      } = req.body;
      const { breastFile, wholeChicken, sausage, frozenFrenchFries } = req.body;

      let userFromDB = await app.models.coins.where({ id: userId }).find();

      let freightObject = {};

      if ((breastFile > 1, capacityBreastFile > 1)) {
        freightObject =
          industry.freight_table.cart * capacityBreastFile ||
          industry.freight_table.truck * capacityBreastFile ||
          industry.freight_table.threefour * capacityBreastFile;
      }

      if ((wholeChicken > 1, capacityWholeChicken > 1)) {
        freightObject =
          industry.freight_table.cart * capacityWholeChicken || 
          industry.freight_table.truck * capacityWholeChicken || 
          industry.freight_table.threefour * capacityWholeChicken;
      }

      if ((sausage > 1, capacitySausageLine > 1)) {
        freightObject =
          industry.freight_table.cart * capacitySausageLine ||
          industry.freight_table.truck * capacitySausageLine ||
          industry.freight_table.threefour * capacitySausageLine;
      }

      if ((frozenFrenchFries > 1, capacityImportOffice > 1)) {
        freightObject =
          industry.freight_table.cart * capacityImportOffice ||
          industry.freight_table.truck * capacityImportOffice ||
          industry.freight_table.threefour * capacityImportOffice;
      }

      const freightSum = sum(freightObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send('O frete não foi realizado.');
    }
  };

  const trainingEmployees = async (req, res) => {
    try {
    const { id: userId } = req.user;
    const { id: roomId } = req.user;

    const { training } = req.body;
    const { employees } = req.user;

    let roomFromDB = await app.models.room.where({ id: roomId }).fetch();
    roomFromDB = roomFromDB.toJSON();

    let userFromDB = await app.models.coins.where({ id: userId }).find();
    userFromDB = userFromDB.toJSON();

    const { month } = req.params;

    let trainingObject = {};
    let lostObject = {};
    // trainamento de funcionário
    if (
      (employees.production_assistant,
      employees.office_assistant,
      employees.production_manager,
      employees.quality_control,
      employees.commercial_manager,
      employees.production_supervisor)
    ) {
      (trainingObject = training.production_assistant),
        training.office_assistant,
        training.production_manager,
        training.quality_control,
        training.commercial_manager,
        training.production_supervisor;
    } else if (!training) {
      (lostObjectBreastFile = capacityBreastFile * 0.3),
        (lostObjectWholeChicken = capacityWholeChicken * 0.3),
        (lostObjectSausageLine = capacitySausageLine * 0.3),
        (lostObjectImportOffice = capacityImportOffice * 0.3),
        (lostObjectStoreSpace = capacityStoreSpace * 0.3);
      for (let index = 0.3; !training, month > 1; index + 0.2) {}
    }
    const trainingSum = sum(trainingObject);
    const lostSum = sum(lostObject);
    return res .status(200).send('Treinamento realizado com sucesso.')
  } catch (err) {
    console.log(err)
    return res .status(500).send('Treinamento não realizado.')
  }
  };

  const maintenance = async (req, res) => {
    const { userId } = req.user;
    const { equipment } = req.user;

    let roomFromDB = await app.models.coins.where({ userId, equipment }).find();
    roomFromDB = roomFromDB.toJSON();

    let maintenanceObject = {};

    try {
      if (equipment.chicken_cut_line) {
        maintenanceObject =
          equipment.chicken_cut_line.maintenance_cost_per_week;
      } else if (!equipment.chicken_cut_line) {
        return res
          .status(400)
          .send('Fábrica não possui linha de corte de frango.');
      }

      if (equipment.whole_chicken_line) {
        maintenanceObject =
          equipment.whole_chicken_line.maintenance_cost_per_week;
      } else if (!equipment.whole_chicken_line) {
        return res
          .status(400)
          .send('Fábrica não possui linha de frango inteiro.');
      }

      if (equipment.sausage_line) {
        maintenanceObject = equipment.sausage_line.maintenance_cost_per_week;
      } else if (!equipment.sausage_line) {
        return res.status(400).send('Fábrica não possui linha de embutidos.');
      }

      if (equipment.import_office) {
        maintenanceObject = equipment.import_office.maintenance_cost_per_week;
      } else if (!equipment.import_office) {
        return res
          .status(400)
          .send('Fábrica não possui escritório de importação.');
      }

      if (equipment.storage_space) {
        maintenanceObject = equipment.storage_space.maintenance_cost_per_week;
      } else if (!equipment.storage_space) {
        return res
          .status(400)
          .send('Fábrica não possui espaço de armazenamento.');
      }

      const maintenanceSum = sum(maintenanceObject);
    } catch (err) {
      console.log(err);
      return res.status(500).send('Manutenção não realizada.');
    }
  };

  const sell = async (req, res) => {
    try {
      const {
        capacityBreastFile,
        capacityWholeChicken,
        capacitySausageLine,
        capacityImportOffice,
        capacityLostBreastFile,
        capacityLostWholeChicken,
        capacityLostSausageLine,
        capacityLostImportOffice,
      } = req.user;
      const { id: userId } = req.user;
      const { month } = req.params; // a venda é realizada no final de cada mês

      const roomFromDB = await app.models.coins.where({ id: userId }).fetch();
      roomFromDB = roomFromDB.toJSON();

     let userFromDB = await app.models.where({ id: userId }).updateOne({ object })

      let sellProductBreasFile = {};
      let sellProductWholeChicken = {};
      let sellProductSausageLine = {};
      let sellProductImportOffice = {};
      // calculo da quantidade de produto produzido vezes o valor do lucro

      if (capacityBreastFile) {
        sellProductBreasFile = capacityBreastFile * 1.76;
      } else if (capacityLostBreastFile) {
        sellProductBreasFile = capacityLostBreastFile * 1.76;

        return res
          .status(200)
          .send('Venda de Filé de Peito realizada com sucesso.');
      }
      if (capacityWholeChicken) {
        sellProductWholeChicken = capacityWholeChicken * 0.84;
      } else if (capacityLostWholeChicken) {
        sellProductWholeChicken = capacityLostWholeChicken * 0.84;

        return res
          .status(200)
          .send('Venda de Frango Inteiro realizada com sucesso.');
      }

      if (capacitySausageLine) {
        sellProductSausageLine = capacitySausageLine * 2.51;
      } else if (capacityLostSausageLine) {
        sellProductSausageLine = capacityLostSausageLine * 2.51;

        return res
          .status(200)
          .send('Venda de Salsichão realizada com sucesso.');
      }

      if (capacityImportOffice) {
        sellProductImportOffice = capacityImportOffice * 0.95; //está relacionado com a batata frita congelada
        return res
          .status(200)
          .send('Venda de Batata Frita Congelada realizada com sucesso.');
      } else if (capacityLostImportOffice) {
        sellProductImportOffice = capacityLostImportOffice * 0.95
      }

      //verifica se há gerente comercial, então só assim irá calcular o lucro
      let { commercial_manager } = req.user;

      if (!commercial_manager) {
        return res
          .status(400)
          .send('Fábrica não possuí gerente comercial, logo não haverá lucro.');
      } else if (commercial_manager) {
        const sellSum =
          sum(sellProductBreasFile) +
          sum(sellProductWholeChicken) +
          sum(sellProductSausageLine) +
          sum(sellProductImportOffice); //lucro

        return res.status(200).send('Cáculo de lucro realizado com sucesso.');
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('A venda não foi efetuada.');
    }
  };

  const historyGame = async (req, res) => {
    const { id: userId } = req.user;
    const { id: roomId } = req.params;
    try {
      let gameFromSQL = await app.models.room.where({ id: roomId }).fetch();
      gameFromSQL = gameFromSQL.toJSON();
      const gameDB = await app.models.coins
        .where({ userId, roomId, month: gameFromSQL.month - 1 })
        .find();
      const objectToFront = { game: gameDB[0].game, month: gameDB[0].month };
      return res.status(200).send(objectToFront);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  const productsGet = async (req, res) => {
    const { id: userId } = req.user;
    const { id: roomId } = req.params;
    try {
      const productsFromDB = await app.models.gameProducts.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              type: '$type',
              roomId: '$roomId',
              expire: { $lt: ['$expire', 1] },
            },
            value: { $sum: '$remaining' },
          },
        },
      ]);

      const productsArray = productsFromDB.filter((item) => {
        return (
          item._id.expire === false && item._id.roomId === parseInt(roomId, 10)
        );
      });

      return res.status(200).send(productsArray);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  return {
    gameSave,
    engine,
    rawMaterial,
    shelfLife,
    production,
    freight,
    capacityProduction,
    trainingEmployees,
    maintenance,
    sell,
    historyGame,
    productsGet,
  };
};
