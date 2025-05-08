import * as dotenv from 'dotenv';

// 根据环境加载不同文件
const loadEnvFile = () => {
  const env = process.env.NODE_ENV || "development";
  dotenv.config({ path: `.env.${env}` });
  dotenv.config({ path: `.env.${env}.local` });
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local" });
};

// 初始化环境变量
loadEnvFile();
