'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './thread.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Post {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface Thread {
  id: number;
  title: string;
  post_count: number;
}

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThread();
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000); // 5秒ごとに更新
    return () => clearInterval(interval);
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const response = await axios.get(`${API_URL}/threads/${threadId}`);
      setThread(response.data);
    } catch (error) {
      console.error('Failed to fetch thread:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts/thread/${threadId}`);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoading(false);
    }
  };

  const [autoPosting, setAutoPosting] = useState(false);
  const [userPostContent, setUserPostContent] = useState('');
  const [userName, setUserName] = useState('');
  const [posting, setPosting] = useState(false);

  // 20秒ごとに自動投稿
  useEffect(() => {
    if (!threadId) return;

    const autoPostInterval = setInterval(async () => {
      if (!autoPosting) {
        setAutoPosting(true);
        try {
          await axios.post(`${API_URL}/posts/generate-single/${threadId}`);
          fetchPosts();
        } catch (error) {
          console.error('Auto post failed:', error);
        } finally {
          setAutoPosting(false);
        }
      }
    }, 20000); // 20秒ごと

    return () => clearInterval(autoPostInterval);
  }, [threadId, autoPosting]);

  // ユーザー投稿
  const handleUserPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPostContent.trim() || posting) return;

    setPosting(true);
    try {
      await axios.post(`${API_URL}/posts/user/${threadId}`, {
        content: userPostContent,
        authorName: userName.trim() || '風吹けば名無し'
      });
      setUserPostContent('');
      fetchPosts();
    } catch (error) {
      console.error('Failed to post:', error);
      alert('投稿に失敗しました');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/">← 板に戻る</Link>
      </div>

      {thread && (
        <div className={styles.threadHeader}>
          <h1>{thread.title}</h1>
        </div>
      )}

      <div className={styles.posts}>
        {posts.map((post, index) => (
          <div key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <span className={styles.postNumber}>{index + 1}</span>
              <span className={styles.postAuthor}>{post.author_name}</span>
              <span className={styles.postDate}>
                {new Date(post.created_at).toLocaleString('ja-JP')}
              </span>
            </div>
            <div className={styles.postContent}>{post.content}</div>
          </div>
        ))}
      </div>

      <div className={styles.postForm}>
        <h3>💬 会話に参加する</h3>
        <form onSubmit={handleUserPost}>
          <textarea
            value={userPostContent}
            onChange={(e) => setUserPostContent(e.target.value)}
            placeholder="死者たちの会話に紛れ込む..."
            className={styles.postTextarea}
            rows={3}
            disabled={posting}
          />
          <div className={styles.postFormActions}>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="名前（省略可）"
              className={styles.nameInput}
              disabled={posting}
            />
            <button 
              type="submit" 
              disabled={posting || !userPostContent.trim()}
              className={styles.postButton}
            >
              {posting ? '投稿中...' : '💀 投稿する'}
            </button>
          </div>
        </form>
        <p className={styles.autoPostInfo}>
          💀 死者たちが20秒ごとに勝手に会話を続けています...
        </p>
      </div>
    </div>
  );
}
