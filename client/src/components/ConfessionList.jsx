import { useMemo, useState } from 'react';
import ConfessionCard from './ConfessionCard';
import styles from './ConfessionList.module.css';

function SkeletonCard() {
    return (
        <div className={styles.skeleton}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ height: '14px', width: '40%', marginBottom: '8px' }} />
                    <div style={{ height: '12px', width: '25%' }} />
                </div>
            </div>
            <div style={{ height: '14px', width: '100%', marginBottom: '10px' }} />
            <div style={{ height: '14px', width: '85%', marginBottom: '10px' }} />
            <div style={{ height: '14px', width: '60%' }} />
        </div>
    );
}

export default function ConfessionList({ confessions, loading, user, activity, onReact, onBookmark, onPostComment, onUpdate, onDelete, onVote, onPostReply, addToast, isInbox = false }) {
    if (loading) {
        return (
            <div className={styles.grid}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (confessions.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>🤫</div>
                <h3>Silence...</h3>
                <p>No confessions found in this view. Be the first to break the silence.</p>
            </div>
        );
    }

    return (
        <section className={styles.container}>
            <div className={styles.grid}>
                {confessions.map((c) => (
                    <ConfessionCard
                        key={c._id}
                        confession={c}
                        user={user}
                        activity={activity}
                        onReact={onReact}
                        onBookmark={onBookmark}
                        onPostComment={onPostComment}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onVote={onVote}
                        onPostReply={onPostReply}
                        addToast={addToast}
                        isInbox={isInbox}
                    />
                ))}
            </div>
        </section>
    );
}
