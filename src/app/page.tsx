"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { Card, CardContent, Typography } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            {language === 'zh' ? 'Gateway管理系统' : 'Gateway Management System'}
          </p>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
        </div>

        <div className={styles.grid}>
          <Card
            className={styles.card}
            onClick={() => handleNavigate('/gateway-mapping')}
            sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}
          >
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {language === 'zh' ? 'Gateway配置' : 'Gateway Configuration'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'zh' 
                  ? '创建和管理Gateway路由配置，包括后端服务器、请求头、Cookies等设置'
                  : 'Create and manage Gateway route configurations, including backend servers, headers, cookies, and more'
                }
              </Typography>
            </CardContent>
          </Card>

          <Card
            className={styles.card}
            onClick={() => handleNavigate('/gateway-search')}
            sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}
          >
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {language === 'zh' ? '配置搜索' : 'Configuration Search'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {language === 'zh' 
                  ? '快速搜索和查看现有的Gateway配置，支持按域名、应用、状态等过滤'
                  : 'Quickly search and view existing Gateway configurations with filtering by domain, application, status, etc.'
                }
              </Typography>
            </CardContent>
          </Card>
        </div>

        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
