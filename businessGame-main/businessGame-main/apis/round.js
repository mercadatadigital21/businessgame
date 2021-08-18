// criar rodadas da partida; duração do jogo
module.exports = (app) => {
  const month = async (res) => {
    let day = getMinutes(2);
    let week = getMinutes(10);
    let month = getMinutes(40);

    function time(day) {
      if ((day = 2)) {
        return res.status(200).send('O turno terminou.');
      }
    }

    function time2(week) {
      if ((week = 10)) {
        return res.status(200).send('A semana terminou.');
      }
    }

    function time3(month) {
      if ((month = 40)) {
        return res.status(200).send('A rodada terminou.');
      }
    }
  };
  return { month };
};
