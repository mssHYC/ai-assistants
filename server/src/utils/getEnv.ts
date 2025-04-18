import { z } from "zod";

const envSchema = z.object({
  // 基础配置
  NODE_ENV: z
    .enum(["development", "test", "production", "docker"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  API_KEY: z.string(),
  PUPPETEER_EXECUTABLE_PATH: z.string(),
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: z.string(),
  //   API_PREFIX: z.string().default('/api'),

  // 数据库配置
  //   DB_HOST: z.string(),
  //   DB_PORT: z.coerce.number().default(5432),
  //   DB_NAME: z.string(),
  //   DB_USER: z.string(),
  //   DB_PASSWORD: z.string(),

  // 安全配置
  //   JWT_SECRET: z.string().optional(),

  // 可选配置
  //   CORS_ORIGIN: z.string().optional(),
  //   LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// 验证配置
export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig;

export const getConfig = (): EnvConfig => {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }
  return cachedEnv;
};

// 运行时快速访问
export const config = getConfig();
