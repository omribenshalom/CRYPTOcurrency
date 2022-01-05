//---------GENERAL MAIN VARIABLES---------------------
//coins from api.
let coins = [];

//coins with toggle on. "followed coins".
let followCoins = [];

//catch main containers.
let mainHTML = document.getElementById('main-html');
let mainContainer = document.getElementById('main-container');
let aboutContainer = document.getElementById('about-container');
let chartContainer = document.getElementById('chart-container');
let errorContainer = document.getElementById('error-container');

//other variables needed in more then one function.
let moreInfo;
let myReportsInterval;

//---------ON LOAD INIT-------------------------------
const init = async () => {
  clearMainDisplay();

  // loader on screen
  mainContainer.innerHTML =
    '<img class="main-page-loader" src="assets/svg/ringsLoader.svg" alt="loading animation"></img>';

  try {
    coins = getLS('allCoinsFromApi');
    
    // get coins from server only if none in local storage.
    if (!coins){
      const coinsList = await getAll();
      coins = coinsList.slice(0, 100);
      setLS('allCoinsFromApi', coins);
    }
    
    buildHome(coins);
  } catch (err) {
    console.error(err);
    errorContainer.innerHTML = `
      <h2>Oops ! An error occurred while loading page.. </h2>
      `;
  }
};

//---------SEARCH INPUT CONTROL-----------------------
const search = () => {
  const searchInput = $('#search-input').val();
  const coinsList = JSON.parse(localStorage.getItem('allCoinsFromApi'));
  const filteredCoins = coinsList.filter((coin) => {
    return coin.symbol.includes(searchInput);
  });

  buildHome(filteredCoins);
};

//---------BUILD ABOUT CONTROL------------------------
const buildAbout = () => {
  // followCoins = [];
  clearMainDisplay();

  aboutContainer.innerHTML = `
  <div class="main-about">
    <img class="image-about" src="./assets/images/bensha.jpg" alt="picture of Omri Ben Shalom">
    <div class="text-about">
      <h3 class="name-about">Omri Ben Shalom</h3>
      <h4 class="description-about"> jQuery-AJAX API Project </h4>
      <h5 class="description-about">
       HTML + CSS <br>
      - New HTML5 tags <br>
      - CSS3 media queries and advanced selectors <br>
      - Dynamic page layouts <br>
      - Bootstrap & flex <br><br>
       JavaScript <br>
      - Objects <br>
      - Callbacks, Promises, Async Await <br>
      - jQuery <br>
      - Single Page Application foundations <br>
      - Events <br>
      - Ajax (RESTful API) <br>
      - Documentation <br><br>
       External API's 
      </h5>
    </div>
  </div>
  `;
};

//---------BUILD HOME CONTROL-------------------------
const buildHome = (coins) => {
  clearMainDisplay();

  if (coins.length === 0) {
    mainContainer.innerHTML += `    
      <h2> No matches found.. </h2>
    `;
  } else {
    coins.forEach((coin, index) => {
      mainContainer.innerHTML += `
      <div class="cardi-container">
          <div class="cardi-header">
            <div class="cardi-header-title">
              <h4 class="cardi-title">${coin.symbol}</h4>
            </div>
            <div class="cardi-header-toggle">
              <label class="switchi">
                <input id="${coin.id}" class="checkboxi" type="checkbox" onchange='toggleHandler("${coin.id}")' /> 
                <span class="slideri"></span>
              </label>
            </div>
          </div>
          
          <div class="cardi-details">
            <h6>${coin.name}</h6>
          </div>
  
          <button
            type="button"
            class="btn cardi-button button"
            data-toggle="collapse" 
            data-target="#${coin.id}"
            onclick="moreInfoHandler('${coin.id}')"
            >
            More Info
          </button>
          
          <div class="cardi-bottom">
            <div class='more-info-${coin.id}'></div>  
          </div>  
      </div>
      `;
    });
    
    // toggled coins stay toggled in the 'UI' after leave page and return.
    for (let i=0 ; i < followCoins.length; i++){      
      let checkBox = document.getElementById(followCoins[i].id);
      checkBox.checked = true
    }
  }
};

