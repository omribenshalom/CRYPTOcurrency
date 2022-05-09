//---------AJAX CONTROL---------------------------

//---------GET-ALL FROM API---------------------------
const getAll = () => {
  return $.ajax({
    method: 'GET',
    url: 'https://api.coingecko.com/api/v3/coins/list',
  });
};

//---------GET-ONE FROM API---------------------------
const getOne = (id) => {
  console.log('id - ', id);
  return $.ajax({
    method: 'GET',
    url: `https://api.coingecko.com/api/v3/coins/${id}`,
  });
};

//---------GET COINS FOR LIVE CHART FROM API---------------------------
const getCoinsForLiveChart = async (symbolsString) => {
  return $.ajax({
    method: 'GET',
    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolsString}&tsyms=USD`,
  });
};
