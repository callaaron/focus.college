import { useState } from "react";
import { useLocation } from "wouter";
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
  FileText,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { FastListSkeleton } from "@/components/FastSkeleton";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { toast } from "sonner";

export default function Assessment() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<"initial" | "regular" | "position" | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch user profile to check completion
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  const { data: completion, isLoading: completionLoading } = trpc.profile.getCompletion.useQuery();
  
  // Fetch competencies
  const { data: competencies, isLoading: competenciesLoading } = trpc.competencies.myProgress.useQuery();

  // Start session mutation
  const startSessionMutation = trpc.assessment.startSession.useMutation({
    onSuccess: (data) => {
      toast.success("评估会话已创建，正在跳转...");
      setTimeout(() => {
        setLocation(`/assessment/questionnaire/${data.sessionId}`);
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "创建评估会话失败，请重试");
      setIsStarting(false);
    },
  });

  const handleStartAssessment = async (type: "initial" | "regular" | "position") => {
    setSelectedType(type);
    setIsStarting(true);
    
    // Determine number of questions based on type
    const totalQuestions = type === "initial" ? 49 : type === "regular" ? 35 : 25;
    
    try {
      await startSessionMutation.mutateAsync({
        sessionType: type,
        totalQuestions,
      });
    } catch (error) {
      // Error already handled in mutation callback
      setIsStarting(false);
    }
  };

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

  // Check if profile is complete (require at least 60% completion)
  const profileIncomplete = !completion || completion.completionRate < 60;

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
                disabled={profileIncomplete || isStarting}
                onClick={() => handleStartAssessment("initial")}
              >
                {isStarting && selectedType === "initial" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    启动中...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    开始评估
                  </>
                )}
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
                disabled={profileIncomplete || isStarting}
                onClick={() => handleStartAssessment("regular")}
              >
                {isStarting && selectedType === "regular" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    启动中...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    开始评估
                  </>
                )}
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
                disabled={profileIncomplete || !profile?.currentRole || isStarting}
                onClick={() => handleStartAssessment("position")}
              >
                {isStarting && selectedType === "position" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    启动中...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    开始评估
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assessment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              评估历史
            </CardTitle>
            <CardDescription>
              您最近的评估记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无评估记录</p>
              <p className="text-sm mt-2">开始您的第一次评估吧！</p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Tips */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              评估小贴士
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>评估过程中请根据您的<strong>实际情况</strong>作答，没有对错之分</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>建议选择<strong>安静的环境</strong>，集中精力完成评估</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>评估结果将帮助系统为您推荐<strong>个性化的成长路径</strong></p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>可以随时<strong>暂停和继续</strong>，您的答案会自动保存</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
