import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp, Target, Activity, CheckCircle2,
  ArrowRight, AlertCircle, ChevronRight,
  Award, BookOpen, Zap, Sparkles
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: completion } = trpc.profile.getCompletion.useQuery();
  const { data: competencies, isLoading: competenciesLoading } = trpc.competencies.list.useQuery();
  const { data: userProgress } = trpc.competencies.myProgress.useQuery();

  const mastered = userProgress?.filter(c => c.userProgress?.status === 'mastered').length || 0;
  const learning = userProgress?.filter(c => c.userProgress?.status === 'learning').length || 0;
  const totalCount = competencies?.length || 35;
  const scores = userProgress?.map(c => c.userProgress?.selfAssessed).filter(s => s > 0) || [];
  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  const sizeLabel = (s: string | null | undefined) =>
    s === 'startup' ? '初创' : s === 'small' ? '小型' : s === 'medium' ? '中型' : s === 'large' ? '大型' : '--';

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">欢迎回来，{user?.name || '用户'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">能力发展概览</p>
          </div>
          {!profileLoading && profile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
              <span>{profile.industry || '行业未设'}</span>
              <span className="text-border/50">|</span>
              <span>{profile.currentRole || '岗位未设'}</span>
              <span className="text-border/50">|</span>
              <span>{sizeLabel(profile.companySize)}</span>
              <ChevronRight className="h-3 w-3 ml-0.5 cursor-pointer hover:text-foreground transition-colors" onClick={() => setLocation('/profile')} />
            </div>
          )}
        </div>

        {/* Completion alert */}
        {completion && completion.completionRate < 100 && (
          <Alert className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between text-sm">
              <span>个人信息完善度 <strong className="tabular-nums">{completion.completionRate}%</strong></span>
              <Button variant="outline" size="sm" onClick={() => setLocation('/profile')}>
                去完善 <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stat cards — gradient style from shadcn dashboard */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
          <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">已掌握</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">{mastered}/{totalCount}</div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
              <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                持续积累 <TrendingUp className="size-3.5" />
              </div>
              <div className="text-muted-foreground">核心管理能力</div>
            </CardFooter>
          </Card>

          <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">学习中</p>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">{learning}</div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
              <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                正在提升 <Sparkles className="size-3.5" />
              </div>
              <div className="text-muted-foreground">持续精进中</div>
            </CardFooter>
          </Card>

          <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">平均分</p>
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">{avgScore}</div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
              <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                {avgScore >= 4 ? '表现优异' : avgScore >= 3 ? '稳步提升' : '潜力很大'} <TrendingUp className="size-3.5" />
              </div>
              <div className="text-muted-foreground">满分 5 分</div>
            </CardFooter>
          </Card>

          <Card className="@container/card bg-gradient-to-t from-amber-50/50 to-card dark:from-amber-950/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">完成度</p>
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">{mastered > 0 ? Math.round((mastered / totalCount) * 100) : 0}%</div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 pt-0">
              <Progress value={totalCount > 0 ? Math.round((mastered / totalCount) * 100) : 0} className="h-1.5 w-full" />
              <div className="text-xs text-muted-foreground">{totalCount - mastered} 项待掌握</div>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions + Progress */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="shadow-none lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> 快速操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Button variant="secondary" size="sm" className="w-full justify-between h-9" onClick={() => setLocation('/assessment')}>
                <span className="text-sm">开始初始评估</span> <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-between h-9 text-sm font-normal" onClick={() => setLocation('/competencies')}>
                查看能力看板 <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-between h-9 text-sm font-normal" onClick={() => setLocation('/challenge')}>
                今日挑战 <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">NEW</Badge> <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-between h-9 text-sm font-normal" onClick={() => setLocation('/growth')}>
                成长历程 <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-none lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" /> 能力发展
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competenciesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (<Skeleton key={i} className="h-12 w-full" />))}
                </div>
              ) : (mastered > 0 || learning > 0) ? (
                <div className="space-y-1.5">
                  {userProgress
                    ?.filter(c => c.userProgress?.status === 'mastered' || c.userProgress?.status === 'learning')
                    .slice(0, 6)
                    .map((comp) => (
                      <div key={comp.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${comp.userProgress?.status === 'mastered' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                        <span className="text-sm font-medium flex-1 truncate">{comp.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16">
                            <Progress value={((comp.userProgress?.selfAssessed || 0) / 5) * 100} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground w-6 text-right tabular-nums">
                            {comp.userProgress?.selfAssessed || 0}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {comp.userProgress?.status === 'mastered' ? '已掌握' : '学习中'}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">完成评估后，这里将展示你的能力发展</p>
                  <Button size="sm" onClick={() => setLocation('/assessment')}>开始评估 <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
