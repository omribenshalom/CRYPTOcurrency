//---------LOCAL STORAGE CONTROL---------------------------
const getLS = (key) => JSON.parse(localStorage.getItem(key));
const setLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function coinUpdated() {
  console.log('coin updated');

  document.dispatchEvent(new CustomEvent('coin-updated'));
  setLS('toggled-coins', followCoins);
}
