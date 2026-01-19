import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, X, Home, CheckSquare, ClipboardList, Settings } from 'lucide-react';
import { useTranslation } from '../i18n';

function buildGuideContent(lang) {
  const en = [
    {
      category: '0. Getting Started',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'signup',
          title: 'Sign Up / Create Account',
          description: 'Create a teacher account and your first class.',
          content: `### Create a Teacher Account
Use the **Get Started Free** button on the landing page to create your teacher account.

- You will be asked for your name, email, and a password.
- After creating an account, your classes will be saved to the cloud.

[Create an account](#action:signup)`
        },
        {
          id: 'login',
          title: 'Login',
          description: 'How to sign in and access your classroom.',
          content: `### Login
Click **Login** on the landing page, enter your email and password, and you will return to your Teacher Portal.

[Open Login](#action:login)`
        }
      ]
    },
    {
      category: '1. Navigation & Home',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'home-portal',
          title: 'The Home Portal',
          description: 'How to switch classes and save data.',
          content: `### Returning Home
The **Home Icon** (the very top icon) is your way back to the main class selection screen.

- **Auto-Save:** You never need to look for a "Save" button before leaving. The moment you click Home, your points, attendance, and student updates are synced to the cloud.
- **Switching Classes:** Use this to jump between your Morning and Afternoon sessions.

[Return to Home Portal](#action:home)`
        }
      ]
    },
    {
      category: '2. Daily Tools',
      icon: <CheckSquare size={18} />,
      topics: [
        {
          id: 'attendance-logic',
          title: 'Taking Attendance',
          description: 'Absent vs Tardy and its effects.',
          content: `### Smart Attendance
Click the **Checkmark icon** to toggle attendance mode.

- **Tap Once:** Turns the student Red (**Absent**).
- **Tap Twice:** Turns the student Yellow (**Tardy**).
- **The "Smart" Part:** Students marked **Absent** are automatically excluded from the Lucky Draw and Whole Class rewards.

[Mark Attendance](#action:attendance)`
        }
      ]
    },
    {
      category: '5. Assignments & Grading',
      icon: <ClipboardList size={18} />,
      topics: [
        {
          id: 'assignments-create',
          title: 'Creating Assignments',
          description: 'Digital worksheets and tasks.',
          content: `### Digital Work
Click the **Clipboard icon** to create a new task.

- **Question Creator:** Add Multiple Choice, True/False, or Open-Ended questions.
- **Images:** You can attach a photo to any question.
- **The Inbox:** When students submit work, a red badge will appear on the **Inbox icon**. Click it to grade their work and give feedback.

`
        }
      ]
    },
    {
      category: '6. Settings & Customization',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'manage-students',
          title: 'Editing & Deleting Students',
          description: 'Fixing names and updating avatars.',
          content: `### Class Management
Go to **Settings** and select the **Students** tab.

- **Edit Name:** Click the Pencil icon to fix a typo.
- **Change Avatar:** Switch a student's character at any time.
- **Delete Student:** Click the Red Trash icon to remove a student from the class permanently. (Careful: This also deletes their point history!)

`
        }
      ]
    }
  ];

  const zh = [
    {
      category: '0. 快速开始',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'signup',
          title: '注册 / 创建账号',
          description: '创建教师账号并建立第一个班级。',
          content: `### 创建教师账号
在登录页点击 **免费注册** 创建您的教师账号。

- 系统会要求您填写姓名、邮箱和密码。
- 创建账号后，您的班级会保存到云端。

[创建账号](#action:signup)`
        },
        {
          id: 'login',
          title: '登录',
          description: '如何登录并进入您的课堂。',
          content: `### 登录
点击登录，输入邮箱与密码，即可进入教师门户。

[打开登录](#action:login)`
        }
      ]
    },
    {
      category: '1. 导航与主页',
      icon: <Home size={18} />,
      topics: [
        {
          id: 'home-portal',
          title: '主页面板',
          description: '如何切换班级与保存数据。',
          content: `### 返回主页
顶部的 **主页图标** 可以返回班级选择页面。

- **自动保存：** 无需手动保存，系统会自动同步您的更改。
- **切换班级：** 使用主页快速在不同班级之间切换。

[返回主页](#action:home)`
        }
      ]
    },
    {
      category: '2. 日常工具',
      icon: <CheckSquare size={18} />,
      topics: [
        {
          id: 'attendance-logic',
          title: '记考勤',
          description: '缺勤与迟到及其影响。',
          content: `### 智能考勤
点击 **勾选图标** 切换考勤模式。

- **单击一次：** 标记为缺勤（红色）。
- **再点一次：** 标记为迟到（黄色）。
- **智能规则：** 被标记为缺勤的学生将不会参与抽奖或全班奖励。

[标记考勤](#action:attendance)`
        }
      ]
    },
    {
      category: '5. 作业与评分',
      icon: <ClipboardList size={18} />,
      topics: [
        {
          id: 'assignments-create',
          title: '创建作业',
          description: '数字作业与任务。',
          content: `### 数字作业
点击 **剪贴板图标** 创建新任务。

- **题目类型：** 支持选择题、判断题与问答题。
- **图片：** 可以为题目上传图片。
- **收件箱：** 学生提交作业后，收件箱图标上会出现红点，点击进入批改并留言。

`
        }
      ]
    },
    {
      category: '6. 设置与自定义',
      icon: <Settings size={18} />,
      topics: [
        {
          id: 'manage-students',
          title: '编辑与删除学生',
          description: '修改名字与头像。',
          content: `### 班级管理
进入 **设置** 页面并选择 **学生** 标签。

- **编辑姓名：** 点击铅笔图标修改。
- **更换头像：** 随时替换学生角色。
- **删除学生：** 点击红色垃圾桶删除学生（删除会清除该学生的积分记录）。

`
        }
      ]
    }
  ];

  return lang === 'zh' ? zh : en;
}

