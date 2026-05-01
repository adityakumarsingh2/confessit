import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

export function useConfessions() {
    const [confessions, setConfessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState({ bookmarks: [], drafts: [], myConfessions: [] });
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchConfessions = useCallback(async (filters = {}, silent = false) => {
        try {
            if (!silent) setLoading(true);
            const params = new URLSearchParams(filters).toString();
            const res = await fetch(`${API}/confessions?${params}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load confessions');
            const data = await res.json();
            setConfessions(data);
        } catch (e) {
            console.error('fetchConfessions:', e.message);
            setConfessions([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch(`${API}/user`, { credentials: 'include' });
            if (!res.ok) { setUser(null); return; }
            const data = await res.json();
            setUser(data);
        } catch (e) {
            setUser(null);
        }
    }, []);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch(`${API}/user/activity`, { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            setActivity(data);
        } catch (e) {
            console.error('fetchActivity:', e.message);
        }
    }, []);

    const fetchSingleConfession = useCallback(async (id) => {
        try {
            const res = await fetch(`${API}/confessions/${id}`, { credentials: 'include' });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('fetchSingleConfession:', e.message);
            return null;
        }
    }, []);

    useEffect(() => {
        fetchConfessions();
        fetchUser();
    }, [fetchConfessions, fetchUser]);

    useEffect(() => {
        if (user) {
            fetchActivity();
        }
    }, [user, fetchActivity]);

    const postConfession = async (payload) => {
        const res = await fetch(`${API}/confessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        await fetchConfessions();
        await fetchActivity();
    };

    const reactToConfession = async (id, emoji) => {
        const res = await fetch(`${API}/confessions/${id}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ emoji }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Reaction failed');
        }
        await fetchConfessions({}, true);
    };

    const toggleBookmark = async (id) => {
        const res = await fetch(`${API}/user/bookmarks/${id}`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Bookmark failed');
        await fetchActivity();
    };

    const saveDraft = async (payload) => {
        const res = await fetch(`${API}/user/drafts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Draft save failed');
        await fetchActivity();
    };

    const postComment = async (confessionId, payload) => {
        const res = await fetch(`${API}/confessions/${confessionId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Comment failed');
        await fetchConfessions({}, true);
    };

    const voteOnPoll = async (id, optionIndex) => {
        const res = await fetch(`${API}/confessions/${id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ optionIndex }),
        });
        if (!res.ok) throw new Error('Vote failed');
        await fetchConfessions({}, true);
    };

    const updateConfession = async (id, payload) => {
        const res = await fetch(`${API}/confessions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Update failed');
        }
        await fetchConfessions({}, true);
    };

    const deleteConfession = async (id) => {
        const res = await fetch(`${API}/confessions/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Delete failed');
        }
        await fetchConfessions({}, true);
        await fetchActivity();
    };

    const regenerateIdentity = async () => {
        const res = await fetch(`${API}/user/regenerate-identity`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to regenerate');
        const data = await res.json();
        setUser(data);
    };

    const fetchPublicUser = useCallback(async (id) => {
        const res = await fetch(`${API}/users/${id}`);
        if (!res.ok) return null;
        return await res.json();
    }, []);

    const fetchInbox = useCallback(async (markAsRead = false) => {
        const res = await fetch(`${API}/user/inbox${markAsRead ? '?markAsRead=true' : ''}`, { credentials: 'include' });
        if (!res.ok) return [];
        const data = await res.json();
        if (markAsRead) setUnreadCount(0);
        return data;
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch(`${API}/user/inbox/unread-count`, { credentials: 'include' });
            if (!res.ok) return;
            const { count } = await res.json();
            setUnreadCount(prev => {
                if (count > prev) {
                    // Trigger a custom event or we expect the caller to handle toast?
                    // Let's use a custom event or a callback passed to useConfessions if we had one.
                    // For now, we'll dispatch a window event that App.jsx can listen to.
                    window.dispatchEvent(new CustomEvent('new-confession', { detail: { count: count - prev } }));
                }
                return count;
            });
        } catch (e) {
            console.error('fetchUnreadCount:', e.message);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // 30s polling
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadCount]);

    const postPrivateConfession = async (payload) => {
        const res = await fetch(`${API}/confessions/private`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    };

    const postReply = async (id, text) => {
        const res = await fetch(`${API}/confessions/${id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Reply failed');
        }
        await fetchConfessions({}, true); // Refresh feed
    };

    return {
        confessions,
        loading,
        user,
        activity,
        postConfession,
        reactToConfession,
        toggleBookmark,
        saveDraft,
        postComment,
        voteOnPoll,
        updateConfession,
        deleteConfession,
        regenerateIdentity,
        fetchSingleConfession,
        fetchPublicUser,
        fetchInbox,
        unreadCount,
        postPrivateConfession,
        postReply,
        refresh: fetchConfessions,
    };
}
