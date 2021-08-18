module.exports = (app) => {
    const populationConsumption = async (req, res) => {
      const { consumption } = req.user;
  
      try {
        if ((consumption = 0.6)) {
          consumption_elasticity.price_max * consumption;
        }
  
        if ((consumption = 0.7)) {
          consumption_elasticity.price_1 * consumption;
        }
  
        if ((consumption = 0.8)) {
          consumption_elasticity.price_2 * consumption;
        }
  
        if ((consumption = 0.9)) {
          consumption_elasticity.price_3 * consumption;
        }
  
        if ((consumption = 1)) {
          consumption_elasticity.price_4 * consumption;
        }
  
        if ((consumption = 1.1)) {
          consumption_elasticity.price_5 * consumption;
        }
  
        if ((consumption = 1.2)) {
          consumption_elasticity.price_6 * consumption;
        }
  
        if ((consumption = 1.3)) {
          consumption_elasticity.price_7 * consumption;
        }
  
        if ((consumption = 1.4)) {
          consumption_elasticity.price_8 * consumption;
        }
  
        if ((consumption = min)) {
          consumption_elasticity.min * consumption;
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    };
  
    const investmentMedia = async (req, res) => {
      const { investment } = req.user;
  
      try {
        if ((investment = 60000.0)) {
          impact = impact_max; //95% de impacto
        }
  
        if ((investment = 54444.44)) {
          impact = impact_1; //86% de impacto
        }
  
        if ((investment = 48888.89)) {
          impact = impact_2; //76% de impacto
        }
  
        if ((investment = 43333.33)) {
          impact = impact_3; //67%
        }
  
        if ((investment = 37777.78)) {
          impact = impact_4; //57%
        }
  
        if ((investment = 32222.22)) {
          impact = impact_5; //48%
        }
  
        if ((investment = 26666.67)) {
          impact = impact_6; //38%
        }
  
        if ((investment = 21111.11)) {
          impact = impact_7; //29%
        }
  
        if ((investment = 15555.56)) {
          impact = impact_8; //19%
        }
  
        if ((investment = 10000.0)) {
          impact = impact_min; //10%
        }
  
        try {
          if (!investment) {
            impact = 0.0;
            return res.status(400).send("Nenhum investimento foi realizado");
          }
        } catch (err) {
          console.log(err);
          return res.status(500).send(err);
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    };
  
    const faithfulnessUser = async (req, res) => {
      const { faithfulness } = req.user;
      const { id: userId } = req.user;
  
      let faith = {};
  
      try {
        if ((faithfulness = 1)) {
          /*primeira compra*/ faith = 0.5; //5% de fidelidade
        }
  
        if ((faithfulness = 2)) {
          faith = 0.6;
        }
  
        if ((faithfulness = 3)) {
          faith = 0.7;
        }
  
        if ((faithfulness = 4)) {
          faith = 0.8;
        }
  
        if ((faithfulness = 5)) {
          faith = 0.9;
        }
  
        if ((faithfulness = 6)) {
          faith = 0.01;
        }
  
        if ((faithfulness = 7)) {
          faith = 0.01;
        }
  
        if ((faithfulness = 8)) {
          faith = 0.01;
        }
  
        if ((faithfulness = 9)) {
          faith = 0.01;
        }
  
        if ((faithfulness = 10)) {
          faith = 0.01;
        }
  
        if (!faithfulness) {
          faith = 0.0; //0% de fidelidade
          return res.status(400).send("Não há fidelidade.");
        }
  
        faithfulnessFromDB = await app.model.marketplace
          .where({ id: userId })
          .uploadOne({ faithfulness })
          .save();
      } catch (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    };

    return { populationConsumption, investmentMedia, faithfulnessUser }
  };
  