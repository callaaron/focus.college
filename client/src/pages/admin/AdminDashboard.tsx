import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileQuestion, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: stats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            您没有权限访问管理员后台。请使用管理员账号登录。
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">管理员后台</h1>
            <p className="text-muted-foreground mt-2">
              系统管理和数据统计
            </p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/admin/users')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  系统注册用户
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">能力总数</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCompetencies || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  能力库条目
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/admin/questions')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">题库数量</CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">11</div>
                <p className="text-xs text-muted-foreground mt-1">
                  评估问卷题目
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">评估次数</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAssessments || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  总评估会话数
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Users className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">用户管理</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    查看和管理系统用户
                  </p>
                </button>
                
                <button
                  onClick={() => navigate('/admin/questions')}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <FileQuestion className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">题库管理</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    管理评估问卷题目
                  </p>
                </button>
                
                <button
                  onClick={() => navigate('/admin/competencies')}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">能力库管理</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    管理能力定义和标准
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