//---------MORE INFO CLICK CONTROL-----------------
const moreInfoHandler = async (id) => {
  moreInfo = document.querySelector(`.more-info-${id}`);
  if (moreInfo.innerHTML.length === 0) {
    // loader spinner is here. svg.
    let loader =
      '<img class="more-coin-data" src="assets/svg/ringsLoader.svg" width="40" alt="loading animation">';
    moreInfo.innerHTML = loader;
    try {
      let coinInfo = JSON.parse(localStorage.getItem(`coinInfo${id}`));
      if (!coinInfo) {
        coinInfo = await getOne(id);
        localStorage.setItem(`coinInfo${id}`, JSON.stringify(coinInfo));
        //remove from storage after 2 minutes.
        setTimeout(() => {
          localStorage.removeItem(`coinInfo${id}`);
          console.log('remove item from storage ok');
          moreInfo.status = false;
        }, 1000 * 60 * 2);
      }
      moreInfoBuild(coinInfo);
    } catch (err) {
      console.log('error - ', err);
      console.error(err);
    }
  } else {
    moreInfo.innerHTML = '';
  }
};

//---------BUILD MORE INFO CONTROL-----------------
const moreInfoBuild = (coin) => {
  moreInfo = document.querySelector(`.more-info-${coin.id}`);
  moreInfo.innerHTML = `
    <div class='more-coin-data'> 
    <div>
    <p class='more-info-p'> <i class="fas fa-euro-sign"></i> ${coin.market_data.current_price.eur} </p>
    <p class='more-info-p'> <i class="fas fa-shekel-sign"></i> ${coin.market_data.current_price.ils} </p>
    <p class='more-info-p'> <i class="fas fa-dollar-sign"></i> ${coin.market_data.current_price.usd} </p>
    </div>
    <img class="imageInfo" src="${coin.image.large}" alt="image of the current coin" width="30" height="30">
    </div>
  `;
};

//---------TOGGLE CLICK CONTROL--------------------
const toggleHandler = (id) => {
  let checkBox = document.getElementById(id);

  if (checkBox.checked == true) {
    if (followCoins.length < 5) {
      const foundCoin = coins.find((c) => c.id === id);
      followCoins.push(foundCoin);
      coinUpdated();
    } else {
      checkBox.checked = false;
      buildModal(id);
    }
  } else if (checkBox.checked == false) {
    followCoins = followCoins.filter((c) => c.id !== id);
    coinUpdated();
  }
};

//---------MODAL CONTROL----------------------------
let modal = $('.modal-container');
let modalMain = document.querySelector('#modal-main');

const buildModal = (newId) => {
  //new ID is new coin wanted to add to array. use in Func- toggleHandlerModal()//
  modalMain.innerHTML = '';
  followCoins.forEach((coin) => {
    modalMain.innerHTML += `
    <div class="modal-coin-card">
      <h4 class="modal-coin-title">${coin.symbol}</h4>
      <label class="switchi">
              <input class="checkboxi" type="checkbox" id="${coin.id}" checked=true onchange='toggleHandlerModal("${coin.id}","${newId}")' />
              <span class="slideri"></span>
      </label>
    </div>
    `;
  });
  modal.show();
};

const toggleHandlerModal = (id, newId) => {
  //remove coin from array
  let checkBox = document.getElementById(id);
  checkBox.checked = false;
  const filteredCoins = followCoins.filter((c) => c.id !== id);
  followCoins = filteredCoins;

  //add NEW coin to array
  const foundCoin = coins.find((c) => c.id === newId);
  followCoins.push(foundCoin);
  //add coin UI-update.
  checkBox = document.getElementById(newId);
  checkBox.checked = true;

  closeModal();
  coinUpdated();
};

