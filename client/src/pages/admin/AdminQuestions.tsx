import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageTransition from "@/components/PageTransition";
import PageSkeleton from "@/components/PageSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminQuestions() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: questions, isLoading } = trpc.questions.getAll.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  const { data: stats } = trpc.questions.getStatistics.useQuery(undefined, {
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
      <PageTransition>
        <div className="space-y-6">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回管理后台
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">题库管理</h1>
            <p className="text-muted-foreground mt-2">
              管理评估问卷题目
            </p>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">总题目数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{questions?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">涵盖能力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">平均使用次数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.length > 0 
                    ? Math.round(stats.reduce((sum: number, s: any) => sum + (s.avgUsageCount || 0), 0) / stats.length)
                    : 0}
                </div>
              </CardContent>
            </Card>
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
      </PageTransition>
    </DashboardLayout>
  );
}
