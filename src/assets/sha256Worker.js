// sha256Worker.js
self.onmessage = async (e) => {
    const { file } = e.data;

    // Read the file as an ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Compute the SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Post the result back to the main thread
    self.postMessage({ hash: hashHex });
};