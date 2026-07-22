import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, Target, Sparkles, ArrowRight } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import PageContainer from "@/components/PageContainer";

export default function CompanyDashboard() {
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");

  // Fetch organization assessment
  const assessmentQuery = trpc.organizationAssessment.get.useQuery();
  const historyQuery = trpc.organizationAssessment.getHistory.useQuery({ limit: 6 });

  const isLoading = assessmentQuery.isLoading;

  const assessment = assessmentQuery.data;
  const history = historyQuery.data || [];

  // Prepare radar chart data
  const radarData = [
    {
      dimension: "战略能力",
      score: assessment?.strategyScore || 0,
      fullMark: 100,
    },
    {
      dimension: "运营能力",
      score: assessment?.operationScore || 0,
      fullMark: 100,
    },
    {
      dimension: "组织能力",
      score: assessment?.organizationScore || 0,
      fullMark: 100,
    },
    {
      dimension: "创新能力",
      score: assessment?.innovationScore || 0,
      fullMark: 100,
    },
  ];

  // Calculate average score
  const averageScore = assessment
    ? Math.round(
        (assessment.strategyScore +
          assessment.operationScore +
          assessment.organizationScore +
          assessment.innovationScore) /
          4
      )
    : 0;

  // Prepare trend data from history
  const trendData = history
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.assessmentDate).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      }),
      战略: item.strategyScore,
      运营: item.operationScore,
      组织: item.organizationScore,
      创新: item.innovationScore,
    }));

  return (
    <DashboardLayout>
      <PageContainer
        isLoading={isLoading}
        pageTitle="企业能力看板"
        pageDescription="全面评估和管理企业核心能力"
        pageHeaderAction={
          <Button onClick={() => navigate("/company/assessment")}>
            <Sparkles className="h-4 w-4 mr-2" />
            {assessment ? "重新评估" : "开始评估"}
          </Button>
        }
      >
        <div className="space-y-5">
          {!assessment ? (
            // Empty state - no assessment yet
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">开始您的企业能力评估</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  通过专业的评估问卷，全面了解企业在战略、运营、组织和创新四个维度的能力现状
                </p>
                <Button onClick={() => navigate("/company/assessment")} size="lg">
                  <Target className="h-4 w-4 mr-2" />
                  立即开始评估
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
                <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">综合评分</p>
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{averageScore}</div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-primary">
                      四维平均 <Target className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">满分 100</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">战略能力</p>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
                      {assessment.strategyScore}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      战略规划 <TrendingUp className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">与执行</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-emerald-50/50 to-card dark:from-emerald-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">运营能力</p>
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                      {assessment.operationScore}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      效率管理 <Sparkles className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">持续优化</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">创新能力</p>
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-purple-600 dark:text-purple-400">
                      {assessment.innovationScore}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                      创新驱动 <Sparkles className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">变革管理</div>
                  </CardFooter>
                </Card>
              </div>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>企业能力雷达图</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="企业能力"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>

                  {/* Capability descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">🎯 战略能力</h4>
                      <p className="text-xs text-muted-foreground">
                        战略规划、目标设定、资源配置、战略执行与调整能力
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">⚙️ 运营能力</h4>
                      <p className="text-xs text-muted-foreground">
                        流程管理、效率优化、成本控制、质量保证能力
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">👥 组织能力</h4>
                      <p className="text-xs text-muted-foreground">
                        人才管理、团队建设、文化建设、组织架构优化能力
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">💡 创新能力</h4>
                      <p className="text-xs text-muted-foreground">
                        技术创新、产品创新、商业模式创新、变革管理能力
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trend Chart */}
              {trendData.length > 1 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>能力发展趋势</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={timeRange === "month" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange("month")}
                        >
                          月度
                        </Button>
                        <Button
                          variant={timeRange === "quarter" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange("quarter")}
                        >
                          季度
                        </Button>
                        <Button
                          variant={timeRange === "year" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange("year")}
                        >
                          年度
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="战略"
                          stroke="#2563eb"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="运营"
                          stroke="#16a34a"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="组织"
                          stroke="#ea580c"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="创新"
                          stroke="#9333ea"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col items-start"
                      onClick={() => navigate("/company/assessment")}
                    >
                      <Sparkles className="h-5 w-5 mb-2" />
                      <span className="font-semibold">重新评估</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        更新企业能力评估数据
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col items-start"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Users className="h-5 w-5 mb-2" />
                      <span className="font-semibold">个人能力</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        查看个人能力评估
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col items-start"
                      onClick={() => navigate("/analysis")}
                    >
                      <TrendingUp className="h-5 w-5 mb-2" />
                      <span className="font-semibold">AI 分析</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        获取智能分析建议
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
