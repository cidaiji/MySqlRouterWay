const express = require('express');
const sqlWay = require('../Way/SQLway');

const app = express();
const PORT = 611;

// Middleware for JSON parsing
app.use(express.json());

// 初始化SQLWAY并处理错误的通用函数
async function initializeAndHandleError() {
    try {
        if (!sqlWay.isInitialized) {
            await sqlWay.initialize();
            sqlWay.isInitialized = true;
            console.log('SQLWAY initialized successfully');
        }
    } catch (error) {
        console.error('SQLWAY initialization error:', error.message);
        throw { status: 500, message: 'Database initialization failed' };
    }
}

// 通用响应处理函数
function handleResponse(res, data, status = 200, cacheMaxAge = 0) {
    if (cacheMaxAge > 0) {
        res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}`);
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json({
        success: true,
        data,
        timestamp: new Date().toISOString()
    });
}

// 通用错误处理函数
function handleError(res, error, message = 'Internal server error') {
    const status = error.status || 500;
    const errorMessage = error.message || message;

    console.error(`API Error (${status}):`, errorMessage);
    res.status(status).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
    });
}

// 健康检查端点
app.get('/health', (req, res) => {
    handleResponse(res, {
        status: 'ok',
        initialized: sqlWay.isInitialized,
        uptime: process.uptime()
    });
});

// 用户信息端点
app.get('/user/:userId', async (req, res) => {
    try {
        await initializeAndHandleError();

        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            throw { status: 400, message: 'Invalid user ID format' };
        }

        const userDetail = await sqlWay.getModule('userinfo').userinfo({ userId });
        handleResponse(res, userDetail, 200, 300); // 缓存5分钟
    } catch (error) {
        handleError(res, error);
    }
});

// 通用SQL执行端点
app.post('/query/:module/:method', async (req, res) => {
    try {
        await initializeAndHandleError();

        const { module: moduleName, method: methodName } = req.params;
        const params = req.body;

        const module = sqlWay.getModule(moduleName);
        if (!module[methodName]) {
            throw { status: 404, message: `Method ${methodName} not found in module ${moduleName}` };
        }

        const results = await module[methodName](params);
        handleResponse(res, results);
    } catch (error) {
        handleError(res, error);
    }
});

// 原生SQL执行端点
app.post('/sql', async (req, res) => {
    try {
        await initializeAndHandleError();

        const { sql, params = {} } = req.body;
        if (!sql) {
            throw { status: 400, message: 'SQL query is required' };
        }

        const results = await sqlWay.execute(sql, params);
        handleResponse(res, results);
    } catch (error) {
        handleError(res, error);
    }
});

// 缓存管理端点
app.delete('/cache', async (req, res) => {
    try {
        await initializeAndHandleError();
        await sqlWay.clearCache();
        handleResponse(res, { message: 'Cache cleared successfully' });
    } catch (error) {
        handleError(res, error);
    }
});

// 列出可用模块
app.get('/modules', async (req, res) => {
    try {
        await initializeAndHandleError();

        const modules = {};
        for (const [name, module] of sqlWay.modules) {
            modules[name] = Object.keys(module);
        }

        handleResponse(res, modules);
    } catch (error) {
        handleError(res, error);
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    handleError(res, error);
});

// 404处理
app.use((req, res) => {
    handleError(res, { status: 404, message: 'Endpoint not found' }, 'Endpoint not found');
});

// 优雅关闭处理
async function shutdown(signal) {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
        if (sqlWay.isInitialized) {
            await sqlWay.close();
            console.log('SQLWAY closed successfully');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// 启动服务器
app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);

    try {
        await initializeAndHandleError();
        console.log('Server ready to handle requests');
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
});

module.exports = app;