import { z } from "zod";

// 根据环境加载不同文件
const loadEnvFile = () => {
  const env = process.env.NODE_ENV || "development";
  require("dotenv").config({ path: `.env.${env}` });
  require("dotenv").config({ path: `.env.${env}.local` });
  require("dotenv").config({ path: ".env" });
  require("dotenv").config({ path: ".env.local" });
};

// 初始化环境变量
loadEnvFile();
