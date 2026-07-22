import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  Award,
  Target,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import PageContainer from "@/components/PageContainer";

export default function Growth() {
  // Fetch user capability trends
  const { data: trends, isLoading: trendsLoading } = trpc.organization.getUserCapabilityTrends.useQuery(
    { months: 6 }
  );

  // Fetch competencies with progress
  const { data: competencies, isLoading: competenciesLoading } = trpc.competencies.myProgress.useQuery();

  const isLoading = trendsLoading || competenciesLoading;

  // Prepare chart data
  const chartData = trends?.map((t) => ({
    month: new Date(t.snapshotDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    平均得分: Math.round(t.avgScore),
  })) || [];

  // Calculate growth stats
  const hasData = trends && trends.length > 0;
  const latestScore = hasData ? trends[trends.length - 1].avgScore : 0;
  const earliestScore = hasData ? trends[0].avgScore : 0;
  const scoreChange = latestScore - earliestScore;
  const scoreChangePercent = earliestScore > 0 ? ((scoreChange / earliestScore) * 100).toFixed(1) : 0;

  // Get recent mastered competencies
  const recentMastered = competencies
    ?.filter(c => c.userProgress.status === 'mastered')
    .slice(0, 5) || [];

  return (
    <DashboardLayout>
      <PageContainer isLoading={isLoading} pageTitle="成长历程" pageDescription="追踪您的能力成长轨迹，见证持续进步">
        <div className="space-y-5">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
            <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">当前平均分</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums">{Math.round(latestScore)}</div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  满分 100 <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">能力基线</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-emerald-50/50 to-card dark:from-emerald-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">成长幅度</p>
                  <Target className="h-4 w-4 text-emerald-500" />
                </div>
                <div className={`text-2xl font-bold tracking-tight tabular-nums ${scoreChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(1)}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  {scoreChangePercent >= 0 ? '+' : ''}{scoreChangePercent}% <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">较期初</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">已掌握能力</p>
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-purple-600 dark:text-purple-400">
                  {recentMastered.length}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                  最近掌握 <Award className="size-3.5" />
                </div>
                <div className="text-muted-foreground">持续精进</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">追踪天数</p>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
                  {trends?.length ? Math.round((Date.now() - new Date(trends[0].snapshotDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  持续追踪 <Calendar className="size-3.5" />
                </div>
                <div className="text-muted-foreground">数据积累中</div>
              </CardFooter>
            </Card>
          </div>

          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>能力成长趋势</CardTitle>
              <CardDescription>
                最近6个月的平均能力得分变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="平均得分" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无成长数据</p>
                  <p className="text-sm mt-2">
                    完成能力评估后，您的成长趋势将显示在这里
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>最近掌握的能力</CardTitle>
              <CardDescription>
                您最近成功掌握的管理能力
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentMastered.length > 0 ? (
                <div className="space-y-4">
                  {recentMastered.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">{comp.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {comp.category}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default">已掌握</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无已掌握能力</p>
                  <p className="text-sm mt-2">
                    继续学习和实践，解锁更多能力徽章
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Journey */}
          <Card>
            <CardHeader>
              <CardTitle>学习历程</CardTitle>
              <CardDescription>
                您的能力发展关键事件时间轴
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>详细学习历程功能开发中</p>
                <p className="text-sm mt-2">
                  将展示您的评估记录、学习资源使用、能力突破等关键节点
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
