// Hàm helper để đọc biến môi trường
const getEnv = (key) => {
    // Ưu tiên đọc từ import.meta.env (Vite) trước
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    // Nếu không có thì đọc từ process.env (Node.js)
    return process.env[key];
};

// Export các biến môi trường
export const env = {
    SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
    DISCORD_BOT_TOKEN: getEnv('VITE_DISCORD_BOT_TOKEN'),
    DISCORD_WEBHOOK_URL: getEnv('VITE_DISCORD_WEBHOOK_URL')
}; 