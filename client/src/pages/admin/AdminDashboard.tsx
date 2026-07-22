import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, FileQuestion, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import PageContainer from "@/components/PageContainer";

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

  const statsCards = [
    {
      title: "总用户数",
      value: stats?.totalUsers || 0,
      icon: Users,
      tone: "from-primary/5 dark:from-primary/10",
      iconColor: "text-emerald-500",
      footerLabel: "系统注册用户",
      footerAccent: "text-emerald-600 dark:text-emerald-400",
      onClick: () => navigate('/admin/users'),
    },
    {
      title: "能力总数",
      value: stats?.totalCompetencies || 0,
      icon: BookOpen,
      tone: "from-blue-50/50 dark:from-blue-950/30",
      iconColor: "text-blue-500",
      footerLabel: "能力库条目",
      footerAccent: "text-blue-600 dark:text-blue-400",
      onClick: undefined,
    },
    {
      title: "题库数量",
      value: 11,
      icon: FileQuestion,
      tone: "from-purple-50/50 dark:from-purple-950/30",
      iconColor: "text-purple-500",
      footerLabel: "评估问卷题目",
      footerAccent: "text-purple-600 dark:text-purple-400",
      onClick: () => navigate('/admin/questions'),
    },
    {
      title: "评估次数",
      value: stats?.totalAssessments || 0,
      icon: TrendingUp,
      tone: "from-amber-50/50 dark:from-amber-950/30",
      iconColor: "text-amber-500",
      footerLabel: "总评估会话数",
      footerAccent: "text-amber-600 dark:text-amber-400",
      onClick: undefined,
    },
  ];
  
  return (
    <DashboardLayout>
      <PageContainer pageTitle="管理员后台" pageDescription="系统管理和数据统计">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
            {statsCards.map((s) => (
              <Card
                key={s.title}
                className={`@container/card bg-gradient-to-t ${s.tone} ${s.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={s.onClick}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.title}</p>
                    <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                  </div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                  <div className={`line-clamp-1 flex gap-1.5 font-medium ${s.footerAccent}`}>
                    {s.footerLabel} <s.icon className="size-3.5" />
                  </div>
                </CardFooter>
              </Card>
            ))}
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
                  className="group flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div>
                    <Users className="h-6 w-6 mb-2 text-emerald-500" />
                    <h3 className="font-semibold">用户管理</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      查看和管理系统用户
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/admin/questions')}
                  className="group flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div>
                    <FileQuestion className="h-6 w-6 mb-2 text-purple-500" />
                    <h3 className="font-semibold">题库管理</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      管理评估问卷题目
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => navigate('/admin/competencies')}
                  className="group flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div>
                    <BookOpen className="h-6 w-6 mb-2 text-blue-500" />
                    <h3 className="font-semibold">能力库管理</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      管理能力定义和标准
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
