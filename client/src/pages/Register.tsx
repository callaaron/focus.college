import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      // 注册成功后自动跳转到dashboard
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      setError(err.message || "注册失败，请重试");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 验证必填字段
    if (!username || !password || !confirmPassword) {
      setError("请填写所有必填字段");
      return;
    }

    // 验证用户名格式
    if (username.length < 3) {
      setError("用户名至少3位");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("用户名只能包含字母、数字和下划线");
      return;
    }

    // 验证密码
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }

    // 验证密码确认
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // 验证邮箱格式（如果填写了）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    registerMutation.mutate({
      username,
      password,
      email: email || undefined,
      name: name || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{APP_TITLE || "创业进化系统"}</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            创建账户，开启您的能力提升之旅
          </p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>用户注册</CardTitle>
                <CardDescription>
                  填写以下信息创建您的账户
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  用户名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="至少3位，只能包含字母、数字和下划线"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoComplete="username"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="您的真实姓名或昵称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  密码 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少6位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  确认密码 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={registerMutation.isPending}
                  autoComplete="new-password"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    注册账户
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-muted-foreground">
                已有账户？{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => setLocation('/login')}
                  disabled={registerMutation.isPending}
                >
                  立即登录
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>用户名建议使用字母和数字组合，便于记忆</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>密码至少6位，建议包含大小写字母和数字</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>邮箱用于后续找回密码和接收通知（选填）</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            disabled={registerMutation.isPending}
          >
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}
