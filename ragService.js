import axios from 'axios';

const RAG_BASE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8001';

const ragClient = axios.create({
    baseURL: RAG_BASE_URL,
});

/**
 * Ask the Python service to embed a freshly created discussion and store
 * the vector itself (it has its own Mongo connection).
 * Fire-and-forget — never throws.
 */
export const embedDiscussion = async (doc) => {
    try {
        const { data } = await ragClient.post(
            '/embed',
            {
                discussionId: doc._id?.toString?.() || doc._id,
                title: doc.title,
                content: doc.content,
                tags: doc.tags || [],
                category: doc.category || 'general',
            },
            { timeout: 15000 }
        );
        return data;
    } catch (err) {
        console.error('[ragService] embedDiscussion failed:', err?.message || err);
        return { success: false, error: err?.message || String(err) };
    }
};

/**
 * Run the full RAG chat pipeline on the Python service.
 * Throws so chatController.js can fall back to Groq on failure.
 */
export const ragChat = async (message, userId) => {
    const { data } = await ragClient.post(
        '/chat',
        { message, userId: userId?.toString?.() || userId || null },
        { timeout: 45000 }
    );
    return data;
};

export const isRagAvailable = async () => {
    try {
        await ragClient.get('/health', { timeout: 2000 });
        return true;
    } catch (_) {
        return false;
    }
};

export default { embedDiscussion, ragChat, isRagAvailable };
