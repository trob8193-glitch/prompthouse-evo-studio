const mission = document.querySelector('#mission');
const state = document.querySelector('#state');
chrome.storage.local.get(['promptHouseMission']).then(({ promptHouseMission }) => {
  mission.value = promptHouseMission || '';
});
document.querySelector('#save').addEventListener('click', async () => {
  await chrome.storage.local.set({ promptHouseMission: mission.value });
  state.textContent = 'Saved ' + new Date().toLocaleString();
});