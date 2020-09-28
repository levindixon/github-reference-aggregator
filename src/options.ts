const saveOptions = () => {
  const token = <HTMLInputElement>document.getElementById("token");

  const options = {
    token: token.value,
  };

  chrome.storage.sync.set(options, () => {
    const status = <HTMLInputElement>document.getElementById("status");
    status.innerText = "Options saved.";
    setTimeout(() => (status.innerText = ""), 750);
  });
};

const restoreOptions = () =>
  chrome.storage.sync.get("token", (items) => {
    token.value = items.token;
  });

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
