import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, Target, Sparkles, ArrowRight } from "lucide-react";
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
import { PageSkeleton } from "@/components/PageSkeleton";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/PageTransition";

export default function CompanyDashboard() {
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");

  // Fetch organization assessment
  const assessmentQuery = trpc.organizationAssessment.get.useQuery();
  const historyQuery = trpc.organizationAssessment.getHistory.useQuery({ limit: 6 });

  if (assessmentQuery.isLoading) {
    return <PageSkeleton />;
  }

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
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <FadeInUp>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">企业能力看板</h1>
                <p className="text-muted-foreground mt-1">
                  全面评估和管理企业核心能力
                </p>
              </div>
              {assessment ? (
                <Button onClick={() => navigate("/company/assessment")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  重新评估
                </Button>
              ) : (
                <Button onClick={() => navigate("/company/assessment")} size="lg">
                  <Target className="h-4 w-4 mr-2" />
                  开始评估
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </FadeInUp>

          {!assessment ? (
            // Empty state - no assessment yet
            <FadeInUp delay={0.1}>
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
            </FadeInUp>
          ) : (
            <>
              {/* Stats Overview */}
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StaggerItem index={0}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          综合评分
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">{averageScore}</div>
                        <p className="text-xs text-muted-foreground mt-1">四维能力平均分</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>

                  <StaggerItem index={1}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          战略能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {assessment.strategyScore}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">战略规划与执行</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>

                  <StaggerItem index={2}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          运营能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {assessment.operationScore}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">运营效率与管理</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>

                  <StaggerItem index={3}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          创新能力
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                          {assessment.innovationScore}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">创新驱动与变革</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                </div>
              </StaggerContainer>

              {/* Radar Chart */}
              <FadeInUp delay={0.2}>
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
              </FadeInUp>

              {/* Trend Chart */}
              {trendData.length > 1 && (
                <FadeInUp delay={0.3}>
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
                </FadeInUp>
              )}

              {/* Quick Actions */}
              <FadeInUp delay={0.4}>
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
              </FadeInUp>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
