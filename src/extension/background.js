
// Listen for when tabs are updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the page is completely loaded
  if (changeInfo.status === 'complete') {
    const url = tab.url || '';
    
    // Check if the URL matches any of our target platforms
    const isInstagram = url.includes('instagram.com');
    const isDiscord = url.includes('discord.com');
    const isLinkedIn = url.includes('linkedin.com');
    
    if (isInstagram || isDiscord || isLinkedIn) {
      let platform = '';
      if (isInstagram) platform = 'instagram';
      if (isDiscord) platform = 'discord';
      if (isLinkedIn) platform = 'linkedin';
      
      // Notify the content script that we detected a platform
      chrome.tabs.sendMessage(tabId, { action: 'platformDetected', platform });
    }
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCredentials') {
    // Get the saved wallet address from storage
    chrome.storage.local.get(['walletAddress'], (result) => {
      if (result.walletAddress) {
        const walletAddress = result.walletAddress;
        
        // Get the encrypted credentials from localStorage
        const encryptedData = localStorage.getItem(`credentials_${walletAddress}`);
        
        if (encryptedData) {
          // Send the encrypted data and wallet address to the content script
          sendResponse({ 
            success: true, 
            encryptedData, 
            walletAddress 
          });
        } else {
          sendResponse({ 
            success: false, 
            message: 'No credentials found for this wallet' 
          });
        }
      } else {
        sendResponse({ 
          success: false, 
          message: 'No wallet connected' 
        });
      }
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});
