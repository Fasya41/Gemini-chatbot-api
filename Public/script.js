const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Port harus sesuai dengan yang dijalankan oleh server Express Anda.
// Sebaiknya didefinisikan sebagai konstanta.
const API_URL = 'http://localhost:2501/api/chat';

/**
 * Menambahkan pesan baru ke kotak obrolan.
 * @param {string} sender - Pengirim pesan ('user' atau 'bot').
 * @param {string} text - Teks pesan.
 * @returns {HTMLElement} Elemen pesan yang dibuat.
 */
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  // Gulir ke bagian bawah kotak obrolan untuk menampilkan pesan terbaru
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Tampilkan pesan "thinking" sementara dan simpan referensinya
  const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Backend mengharapkan sebuah array pesan
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      // Coba dapatkan pesan error spesifik dari server, atau gunakan default
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `Failed to get response. Status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data && data.result) {
      // Ganti pesan "thinking" dengan respons AI yang sebenarnya
      thinkingMessage.textContent = data.result;
    } else {
      // Tangani kasus di mana respons berhasil tetapi tidak berisi hasil
      thinkingMessage.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Error fetching chat response:', error);
    // Perbarui pesan "thinking" untuk menampilkan error
    thinkingMessage.textContent = 'Failed to get response from server.';
  }
});
