import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertCircle,
  PlayCircle,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/PageTransition";

export default function Assessment() {
  const [selectedType, setSelectedType] = useState<"initial" | "regular" | "position" | null>(null);

  // Fetch user profile to check completion
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: completion, isLoading: completionLoading } = trpc.profile.getCompletion.useQuery();
  
  // Fetch competencies
  const { data: competencies, isLoading: competenciesLoading } = trpc.competencies.myProgress.useQuery();

  // Calculate completion stats
  const totalCompetencies = competencies?.length || 0;
  const assessedCount = competencies?.filter(c => 
    (c.userProgress.selfAssessed || 0) > 0 || 
    (c.userProgress.aiAssessed || 0) > 0
  ).length || 0;
  const completionRate = totalCompetencies > 0 ? Math.round((assessedCount / totalCompetencies) * 100) : 0;

  if (profileLoading || completionLoading || competenciesLoading) {
    return <PageSkeleton />;
  }

  // Check if profile is complete
  const profileIncomplete = !completion || completion.completionRate < 100;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <FadeInUp>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">能力评估</h1>
              <p className="text-muted-foreground mt-2">
                通过科学的评估问卷，全面了解您的管理能力水平
              </p>
            </div>
          </FadeInUp>

        {/* Profile Incomplete Warning */}
        {profileIncomplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              请先完善您的个人信息（当前完成度：{completion?.completionRate || 0}%），
              这将帮助系统提供更精准的评估和推荐。
              <Button 
                variant="link" 
                className="ml-2 h-auto p-0"
                onClick={() => window.location.href = '/profile'}
              >
                立即完善 →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总能力项
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompetencies}</div>
              <p className="text-xs text-muted-foreground mt-1">
                覆盖8大管理维度
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已评估
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{assessedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                完成度 {completionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                待评估
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalCompetencies - assessedCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                还有提升空间
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Initial Assessment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">推荐新用户</Badge>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>初始评估</CardTitle>
              <CardDescription className="min-h-[60px]">
                全面系统的能力评估，涵盖8大维度、35项核心能力。
                首次使用建议完成此评估，建立您的能力基线。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">题目数量</span>
                  <span className="font-medium">49题</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">预计时长</span>
                  <span className="font-medium">15-20分钟</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">评估维度</span>
                  <span className="font-medium">全部8个</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                disabled={profileIncomplete}
                onClick={() => setSelectedType("initial")}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                开始评估
              </Button>
            </CardContent>
          </Card>

          {/* Regular Assessment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge>常规评估</Badge>
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>常规评估</CardTitle>
              <CardDescription className="min-h-[60px]">
                定期评估您的能力进展，追踪成长轨迹。
                建议每季度进行一次，了解能力变化趋势。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">题目数量</span>
                  <span className="font-medium">35题</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">预计时长</span>
                  <span className="font-medium">10-15分钟</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">评估维度</span>
                  <span className="font-medium">核心7个</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={profileIncomplete}
                onClick={() => setSelectedType("regular")}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                开始评估
              </Button>
            </CardContent>
          </Card>

          {/* Position-based Assessment */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">针对性</Badge>
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>岗位评估</CardTitle>
              <CardDescription className="min-h-[60px]">
                基于您的目标岗位，评估相关核心能力。
                帮助您了解与目标岗位的能力匹配度。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">题目数量</span>
                  <span className="font-medium">20-25题</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">预计时长</span>
                  <span className="font-medium">8-12分钟</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">评估维度</span>
                  <span className="font-medium">岗位相关</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={profileIncomplete || !profile?.currentRole}
                onClick={() => setSelectedType("position")}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                开始评估
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              评估问卷系统开发中
            </CardTitle>
            <CardDescription>
              我们正在构建科学、全面的能力评估问卷系统。系统将包含：
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  已完成功能
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 能力数据模型（8大维度，35项能力）</li>
                  <li>• 用户画像系统</li>
                  <li>• 行业和职位库</li>
                  <li>• 能力看板可视化</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  开发中功能
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 49道评估题目设计与录入</li>
                  <li>• 智能评分算法</li>
                  <li>• AI辅助分析</li>
                  <li>• 个性化推荐引擎</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>替代方案：</strong> 
                在评估问卷完成前，您可以使用「综合分析」功能，上传您的工作文档（会议记录、项目总结等），
                系统将使用AI分析您在各个维度的能力表现，并给出专业评估。
              </p>
              <Button 
                variant="link" 
                className="mt-2 h-auto p-0"
                onClick={() => window.location.href = '/analysis'}
              >
                前往综合分析 →
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
