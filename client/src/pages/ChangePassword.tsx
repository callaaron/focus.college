import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      
      // 3秒后跳转到个人资料页
      setTimeout(() => {
        setLocation('/profile');
      }, 3000);
    },
    onError: (err) => {
      setError(err.message || "修改密码失败");
      setSuccess(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    if (newPassword.length < 6) {
      setError("新密码至少需要6位");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }

    if (currentPassword === newPassword) {
      setError("新密码不能与当前密码相同");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">修改密码</h1>
          <p className="text-muted-foreground mt-2">
            为了账户安全，建议定期修改密码
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>修改登录密码</CardTitle>
                <CardDescription>
                  请输入当前密码和新密码
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    密码修改成功！3秒后自动跳转...
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending || success}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      修改中...
                    </>
                  ) : (
                    "确认修改"
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/profile')}
                  disabled={changePasswordMutation.isPending}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">密码安全提示：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>密码长度至少6位</li>
                <li>建议包含大小写字母、数字和特殊字符</li>
                <li>不要使用过于简单的密码（如123456）</li>
                <li>定期更换密码以保证账户安全</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
