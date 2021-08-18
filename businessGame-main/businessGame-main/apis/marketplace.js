module.exports = (app) => {
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  //pedido industria
  const marketplace = async (req, res) => {
    const { id: userId } = req.user;

    let productFromDB = await app.models.gameProducts
      .where({ id: userId })
      .find();
    productFromDB = productFromDB.toJSON();

    let breastFile = {};
    let wholeChikken = {};
    let sausage = {};
    let frozenFrenchFries = {};

    let inventoryBreastFile = [];
    let inventoryWholeChicken = [];
    let inventorySausage = [];
    let inventoryFrozenFrenchFries = [];

    try {
      if (product.breast_file > 1) {
        breastFile = product.breast_file * product.breast_file.price;
      } else {
        inventoryBreastFile = product.breast_file;
      }

      if (product.whole_chikken > 1) {
        wholeChikken = product.whole_chikken * product.whole_chikken.price;
      } else {
        inventoryWholeChicken = product.whole_chikken;
      }

      if (product.sausage > 1) {
        sausage = product.sausage * product.sausage.price;
      } else {
        inventorySausage = product.sausage;
      }

      if (product.frozen_french_fries > 1) {
        frozenFrenchFries =
          product.frozen_french_fries * product.frozen_french_fries.price;
      } else {
        inventoryFrozenFrenchFries = product.frozen_french_fries;
      }
      try {
        const marketplaceFromDB = await app.models.marketplace
          .where({ id })
          .insert({
            inventory: inventoryBreastFile,
            inventoryWholeChicken,
            inventorySausage,
            inventoryFrozenFrenchFries,
          });
        marketplaceFromDB = marketplaceFromDB.toJSON();
        if (marketplaceFromDB) {
          return res.status(200).send(marketplaceFromDB);
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      const productSum =
        sum(breastFile) +
        sum(wholeChikken) +
        sum(sausage) +
        sum(frozenFrenchFries);
      return res.status(200).send(productSum);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  const marketing = async (req, res) => {
    // const { marketing } = req.body
    const { id: userId } = req.user;

    let marketingFromDB = await app.models.coins
      .where({ id: userId })
      .find({ marketing });
    marketingFromDB = marketingFromDB.toJSON();

    let marketing = {};

    try {
      if (marketing.repository > 1) {
        marketing = marketing.repository * repository.price;
      }

      if (marketing.demonstrator > 1) {
        marketing = marketing.demonstrator * demonstrator.price;
      }

      if (marketing.insert > 1) {
        marketing = marketing.insert * insert.price;
      }

      if (marketing.radio > 1) {
        marketing = marketing.radio * radio.price;
      }

      if (marketing.tv > 1) {
        marketing = marketing.tv * tv.price;
      }

      const marketingSum = sum(marketing);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  //mercado - estoque mercado
  //o estoque do mercado é armazenado na models.marketplace que é um objeto com os valores (podutos e preços)

  const getProducts = async (req, res) => {
    const { id } = req.params;
    const { inventory } = req.params;

    const productFromDB = await app.models.marketplace.where({ id }).findAll();
    productFromDB = productFromDB.toJSON();
    try {
      if (inventory) {
        return res.status(200).send(productFromDB); //estoque inicial
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    //mostrar quantidade do estoque

    //caculo de produtos no estoque do supermercado
    let breast_file = {};
    let whole_chikken = {};
    let sausageIn = {};
    let frozenFries = {};

    try {
      if (product.breast_file >= 1) {
        breast_file = product.breast_file - inventoryBreastFile;
      }

      if (product.whole_chikken >= 1) {
        whole_chikken = product.whole_chikken - inventoryWholeChicken;
      }

      if (product.sausage >= 1) {
        sausageIn = product.sausage - inventorySausage;
      }

      if (product.frozen_french_fries >= 1) {
        frozenFries = product.frozen_french_fries - inventoryFrozenFrenchFries;
      }
      try {
        let marketplaceFromDB = await app.models.marketplace
          .where({ id })
          .updateMany({
            inventory: inventoryBreastFile,
            inventoryWholeChicken,
            inventorySausage,
            inventoryFrozenFrenchFries,
          });
        marketplaceFromDB = marketplaceFromDB.toJSON();

        if (marketplaceFromDB) {
          return res.status(200).send(marketplaceFromDB);
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      const inventorySum =
        sum(breast_file) +
        sum(whole_chikken) +
        sum(sausageIn) +
        sum(frozenFries); //estoque final

      return res.status(200).send(inventorySum);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  return { marketplace, marketing, getProducts };
};
