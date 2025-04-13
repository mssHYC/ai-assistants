import puppeteer from "puppeteer";

// 动态路径解析
const getChromePath = () => {
    //@ts-ignore
    if (process.pkg) { // 打包环境
        return process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    if (process.env.NODE_ENV === 'docker') {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    return puppeteer.executablePath(); // 开发环境
};

const isDebug = process.env.DEBUG === 'true';

class Browser {
    static async create() {
        return await puppeteer.launch({
            executablePath: getChromePath(),
            headless: isDebug ? false : "shell",        // 无头模式
            args: ['--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'] // 服务器环境需要
        });
    }
}

export default Browser