export default function SearchableGuide({ onClose, onTriggerAction }) {
  const { t, lang } = useTranslation();
  const GUIDE_CONTENT = useMemo(() => buildGuideContent(lang), [lang]);
  const [search, setSearch] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(() => {
    // default to first available topic id
    return (GUIDE_CONTENT && GUIDE_CONTENT[0] && GUIDE_CONTENT[0].topics[0] && GUIDE_CONTENT[0].topics[0].id) || 'signup';
  });

  const handleLinkClick = (e) => {
    const href = e.target && e.target.getAttribute && e.target.getAttribute('href');
    if (href?.startsWith('#action:')) {
      e.preventDefault();
      const action = href.split(':')[1];
      onTriggerAction && onTriggerAction(action);
    }
  };

  const filteredData = useMemo(() => {
    const term = (search || '').toLowerCase();
    return GUIDE_CONTENT.map(cat => ({
      ...cat,
      topics: cat.topics.filter(tp => {
        const hay = `${tp.title} ${tp.description} ${tp.content}`.toLowerCase();
        return !term || hay.includes(term);
      })
    })).filter(cat => cat.topics.length > 0);
  }, [search, GUIDE_CONTENT]);

  const activeTopic = useMemo(() => {
    for (const cat of GUIDE_CONTENT) {
      const found = cat.topics.find(t => t.id === activeTopicId);
      if (found) return found;
    }
    // fallback
    return (GUIDE_CONTENT && GUIDE_CONTENT[0] && GUIDE_CONTENT[0].topics[0]) || { title: '', description: '', content: '' };
  }, [activeTopicId, GUIDE_CONTENT]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.sidebar}>
          <div style={styles.searchHeader}>
            <Search size={18} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder={t('search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={styles.navScroll}>
            {filteredData.map((cat, idx) => (
              <div key={idx} style={{ marginBottom: '25px' }}>
                <div style={styles.catLabel}>{cat.icon} {cat.category}</div>
                {cat.topics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    style={{
                      ...styles.navItem,
                      backgroundColor: activeTopicId === topic.id ? '#F1F5F9' : 'transparent',
                      color: activeTopicId === topic.id ? '#4F46E5' : '#64748B'
                    }}
                  >
                    {topic.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.mainView}>
          <button onClick={onClose} style={styles.closeX}><X size={20} /></button>
          <div style={styles.article}>
            <span style={styles.articleBadge}>{t('guide.badge')}</span>
            <h1 style={styles.articleTitle}>{activeTopic.title}</h1>
            <p style={styles.articleDesc}>{activeTopic.description}</p>
            <div style={styles.articleDivider} />
            <div className="markdown-body">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => {
                    const isAction = props.href?.startsWith('#action:');
                    return (
                      <a
                        {...props}
                        onClick={e => {
                          if (isAction) {
                            e.preventDefault();
                            const action = props.href.split(':')[1];
                            if (onTriggerAction) {
                              onTriggerAction(action);
                            } else {
                              // Fallback: show alert for debugging
                              window.alert('Action link clicked: ' + action);
                            }
                          }
                        }}
                        style={isAction ? { cursor: 'pointer' } : undefined}
                      >
                        {props.children}
                      </a>
                    );
                  }
                }}
              >
                {activeTopic.content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>

      <style>{` 
        .markdown-body h3 { font-size: 20px; color: #0F172A; margin: 28px 0 12px; font-weight: 800; }
        .markdown-body p { font-size: 16px; color: #475569; line-height: 1.7; margin-bottom: 16px; }
        .markdown-body ul { padding-left: 20px; margin-bottom: 20px; }
        .markdown-body li { color: #475569; margin-bottom: 10px; }
        .markdown-body a { 
           display: inline-flex; align-items: center; gap: 8px;
           background: #4F46E5; color: white; padding: 10px 20px; 
           border-radius: 12px; text-decoration: none; font-weight: 700;
           font-size: 14px; margin-top: 15px; transition: transform 0.2s;
        }
        .markdown-body a:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3); }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  modal: { width: '100%', maxWidth: '1100px', height: '80vh', background: '#fff', borderRadius: '32px', display: 'flex', overflow: 'hidden', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)' },
  sidebar: { width: '320px', background: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' },
  searchHeader: { padding: '30px 24px 20px', position: 'relative' },
  searchIcon: { position: 'absolute', left: '38px', top: '44px', color: '#94A3B8' },
  searchInput: { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', fontWeight: '500' },
  navScroll: { flex: 1, overflowY: 'auto', padding: '0 24px 30px' },
  catLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' },
  navItem: { padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '4px', transition: '0.2s' },
  mainView: { flex: 1, padding: '60px', overflowY: 'auto', position: 'relative' },
  closeX: { position: 'absolute', top: '30px', right: '30px', background: '#F1F5F9', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' },
  article: { maxWidth: '650px', margin: '0 auto' },
  articleBadge: { background: '#EEF2FF', color: '#4F46E5', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' },
  articleTitle: { fontSize: '42px', fontWeight: '900', color: '#0F172A', margin: '15px 0 10px' },
  articleDesc: { fontSize: '20px', color: '#64748B', lineHeight: '1.4' },
  articleDivider: { height: '1px', background: '#E2E8F0', margin: '35px 0' }
};
