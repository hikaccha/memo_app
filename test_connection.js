//detabeseの接続確認用
const pool = require('./db/connection');

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('データベース接続成功！');
        client.release();
    } catch (err) {
        console.error('データベース接続エラー:', err);
    } finally {
        //プールを終了
        await pool.end();
    }
}

testConnection();