window.onclick = (e) => {
  if (e.target.classList[0] === 'modal-container') {
    closeModal();
  }
};

const closeModal = () => {
  modal.hide();
};

//---------CHART CONTROL----------------------------

const buildChart = async () => {
  clearMainDisplay();

  try {
    if (followCoins.length === 0)
      throw 'Sorry, you need to choose coins first..';

    chartContainer.innerHTML = `
        <div id="chart" class="my-chart-report"></div>
      `;

    var options = {
      animationEnabled: true,
      theme: 'dark2',
      backgroundColor: '#ff6ec705',
      title: { text: `Crypto Values Live - USD` },
      subtitles: [{ text: `` }],
      axisX: {
        title: 'Real Time (in sec)',
        titleFontColor: '#ff6ec7',
        lineColor: '#ff6ec7',
        labelFontColor: '#ff6ec7',
        tickColor: '#ff6ec7',
      },
      axisY: {
        title: 'Coin Value (in USD $)',
        titleFontColor: '#5797d3',
        lineColor: '#5797d3',
        labelFontColor: '#5797d3',
        tickColor: '#5797d3',
        gridColor: '#5797d3',
        gridThickness: 1,
      },
      toolTip: { shared: true },
      legend: {
        cursor: 'pointer',
        itemclick: toggleDataSeries,
      },
      data: [],
    };

    let chart = new CanvasJS.Chart('chart', options);

    //this is how I insert the info for each coin:
    for (let i = 0; i < followCoins.length; i++) {
      options.data.push({
        type: 'spline',
        name: `${followCoins[i].symbol.toUpperCase()}`,
        markerSize: 5,
        showInLegend: true,
        dataPoints: [],
      });
      options.subtitles[0].text += `${followCoins[i].symbol.toUpperCase()}, `;
    }

    // create list of coin symbols => GET from API.
    const getCoinsForChart = async () => {
      try {
        let symbols = followCoins.map((coin) => coin.symbol);
        const mySelectedCoins = await getCoinsForLiveChart(symbols);

        // some coins return INVALID data from api. block here.
        if (mySelectedCoins.Response === 'Error') {
          throw new Error(
            'Sorry, value From API is invalid... Choose different coins.'
          );
        }
        return mySelectedCoins;
      } catch (error) {
        if (error) {
          console.error(error);
          clearInterval(myReportsInterval);

          chartContainer.innerHTML = `
      <div id="chart" class="my-chart-report">
        <h2 class="chart-error">
          ${error}
        </h2>
      </div>
      `;
        }
      }
    };

    //this function been called every 2 sec, asking for the info by the "GET" method
    const updateChart = async () => {
      let mySelectedCoins = await getCoinsForChart();

      //"coinsValues" is creating [] to just the values of the info,
      //this info will be the y value:
      let coinsObj = Object.values(mySelectedCoins);

      let coinsValues = [];
      coinsObj.forEach((coin) => coinsValues.push(coin.USD));

      let myTime = new Date().toLocaleTimeString();

      //this loop is pushing the info for each coin. for both x, y values:
      for (let i = 0; i < coinsValues.length; i++) {
        let myCoin = options.data[i].dataPoints;
        myCoin.push({ y: coinsValues[i], label: myTime });
      }
      chart.render();
    };

    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }
    chart.render();

    updateChart();
    // create the interval to update the chart at al times.
    myReportsInterval = setInterval(() => updateChart(), 2000);
  } catch (error) {
    //error treatment.
    console.log(error);
    chartContainer.innerHTML = `
      <div id="chart" class="my-chart-report">
        <div class="chart-error">
          <h2>
            ${error}
          </h2>
        </div>
      </div>
      `;
  }
};

const clearMainDisplay = () => {
  mainContainer.innerHTML = '';
  aboutContainer.innerHTML = '';
  chartContainer.innerHTML = '';
  errorContainer.innerHTML = '';

  clearInterval(myReportsInterval);
};

document.addEventListener('coin-updated', () => {});
