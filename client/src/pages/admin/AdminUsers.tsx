import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageSkeleton from "@/components/PageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import PageContainer from "@/components/PageContainer";

export default function AdminUsers() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <PageContainer
        pageTitle="用户管理"
        pageDescription="查看和管理系统用户"
        pageHeaderAction={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回管理后台
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>所有用户 ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users?.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{u.name || '未命名用户'}</h3>
                      {u.role === 'admin' && (
                        <Badge variant="destructive">管理员</Badge>
                      )}
                      {u.isDemo && (
                        <Badge variant="secondary">演示账户</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {u.email && <div>邮箱: {u.email}</div>}
                      {u.demoRole && <div>角色: {u.demoRole}</div>}
                      <div>注册时间: {new Date(u.createdAt).toLocaleString('zh-CN')}</div>
                      <div>最后登录: {new Date(u.lastSignedIn).toLocaleString('zh-CN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
}
