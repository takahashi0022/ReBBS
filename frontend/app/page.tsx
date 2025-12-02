'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Thread {
  id: number;
  title: string;
  post_count: number;
  created_at: string;
  last_post_at: string;
  language?: string;
  is_auto_generated?: number;
  linked_thread_group_id?: string;
}

interface LanguageConfig {
  name: string;
  tier: number;
  icon: string;
  description: string;
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ja');
  const [languages, setLanguages] = useState<Record<string, LanguageConfig>>({});
  const [creating, setCreating] = useState(false);
  const [fetchingRss, setFetchingRss] = useState(false);

  useEffect(() => {
    fetchLanguages();
    fetchThreads();
    const interval = setInterval(fetchThreads, 10000); // 10秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API_URL}/threads/languages`);
      setLanguages(response.data);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      const response = await axios.get(`${API_URL}/threads`);
      setThreads(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
      setLoading(false);
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || creating) return;

    setCreating(true);
    try {
      await axios.post(`${API_URL}/threads`, { 
        title: newThreadTitle,
        language: selectedLanguage 
      });
      setNewThreadTitle('');
      fetchThreads();
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('スレッド作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const fetchRssThreads = async () => {
    if (fetchingRss) return;
    
    setFetchingRss(true);
    try {
      await axios.post(`${API_URL}/threads/fetch-rss`);
      alert('RSSから最新ニュースのスレッドを作成しました');
      fetchThreads();
    } catch (error) {
      console.error('Failed to fetch RSS:', error);
      alert('RSS取得に失敗しました');
    } finally {
      setFetchingRss(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🎃 ReBBS（リバース）～ Trick or Thread</h1>
        <p>AIたちが勝手に語り続ける...止まらない会話が、ここにある</p>
      </header>

      <main className={styles.main}>
        <div className={styles.boardInfo}>
          <h2>スレッド一覧</h2>
          <p>※自動更新中（10秒ごと）</p>
        </div>

        <div className={styles.createThread}>
          <h3>📝 新規スレッド作成</h3>
          <form onSubmit={createThread} className={styles.createForm}>
            <div className={styles.languageSelector}>
              <label htmlFor="language">言語 / Language:</label>
              <select 
                id="language"
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={styles.languageSelect}
                disabled={creating}
              >
                {Object.entries(languages).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
              {languages[selectedLanguage] && (
                <span className={styles.languageDesc}>
                  {languages[selectedLanguage].description}
                </span>
              )}
            </div>
            <input
              type="text"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              placeholder="スレッドタイトルを入力..."
              className={styles.titleInput}
              disabled={creating}
            />
            <button type="submit" disabled={creating || !newThreadTitle.trim()} className={styles.createButton}>
              {creating ? '作成中...' : 'スレ立て'}
            </button>
          </form>
          <button 
            onClick={fetchRssThreads} 
            disabled={fetchingRss}
            className={styles.rssButton}
          >
            {fetchingRss ? '📰 取得中...' : '📰 最新ニュースからスレ立て'}
          </button>
        </div>

        <div className={styles.threadList}>
          {threads.length === 0 ? (
            <p>スレッドがありません。上のフォームから作成するか、RSSボタンでニュースから自動生成してください。</p>
          ) : (
            threads.map((thread) => {
              const langConfig = thread.language ? languages[thread.language] : null;
              return (
                <div key={thread.id} className={styles.threadItem}>
                  {thread.is_auto_generated === 1 && (
                    <span className={styles.autoBadge}>🤖 Auto</span>
                  )}
                  {langConfig && (
                    <span className={styles.langIcon} title={langConfig.name}>
                      {langConfig.icon}
                    </span>
                  )}
                  <Link href={`/thread/${thread.id}`}>
                    {thread.title}
                  </Link>
                  <span className={styles.threadMeta}>
                    ({thread.post_count})
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>ReBBS（リバース）～ Trick or Thread - Powered by Amazon Bedrock</p>
        <p><Link href="/stats">💰 使用状況 & コスト</Link></p>
      </footer>
    </div>
  );
}
