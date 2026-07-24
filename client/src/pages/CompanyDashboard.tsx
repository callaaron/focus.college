import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Target, Sparkles, ArrowRight, Award, AlertCircle } from "lucide-react";
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

// 8 域定义，对齐 DB competencyDomains
const DOMAIN_DEFS = [
  { key: "strategic_leadership", label: "战略领导力", icon: "🎯", color: "#2563eb" },
  { key: "product_innovation", label: "产品创新", icon: "💡", color: "#9333ea" },
  { key: "marketing", label: "市场营销", icon: "📣", color: "#ea580c" },
  { key: "team_management", label: "团队管理", icon: "👥", color: "#0891b2" },
  { key: "operations_management", label: "运营管理", icon: "⚙️", color: "#16a34a" },
  { key: "financial_capability", label: "财务能力", icon: "💰", color: "#ca8a04" },
  { key: "resource_integration", label: "资源整合", icon: "🤝", color: "#db2777" },
  { key: "entrepreneurial_mindset", label: "创业心态", icon: "🚀", color: "#7c3aed" },
] as const;

// 域描述
const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  strategic_leadership: "战略规划、目标设定、资源配置、战略执行与调整能力",
  product_innovation: "技术创新、产品创新、商业模式创新、变革管理能力",
  marketing: "品牌建设、渠道管理、客户获取、市场推广与客户关系管理",
  team_management: "人才管理、团队建设、文化建设、组织架构优化能力",
  operations_management: "流程管理、效率优化、成本控制、质量保证能力",
  financial_capability: "现金流管理、预算预测、融资能力、风险管控与投资分析",
  resource_integration: "合作伙伴、外部资源、产业链协同、跨界合作能力",
  entrepreneurial_mindset: "创业激情、突破思维、机会敏锐度、韧性与持续学习",
};

// 从 detailedScores JSON 解析 8 域分数，兼容旧 4 域数据
function parseDomainScores(assessment: any): Record<string, number> {
  if (!assessment) return {};
  const result: Record<string, number> = {};

  // 尝试从 detailedScores JSON 解析
  if (assessment.detailedScores) {
    try {
      const parsed = JSON.parse(assessment.detailedScores);
      if (parsed.domainScores) {
        // 新格式：8 域分数
        return { ...parsed.domainScores };
      }
      // 旧格式：4 域 questions 结构，从固定列回填
    } catch {
      // JSON 解析失败，回退到固定列
    }
  }

  // 回退：从 4 个固定列映射到 4 个域
  result["strategic_leadership"] = assessment.strategyScore || 0;
  result["operations_management"] = assessment.operationScore || 0;
  result["team_management"] = assessment.organizationScore || 0;
  result["product_innovation"] = assessment.innovationScore || 0;
  return result;
}

export default function CompanyDashboard() {
  const [, navigate] = useLocation();
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("month");

  // Fetch organization assessment
  const assessmentQuery = trpc.organizationAssessment.get.useQuery();
  const historyQuery = trpc.organizationAssessment.getHistory.useQuery({ limit: 6 });

  const isLoading = assessmentQuery.isLoading;
  const assessment = assessmentQuery.data;
  const history = historyQuery.data || [];

  // 解析 8 域分数
  const domainScores = useMemo(() => parseDomainScores(assessment), [assessment]);

  // 雷达图数据
  const radarData = DOMAIN_DEFS.map((d) => ({
    dimension: d.label,
    score: domainScores[d.key] ?? 0,
    fullMark: 100,
  }));

  // 综合评分（8 域平均）
  const averageScore = useMemo(() => {
    const scores = DOMAIN_DEFS.map((d) => domainScores[d.key] ?? 0);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }, [domainScores]);

  // 最强/最弱域
  const sortedDomains = useMemo(() => {
    return DOMAIN_DEFS.map((d) => ({ ...d, score: domainScores[d.key] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }, [domainScores]);
  const strongestDomain = sortedDomains[0];
  const weakestDomain = sortedDomains[sortedDomains.length - 1];

  // 趋势数据（从历史记录解析）
  const trendData = history
    .slice()
    .reverse()
    .map((item) => {
      const scores = parseDomainScores(item);
      const avg = DOMAIN_DEFS.reduce((sum, d) => sum + (scores[d.key] ?? 0), 0) / DOMAIN_DEFS.length;
      return {
        date: new Date(item.assessmentDate).toLocaleDateString("zh-CN", {
          month: "short",
          day: "numeric",
        }),
        综合评分: Math.round(avg),
      };
    });

  return (
    <DashboardLayout>
      <PageContainer
        isLoading={isLoading}
        pageTitle="企业能力看板"
        pageDescription="全面评估和管理企业 8 大核心能力域"
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
                  通过专业的评估问卷，全面了解企业在战略领导力、产品创新、市场营销、团队管理、运营管理、财务能力、资源整合、创业心态 8 个能力域的现状
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 *:data-[slot=card]:shadow-xs">
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
                      8 域平均 <Target className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">满分 100</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-emerald-50/50 to-card dark:from-emerald-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">最强能力域</p>
                      <Award className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                      {strongestDomain?.score ?? 0}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      {strongestDomain?.icon} {strongestDomain?.label} <Award className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">领先领域</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-orange-50/50 to-card dark:from-orange-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">待提升能力域</p>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums text-orange-600 dark:text-orange-400">
                      {weakestDomain?.score ?? 0}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-orange-600 dark:text-orange-400">
                      {weakestDomain?.icon} {weakestDomain?.label} <AlertCircle className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">重点关注</div>
                  </CardFooter>
                </Card>
              </div>

              {/* Radar Chart + Domain Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>企业能力雷达图</CardTitle>
                    <CardDescription>8 大能力域全景视图</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
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
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>能力域明细</CardTitle>
                    <CardDescription>各域得分与描述</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {DOMAIN_DEFS.map((d) => {
                        const score = domainScores[d.key] ?? 0;
                        return (
                          <div key={d.key} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                {d.icon} {d.label}
                              </span>
                              <span className="font-bold tabular-nums" style={{ color: d.color }}>
                                {score}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${score}%`, backgroundColor: d.color }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {DOMAIN_DESCRIPTIONS[d.key]}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Chart */}
              {trendData.length > 1 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>综合能力发展趋势</CardTitle>
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
                          dataKey="综合评分"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 4 }}
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
                      <TrendingUp className="h-5 w-5 mb-2" />
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
                      <Award className="h-5 w-5 mb-2" />
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
