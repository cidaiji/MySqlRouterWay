const express = require('express');
const sqlWay = require('../Way/SQLway');

const app = express();
const PORT = 610;
let isInitialized = false;

// 初始化数据库连接
async function initializeDatabase() {
    if (!isInitialized) {
        await sqlWay.initialize();
        isInitialized = true;
        console.log('数据库连接已初始化');
    }
}

// 关闭数据库连接（优雅退出时使用）
async function closeDatabase() {
    if (isInitialized) {
        await sqlWay.close();
        isInitialized = false;
        console.log('数据库连接已关闭');
    }
}

// 初始化数据库
initializeDatabase().catch(err => {
    console.error('数据库初始化失败:', err);
    process.exit(1);
});

app.get('/info', async (req, res) => {
    try {
        // 确保数据库已初始化
        if (!isInitialized) {
            throw new Error('数据库连接未初始化');
        }

        const userModule = sqlWay.getModule('userinfo');
        const userDetail = await userModule.userinfo({ userId: 1 });

        res.json(userDetail);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
});
app.get('/login', async (req, res) => {
    try {
        // 确保数据库已初始化
        if (!isInitialized) {
            throw new Error('数据库连接未初始化');
        }

        const userModule = sqlWay.getModule('userinfo');
        const userDetail = await userModule.userinfo({ userId: 1 });

        res.json(userDetail);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
});

// 处理服务器优雅退出
process.on('SIGINT', async () => {
    console.log('接收到退出信号，正在关闭服务器...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('接收到终止信号，正在关闭服务器...');
    await closeDatabase();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});