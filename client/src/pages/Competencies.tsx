import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Target,
  ChevronRight,
  Award,
  Layers,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import PageContainer from "@/components/PageContainer";

export default function Competencies() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radarView, setRadarView] = useState<'both' | 'user' | 'industry'>('both');

  // Fetch all competencies with user progress
  const { data: competenciesWithProgress, isLoading: competenciesLoading } = trpc.competencies.myProgress.useQuery();

  // Fetch industry comparison data
  const { data: comparison, isLoading: comparisonLoading } = trpc.competencies.getIndustryComparison.useQuery();

  const isLoading = competenciesLoading || comparisonLoading;

  // Group competencies by category
  const competenciesByCategory = competenciesWithProgress?.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof competenciesWithProgress>);

  // Calculate category averages
  const categoryAverages = Object.entries(competenciesByCategory || {}).map(([category, comps]) => {
    const totalScore = comps.reduce((sum, c) => sum + (c.userProgress.selfAssessmentScore || 0) * 20, 0);
    const avgScore = comps.length > 0 ? totalScore / comps.length : 0;

    return {
      category,
      score: Math.round(avgScore),
      count: comps.length,
      mastered: comps.filter(c => c.userProgress.status === 'mastered').length,
      learning: comps.filter(c => c.userProgress.status === 'learning').length,
    };
  });

  // Prepare radar chart data (combining user scores and industry average)
  const radarData = categoryAverages.map(cat => {
    const industryData = comparison?.industryScores.find(is => is.category === cat.category);
    return {
      category: cat.category,
      您的得分: cat.score,
      行业平均: industryData?.score || 0,
    };
  });

  // Calculate overall stats
  const totalCompetencies = competenciesWithProgress?.length || 0;
  const masteredCount = competenciesWithProgress?.filter(c => c.userProgress.status === 'mastered').length || 0;
  const learningCount = competenciesWithProgress?.filter(c => c.userProgress.status === 'learning').length || 0;
  const notStartedCount = totalCompetencies - masteredCount - learningCount;

  const overallCompletion = totalCompetencies > 0 ? Math.round((masteredCount / totalCompetencies) * 100) : 0;

  // Get level label
  const getLevelLabel = (level: number) => {
    const labels = ['未掌握', 'L1-基础', 'L2-熟练', 'L3-精通', 'L4-专家', 'L5-大师'];
    return labels[level] || '未掌握';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap = {
      mastered: { label: '已掌握', variant: 'default' as const },
      learning: { label: '学习中', variant: 'secondary' as const },
      not_started: { label: '未开始', variant: 'outline' as const },
    };
    const s = statusMap[status as keyof typeof statusMap] || statusMap.not_started;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <PageContainer isLoading={isLoading} pageTitle="能力看板" pageDescription="全面了解您的管理能力现状和发展方向">
        <div className="space-y-5">
          {/* Stats Cards — gradient style */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
            <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">总能力数</p>
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums">{totalCompetencies}</div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  能力矩阵 <Layers className="size-3.5" />
                </div>
                <div className="text-muted-foreground">覆盖 8 大维度</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">已掌握</p>
                  <Award className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums">{masteredCount}</div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  持续积累 <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">占比 {overallCompletion}%</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">学习中</p>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums">{learningCount}</div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                  正在提升 <Sparkles className="size-3.5" />
                </div>
                <div className="text-muted-foreground">持续精进中</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-amber-50/50 to-card dark:from-amber-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">待开始</p>
                  <Target className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums">{notStartedCount}</div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  发展空间 <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">待解锁能力</div>
              </CardFooter>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>能力雷达图</CardTitle>
                  <CardDescription>
                    对比您的能力水平与行业平均水平
                    {comparison && (
                      <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                        · 行业：{comparison.industry} · 岗位：{comparison.role}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={radarView === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRadarView('both')}
                  >
                    对比
                  </Button>
                  <Button
                    variant={radarView === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRadarView('user')}
                  >
                    我的
                  </Button>
                  <Button
                    variant={radarView === 'industry' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRadarView('industry')}
                  >
                    行业
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 tabular-nums">
                      {radarData.length > 0 ? Math.round(radarData.reduce((sum, d) => sum + d.您的得分, 0) / radarData.length) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">我的平均分</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600 tabular-nums">
                      {radarData.length > 0 ? Math.round(radarData.reduce((sum, d) => sum + d.行业平均, 0) / radarData.length) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">行业平均分</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 tabular-nums">
                      {radarData.filter(d => d.您的得分 > d.行业平均).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">领先维度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 tabular-nums">
                      {radarData.filter(d => d.您的得分 < d.行业平均).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">待提升</div>
                  </div>
                </div>

                {/* Radar Chart */}
                <ResponsiveContainer width="100%" height={450}>
                  <RadarChart data={radarData}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      tickCount={6}
                    />
                    {(radarView === 'both' || radarView === 'user') && (
                      <Radar
                        name="您的得分"
                        dataKey="您的得分"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                    )}
                    {(radarView === 'both' || radarView === 'industry') && (
                      <Radar
                        name="行业平均"
                        dataKey="行业平均"
                        stroke="#64748b"
                        fill="#64748b"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>能力分类详情</CardTitle>
              <CardDescription>
                按8大维度查看具体能力掌握情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(competenciesByCategory || {})[0]} className="w-full">
                <div className="overflow-x-auto pb-2">
                  <TabsList className="inline-flex w-auto min-w-full">
                    {Object.keys(competenciesByCategory || {}).map((category) => (
                      <TabsTrigger key={category} value={category} className="text-xs whitespace-nowrap px-3">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {Object.entries(competenciesByCategory || {}).map(([category, comps]) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid gap-4">
                      {comps.map((comp) => (
                        <Card key={comp.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{comp.name}</CardTitle>
                                <CardDescription className="mt-1 text-sm">
                                  {comp.description}
                                </CardDescription>
                              </div>
                              <div className="ml-4">
                                {getStatusBadge(comp.userProgress.status)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {/* Level and Score */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-muted-foreground">当前等级：</span>
                                    <span className="font-medium">
                                      {getLevelLabel(comp.userProgress.level)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">自评：</span>
                                    <span className="font-medium tabular-nums">
                                      {comp.userProgress.selfAssessmentScore || 0}/5
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">AI评估：</span>
                                    <span className="font-medium tabular-nums">
                                      {comp.userProgress.aiAnalysisScore || 0}/5
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">实践次数：</span>
                                    <span className="font-medium tabular-nums">
                                      {comp.userProgress.practiceCount || 0}次
                                    </span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  查看详情
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>掌握度</span>
                                  <span className="tabular-nums">{(comp.userProgress.level || 0) * 20}%</span>
                                </div>
                                <Progress
                                  value={(comp.userProgress.level || 0) * 20}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Industry Comparison Details */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle>行业对比分析</CardTitle>
                <CardDescription>
                  您与同行业同岗位的能力差距分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparison.gaps.map((gap) => (
                    <div key={gap.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{gap.category}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          您的得分：{gap.userScore} · 行业平均：{gap.industryScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            gap.status === 'leading' ? 'default' :
                              gap.status === 'average' ? 'secondary' :
                                gap.status === 'below' ? 'outline' :
                                  'destructive'
                          }
                        >
                          {gap.gap > 0 ? `+${gap.gap}` : gap.gap}分
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {gap.status === 'leading' && '领先'}
                          {gap.status === 'average' && '平均水平'}
                          {gap.status === 'below' && '略低'}
                          {gap.status === 'weak' && '需加强'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
