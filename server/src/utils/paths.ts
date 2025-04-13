import path from "path";
import fs from "fs";

// 获取安全的存储目录路径（适用于打包环境）
export function getStorageDir(dirName: string) {
    // 判断是否在打包环境中
    // @ts-ignore
    const isPackaged = typeof process.pkg !== 'undefined';

    // 打包环境：使用可执行文件所在目录
    // 开发环境：使用项目根目录下的 storage 目录
    return isPackaged
        ? path.join(path.dirname(process.execPath), 'storage', dirName)
        : path.join(__dirname, '..', 'storage', dirName);
}

// 创建目录（如果不存在）
export function ensureDirExists(dirPath: string) {
    const paths = getStorageDir(dirPath);
    if (!fs.existsSync(paths)) {
        fs.mkdirSync(paths, { recursive: true, mode: 0o755 });
        console.log(`已创建目录: ${paths}`);
    }
}