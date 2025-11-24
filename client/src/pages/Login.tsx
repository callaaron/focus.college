import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { APP_TITLE } from "@/const";

const demoAccounts = [
  {
    username: 'demo_ceo',
    password: 'demo123',
    name: '张总 (CEO)',
    description: '大型互联网公司CEO，10年管理经验',
    isDemo: true
  },
  {
    username: 'demo_cto',
    password: 'demo123',
    name: '李总 (CTO)',
    description: '技术驱动型CTO，精通技术管理',
    isDemo: true
  },
  {
    username: 'demo_manager',
    password: 'demo123',
    name: '王经理 (产品经理)',
    description: '中层管理者，3年产品管理经验',
    isDemo: true
  },
  {
    username: 'admin',
    password: '123456',
    name: '系统管理员',
    description: '拥有完整管理权限，可管理用户和系统配置',
    isDemo: false
  }
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  // 本地登录
  const localLoginMutation = trpc.auth.localLogin.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      setError(err.message || "登录失败，请检查用户名和密码");
    }
  });

  // 演示账户登录
  const demoLoginMutation = trpc.demoAccounts.login.useMutation({
    onSuccess: () => {
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      setError(err.message || "登录失败，请检查用户名和密码");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    // 判断是admin还是demo账户
    if (username === 'admin') {
      localLoginMutation.mutate({ username, password });
    } else {
      demoLoginMutation.mutate({ username, password });
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setUsername(account.username);
    setPassword(account.password);
    setError("");
    
    if (account.isDemo) {
      demoLoginMutation.mutate({ 
        username: account.username, 
        password: account.password 
      });
    } else {
      localLoginMutation.mutate({ 
        username: account.username, 
        password: account.password 
      });
    }
  };

  const isLoading = localLoginMutation.isPending || demoLoginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{APP_TITLE || "创业进化系统"}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI驱动的创业能力评估与成长平台
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">
              无需注册，选择演示账户即可体验
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>登录</CardTitle>
              <CardDescription>
                使用演示账户登录体验系统
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="demo_ceo"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="demo123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center text-sm text-muted-foreground">
                  还没有账户？{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setLocation('/register')}
                    disabled={isLoading}
                  >
                    立即注册
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>演示账户</CardTitle>
              <CardDescription>
                点击下方账户快速登录体验
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoAccounts.map((account) => (
                <Button
                  key={account.username}
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {account.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        用户名: {account.username} | 密码: {account.password}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
