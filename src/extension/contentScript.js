
// Import the encryption utilities
importScripts('utils/encryption.js');

// Store platform information
let currentPlatform = '';
let credentialsShown = false;
let overlayElement = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'platformDetected') {
    currentPlatform = request.platform;
    
    // Check if we already have credentials for this platform
    checkForCredentials(currentPlatform);
  }
});

function checkForCredentials(platform) {
  // Send a message to the background script to get credentials
  chrome.runtime.sendMessage({ action: 'getCredentials' }, (response) => {
    if (response && response.success) {
      try {
        // Decrypt the credentials using the wallet address
        const encryptedData = response.encryptedData;
        const walletAddress = response.walletAddress;
        
        // Using the imported decryptData function
        const decryptedJson = decryptData(encryptedData, walletAddress);
        const credentials = JSON.parse(decryptedJson);
        
        // Find the credential for the current platform
        const platformCredential = credentials.find(cred => cred.platform === platform);
        
        if (platformCredential) {
          // If we have credentials for this platform, show the overlay
          showCredentialOverlay(platformCredential);
        }
      } catch (error) {
        console.error('Error decrypting credentials:', error);
      }
    }
  });
}

function showCredentialOverlay(credential) {
  if (credentialsShown) return;
  
  // Create overlay element
  overlayElement = document.createElement('div');
  overlayElement.id = 'secure-credentials-overlay';
  overlayElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 16px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  
  // Create content
  overlayElement.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Secure Credentials</h3>
        <button id="close-overlay" style="background: none; border: none; cursor: pointer; font-size: 18px;">&times;</button>
      </div>
      <div style="padding: 8px; background-color: #f8fafc; border-radius: 0.25rem;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">Username</p>
        <p style="margin: 0; font-weight: 500;">${credential.username}</p>
      </div>
      <div style="padding: 8px; background-color: #f8fafc; border-radius: 0.25rem;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">Password</p>
        <p style="margin: 0; font-weight: 500;">${credential.password}</p>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="autofill-btn" style="flex: 1; padding: 8px 16px; background-color: #0ea5e9; color: white; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">Autofill</button>
        <button id="copy-btn" style="flex: 1; padding: 8px 16px; background-color: #f1f5f9; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 500;">Copy</button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(overlayElement);
  credentialsShown = true;
  
  // Add event listeners
  document.getElementById('close-overlay').addEventListener('click', () => {
    overlayElement.remove();
    credentialsShown = false;
  });
  
  document.getElementById('autofill-btn').addEventListener('click', () => {
    fillCredentials(credential);
    overlayElement.remove();
    credentialsShown = false;
  });
  
  document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(`Username: ${credential.username}\nPassword: ${credential.password}`);
    
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.textContent = 'Copied!';
    copyBtn.style.backgroundColor = '#10b981';
    copyBtn.style.color = 'white';
    
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.style.backgroundColor = '#f1f5f9';
      copyBtn.style.color = 'black';
    }, 2000);
  });
}

function fillCredentials(credential) {
  // Different selectors for different platforms
  let usernameSelector, passwordSelector, submitSelector;
  
  if (currentPlatform === 'instagram') {
    usernameSelector = 'input[name="username"]';
    passwordSelector = 'input[type="password"]';
    submitSelector = 'button[type="submit"]';
  } else if (currentPlatform === 'discord') {
    usernameSelector = 'input[name="email"]';
    passwordSelector = 'input[name="password"]';
    submitSelector = 'button[type="submit"]';
  } else if (currentPlatform === 'linkedin') {
    usernameSelector = 'input#username';
    passwordSelector = 'input#password';
    submitSelector = 'button[type="submit"]';
  }
  
  // Find the elements
  const usernameInput = document.querySelector(usernameSelector);
  const passwordInput = document.querySelector(passwordSelector);
  const submitButton = document.querySelector(submitSelector);
  
  // Fill in the values
  if (usernameInput) {
    usernameInput.value = credential.username;
    triggerEvent(usernameInput, 'input');
  }
  
  if (passwordInput) {
    passwordInput.value = credential.password;
    triggerEvent(passwordInput, 'input');
  }
  
  // Auto submit if requested
  if (submitButton) {
    // We don't auto-submit for security reasons, let the user click the button
    submitButton.focus();
  }
}

function triggerEvent(element, eventType) {
  const event = new Event(eventType, { bubbles: true });
  element.dispatchEvent(event);
}
