import mysql from 'mysql2/promise';
import 'dotenv/config';

const demoAccounts = [
  {
    username: 'demo_ceo',
    password: 'demo123',
    name: '张总 (CEO)',
    role: 'CEO',
    description: '大型互联网公司CEO，10年管理经验，战略规划能力突出'
  },
  {
    username: 'demo_cto',
    password: 'demo123',
    name: '李总 (CTO)',
    role: 'CTO',
    description: '技术驱动型CTO，精通技术管理和团队建设'
  },
  {
    username: 'demo_manager',
    password: 'demo123',
    name: '王经理 (产品经理)',
    role: '产品经理',
    description: '中层管理者，3年产品管理经验，擅长需求分析'
  }
];

async function initDemoAccounts() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('开始初始化演示账户数据...\n');

    // 清空现有演示账户
    await connection.execute('DELETE FROM demoAccounts');
    console.log('✓ 清空现有演示账户');

    // 插入演示账户
    for (const account of demoAccounts) {
      await connection.execute(
        `INSERT INTO demoAccounts (username, password, displayName, role, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [account.username, account.password, account.name, account.role, account.description]
      );
      console.log(`✓ 创建演示账户: ${account.name} (用户名: ${account.username})`);
    }

    console.log(`\n✅ 演示账户初始化完成！共创建 ${demoAccounts.length} 个账户`);
    console.log('\n演示账户登录信息：');
    console.log('━'.repeat(60));
    demoAccounts.forEach(account => {
      console.log(`用户名: ${account.username}`);
      console.log(`密码: ${account.password}`);
      console.log(`角色: ${account.name}`);
      console.log('─'.repeat(60));
    });

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initDemoAccounts().catch(console.error);
