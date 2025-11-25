import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertCircle,
  Award,
  BarChart3,
  Target,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Progress } from "@/components/ui/progress";

export default function AssessmentResults() {
  const [, params] = useRoute("/assessment/results/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;

  // Fetch assessment results
  const { data, isLoading } = trpc.assessment.getResults.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  if (!sessionId) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>无效的评估会话ID</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!data) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>未找到评估结果</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const getLevelLabel = (level: number) => {
    const labels = ["未评估", "初级", "中级", "高级", "专家", "大师"];
    return labels[level] || "未知";
  };

  const getLevelColor = (level: number) => {
    if (level >= 5) return "text-purple-600 bg-purple-50";
    if (level >= 4) return "text-blue-600 bg-blue-50";
    if (level >= 3) return "text-green-600 bg-green-50";
    if (level >= 2) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-purple-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-green-600";
    if (score >= 20) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">评估报告</h1>
          </div>
          <p className="text-muted-foreground">
            恭喜完成评估！以下是您的能力评估结果
          </p>
        </div>

        {/* Overall Score */}
        <Card className="border-2 border-primary">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">综合评估分数</CardTitle>
            <CardDescription>基于 {data.totalAnswered} 道题目的综合分析</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-lg font-medium ${getLevelColor(
                  data.overallLevel
                )}`}
              >
                {getLevelLabel(data.overallLevel)} 等级
              </span>
            </div>
            <Progress value={data.overallScore} className="h-3 max-w-md mx-auto" />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>维度得分</CardTitle>
            </div>
            <CardDescription>
              各能力维度的得分情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryResults.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.category}</span>
                      <Badge variant="outline" className={getLevelColor(category.level)}>
                        {getLevelLabel(category.level)}
                      </Badge>
                    </div>
                    <span className={`font-bold ${getScoreColor(category.avgScore)}`}>
                      {category.avgScore} 分
                    </span>
                  </div>
                  <Progress value={category.avgScore} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competency Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>能力明细</CardTitle>
            </div>
            <CardDescription>
              各项具体能力的评估结果（共 {data.competencyResults.length} 项）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.competencyResults.map((comp) => (
                <div
                  key={comp.competencyId}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{comp.competencyName}</h4>
                      <p className="text-sm text-muted-foreground">{comp.category}</p>
                    </div>
                    <Badge variant="outline" className={getLevelColor(comp.level)}>
                      L{comp.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Progress value={comp.avgScore} className="flex-1 h-2" />
                    <span className={`text-sm font-bold ${getScoreColor(comp.avgScore)}`}>
                      {comp.avgScore}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    回答了 {comp.questionCount} 道相关题目
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Recommendations */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">下一步建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">查看能力地图</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    前往能力地图页面，深入了解各项能力的详细说明和提升路径
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">制定成长计划</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    针对较弱的能力项，系统会为您推荐定制化的学习路径和资源
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900">实践应用</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    通过"今日挑战"模块，在实际管理场景中练习和提升能力
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/assessment")}
          >
            返回评估首页
          </Button>
          <Button
            onClick={() => setLocation("/competencies")}
          >
            查看能力地图
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
