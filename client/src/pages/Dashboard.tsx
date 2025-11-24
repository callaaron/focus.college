import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  Target,
  Activity,
  Award,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  User,
  Briefcase
} from "lucide-react";
import { useLocation } from "wouter";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/PageTransition";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // 获取用户画像
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery();
  
  // 获取画像完成度
  const { data: completion } = trpc.profile.getCompletion.useQuery();
  
  // 获取能力评分
  const { data: competencies, isLoading: competenciesLoading } = trpc.competencies.list.useQuery();
  
  // 获取用户能力进度
  const { data: userProgress } = trpc.competencies.myProgress.useQuery();

  // 计算统计数据
  const completedCount = userProgress?.filter(c => c.userProgress.status === 'mastered').length || 0;
  const inProgressCount = userProgress?.filter(c => c.userProgress.status === 'learning').length || 0;
  const totalCount = competencies?.length || 35;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 计算平均分
  const scores = userProgress?.map(c => c.userProgress.selfAssessed).filter(s => s > 0) || [];
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <FadeInUp>
            <div>
              <h1 className="text-3xl font-bold">欢迎回来，{user?.name || '用户'}</h1>
              <p className="text-muted-foreground mt-1">
                这是你的能力发展概览
              </p>
            </div>
          </FadeInUp>

          {/* Profile Completion Alert */}
          {completion && completion.completionRate < 100 && (
            <FadeInUp delay={0.1}>
              <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <span className="font-medium">个人信息未完善</span>
                <span className="text-muted-foreground ml-2">
                  完成度：{completion.completionRate}%
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/profile')}
              >
                去完善
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
            </FadeInUp>
          )}

          {/* Stats Cards */}
          <StaggerContainer>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                已掌握能力
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">
                共 {totalCount} 项能力
              </p>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                学习中
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">
                正在提升的能力
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                平均分数
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}</div>
              <p className="text-xs text-muted-foreground">
                满分 5 分
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                评估进度
              </CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                已完成初始评估
              </p>
            </CardContent>
          </Card>
            </div>
          </StaggerContainer>

          {/* Main Content Grid */}
          <FadeInUp delay={0.3}>
            <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                个人信息
              </CardTitle>
              <CardDescription>
                你的职业背景和行业信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : profile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">行业</span>
                    <Badge variant="secondary">{profile.industry || '未设置'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">职位</span>
                    <Badge variant="secondary">{profile.currentRole || '未设置'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">公司规模</span>
                    <span className="text-sm font-medium">
                      {profile.companySize === 'startup' && '初创(<50人)'}
                      {profile.companySize === 'small' && '小型(50-200人)'}
                      {profile.companySize === 'medium' && '中型(200-1000人)'}
                      {profile.companySize === 'large' && '大型(1000+人)'}
                      {!profile.companySize && '未设置'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">管理年限</span>
                    <span className="text-sm font-medium">
                      {profile.yearsOfManagement || 0} 年
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    还未完善个人信息
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/profile')}
                  >
                    去设置
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                快速操作
              </CardTitle>
              <CardDescription>
                开始评估或查看能力详情
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-between" 
                variant="default"
                onClick={() => setLocation('/assessment')}
              >
                <span>开始初始评估</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => setLocation('/competencies')}
              >
                <span>查看能力看板</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => setLocation('/challenge')}
              >
                <span>今日挑战</span>
                <Badge variant="secondary" className="ml-2">NEW</Badge>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => setLocation('/growth')}
              >
                <span>成长历程</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              最近进展
            </CardTitle>
            <CardDescription>
              你最近学习和提升的能力
            </CardDescription>
          </CardHeader>
          <CardContent>
            {competenciesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : inProgressCount > 0 ? (
              <div className="space-y-3">
                {userProgress
                  ?.filter(c => c.userProgress.status === 'learning')
                  .slice(0, 5)
                  .map(comp => (
                    <div 
                      key={comp.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{comp.name}</div>
                        <div className="text-sm text-muted-foreground">{comp.category}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {comp.userProgress.selfAssessed}/5
                          </div>
                          <div className="text-xs text-muted-foreground">自评分数</div>
                        </div>
                        <Badge variant="secondary">学习中</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  还没有开始学习任何能力
                </p>
                <Button onClick={() => setLocation('/assessment/initial')}>
                  开始评估
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </FadeInUp>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
