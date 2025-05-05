
// This utility provides AES-256-GCM encryption and decryption functions
// for securing phone numbers

/**
 * Encrypts a phone number using AES-256-GCM
 * @param phoneNumber - The phone number to encrypt
 * @param keyHex - The hex string encryption key (256 bits / 32 bytes)
 * @returns The encrypted phone number as a base64 string
 */
export function encryptPhoneNumber(phoneNumber: string, keyHex: string): string {
  // Input validation
  if (!phoneNumber) throw new Error("Phone number is required");
  if (!keyHex || keyHex.length !== 64) throw new Error("Invalid encryption key");

  try {
    // Convert hex key to bytes
    const keyUint8Array = hexStringToUint8Array(keyHex);
    
    // Generate random IV (16 bytes)
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Convert phone number to bytes
    const encoder = new TextEncoder();
    const phoneNumberBytes = encoder.encode(phoneNumber);
    
    // Get the key as CryptoKey
    return window.crypto.subtle.importKey(
      "raw",
      keyUint8Array,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    )
    .then(key => {
      // Encrypt the phone number
      return window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
          tagLength: 128 // 16 bytes authentication tag
        },
        key,
        phoneNumberBytes
      );
    })
    .then(encryptedContent => {
      // Combine IV and encrypted content
      const encryptedArray = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
      encryptedArray.set(iv, 0);
      encryptedArray.set(new Uint8Array(encryptedContent), iv.byteLength);
      
      // Convert to base64 for easy storage/transmission
      return arrayBufferToBase64(encryptedArray);
    });
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt phone number");
  }
}

/**
 * Decrypts an encrypted phone number
 * @param encryptedText - The encrypted phone number as a base64 string
 * @param keyHex - The hex string encryption key (256 bits / 32 bytes)
 * @returns The decrypted phone number
 */
export function decryptPhoneNumber(encryptedText: string, keyHex: string): Promise<string> {
  // Input validation
  if (!encryptedText) throw new Error("Encrypted text is required");
  if (!keyHex || keyHex.length !== 64) throw new Error("Invalid encryption key");

  try {
    // Convert hex key to bytes
    const keyUint8Array = hexStringToUint8Array(keyHex);
    
    // Convert base64 to array buffer
    const encryptedArray = base64ToArrayBuffer(encryptedText);
    
    // Extract IV (first 16 bytes)
    const iv = encryptedArray.slice(0, 16);
    
    // Extract encrypted content (everything after IV)
    const encryptedContent = encryptedArray.slice(16);
    
    // Get the key as CryptoKey
    return window.crypto.subtle.importKey(
      "raw",
      keyUint8Array,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    )
    .then(key => {
      // Decrypt the phone number
      return window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
          tagLength: 128 // 16 bytes authentication tag
        },
        key,
        encryptedContent
      );
    })
    .then(decryptedContent => {
      // Convert decrypted bytes to string
      const decoder = new TextDecoder();
      return decoder.decode(new Uint8Array(decryptedContent));
    });
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt phone number");
  }
}

// Helper function to convert hex string to Uint8Array
function hexStringToUint8Array(hexString: string): Uint8Array {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
