import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageSkeleton from "@/components/PageSkeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Layers, Activity } from "lucide-react";
import { useLocation } from "wouter";
import PageContainer from "@/components/PageContainer";

export default function AdminQuestions() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: questions, isLoading } = trpc.questions.getAll.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  const { data: stats } = trpc.questions.getStatistics.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const avgUsage = stats && stats.length > 0
    ? Math.round(stats.reduce((sum: number, s: any) => sum + (s.avgUsageCount || 0), 0) / stats.length)
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSkeleton />
      </DashboardLayout>
    );
  }

  const statsCards = [
    {
      title: "总题目数",
      value: questions?.length || 0,
      icon: FileQuestion,
      tone: "from-primary/5 dark:from-primary/10",
      iconColor: "text-emerald-500",
      footerLabel: "题库总量",
      footerAccent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "涵盖能力",
      value: stats?.length || 0,
      icon: Layers,
      tone: "from-blue-50/50 dark:from-blue-950/30",
      iconColor: "text-blue-500",
      footerLabel: "关联能力域",
      footerAccent: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "平均使用次数",
      value: avgUsage,
      icon: Activity,
      tone: "from-purple-50/50 dark:from-purple-950/30",
      iconColor: "text-purple-500",
      footerLabel: "每题平均",
      footerAccent: "text-purple-600 dark:text-purple-400",
    },
  ];
  
  return (
    <DashboardLayout>
      <PageContainer
        pageTitle="题库管理"
        pageDescription="管理评估问卷题目"
        pageHeaderAction={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回管理后台
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 *:data-[slot=card]:shadow-xs">
            {statsCards.map((s) => (
              <Card key={s.title} className={`@container/card bg-gradient-to-t ${s.tone}`}>
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
          
          <Card>
            <CardHeader>
              <CardTitle>所有题目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions?.map((q: any) => (
                  <div key={q.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {q.questionType === 'self_assessment' ? '自我评估' :
                             q.questionType === 'scenario' ? '情景题' :
                             q.questionType === 'behavioral' ? '行为题' : '知识题'}
                          </Badge>
                          <Badge variant={
                            q.difficulty === 'easy' ? 'secondary' :
                            q.difficulty === 'medium' ? 'default' : 'destructive'
                          }>
                            {q.difficulty === 'easy' ? '简单' :
                             q.difficulty === 'medium' ? '中等' : '困难'}
                          </Badge>
                          {!q.isActive && (
                            <Badge variant="outline">已禁用</Badge>
                          )}
                        </div>
                        <p className="font-medium mb-2">{q.question}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>使用次数: {q.usageCount || 0}</div>
                          <div>目标等级: L{q.targetLevel}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1 pl-4 border-l-2">
                      <div>1. {q.option1} ({q.score1}分)</div>
                      <div>2. {q.option2} ({q.score2}分)</div>
                      <div>3. {q.option3} ({q.score3}分)</div>
                      <div>4. {q.option4} ({q.score4}分)</div>
                      <div>5. {q.option5} ({q.score5}分)</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
