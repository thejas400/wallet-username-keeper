
// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);

// Elements
let walletSection;
let walletStatus;
let connectWalletBtn;
let platformStatuses = {};

function initialize() {
  // Get elements
  walletSection = document.getElementById('wallet-section');
  walletStatus = document.getElementById('wallet-status');
  
  // Platform status elements
  platformStatuses = {
    instagram: document.getElementById('instagram-status'),
    discord: document.getElementById('discord-status'),
    linkedin: document.getElementById('linkedin-status')
  };
  
  // Load wallet status
  loadWalletStatus();
  
  // Load platform statuses
  loadPlatformStatuses();
}

function loadWalletStatus() {
  // Check if we have a saved wallet address
  chrome.storage.local.get(['walletAddress'], (result) => {
    if (result.walletAddress) {
      displayConnectedWallet(result.walletAddress);
    } else {
      displayDisconnectedWallet();
    }
  });
}

function displayConnectedWallet(address) {
  // Format the address for display (first 6 + ... + last 4)
  const displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  walletStatus.innerHTML = `
    <div class="value">${displayAddress}</div>
    <button id="disconnect-wallet-btn" class="disconnect-btn">Disconnect</button>
  `;
  
  // Add event listener to disconnect button
  document.getElementById('disconnect-wallet-btn').addEventListener('click', disconnectWallet);
}

function displayDisconnectedWallet() {
  walletStatus.innerHTML = `
    <button id="connect-wallet-btn" class="connect-btn">Connect Wallet</button>
  `;
  
  // Add event listener to connect button
  document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
}

function connectWallet() {
  // For simplicity, we'll use a prompt to get the wallet address
  // In a real extension, we'd connect to MetaMask or another wallet provider
  const walletAddress = prompt('Enter your wallet address:');
  
  if (walletAddress) {
    // Save the wallet address
    chrome.storage.local.set({ walletAddress }, () => {
      displayConnectedWallet(walletAddress);
      loadPlatformStatuses();
    });
  }
}

function disconnectWallet() {
  // Clear the wallet address
  chrome.storage.local.remove('walletAddress', () => {
    displayDisconnectedWallet();
    resetPlatformStatuses();
  });
}

function loadPlatformStatuses() {
  chrome.storage.local.get(['walletAddress'], (result) => {
    if (!result.walletAddress) {
      resetPlatformStatuses();
      return;
    }
    
    const walletAddress = result.walletAddress;
    const encryptedData = localStorage.getItem(`credentials_${walletAddress}`);
    
    if (encryptedData) {
      try {
        const decryptedJson = decryptData(encryptedData, walletAddress);
        const credentials = JSON.parse(decryptedJson);
        
        // Update platform statuses
        resetPlatformStatuses();
        
        credentials.forEach(cred => {
          const statusElement = platformStatuses[cred.platform];
          
          if (statusElement) {
            statusElement.textContent = 'Registered';
            statusElement.classList.remove('status-not-registered');
            statusElement.classList.add('status-registered');
          }
        });
      } catch (error) {
        console.error('Error decrypting credentials:', error);
      }
    } else {
      resetPlatformStatuses();
    }
  });
}

function resetPlatformStatuses() {
  // Reset all platform statuses to "Not Registered"
  Object.values(platformStatuses).forEach(element => {
    element.textContent = 'Not Registered';
    element.classList.remove('status-registered');
    element.classList.add('status-not-registered');
  });
}
