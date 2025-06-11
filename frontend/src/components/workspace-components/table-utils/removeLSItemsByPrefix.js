export default function removeLSItemsByPrefix(prefix) {
    // Get all keys currently in localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Check if the key starts with the specified prefix
      if (key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
  
    // Remove the identified keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }