import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageContainer from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, TrendingUp, Target, BookOpen, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function GapAnalysis() {
  const [location, navigate] = useLocation();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  // Fetch user data
  const { data: user } = trpc.auth.me.useQuery();
  const { data: userProfile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch positions
  const { data: positions, isLoading: positionsLoading } = trpc.positions.getAll.useQuery();

  // Fetch user competencies
  const { data: userCompetencies, isLoading: competenciesLoading } = trpc.competencies.getUserCompetencies.useQuery(undefined, {
    enabled: !!user,
  });

  // Fetch position competencies when position is selected
  const { data: positionCompetencies, isLoading: positionCompLoading } = trpc.positions.getCompetencies.useQuery(
    { positionId: selectedPosition! },
    { enabled: !!selectedPosition }
  );

  // Auto-select user's current position if available
  useEffect(() => {
    if (userProfile?.positionId && !selectedPosition) {
      setSelectedPosition(userProfile.positionId);
    }
  }, [userProfile, selectedPosition]);

  const isLoading = positionsLoading || competenciesLoading || (selectedPosition && positionCompLoading);

  // Calculate gap data
  const gapData = positionCompetencies?.map(pc => {
    const userComp = userCompetencies?.find(uc => uc.competencyId === pc.competencyId);
    const currentScore = userComp?.finalScore || 0;
    const requiredScore = pc.requiredScore || 60;
    const gap = Math.max(0, requiredScore - currentScore);

    return {
      competencyId: pc.competencyId,
      name: pc.competencyName || `Competency ${pc.competencyId}`,
      currentScore,
      requiredScore,
      gap,
      priority: pc.priority || 'medium',
      isImportant: pc.isCore || false,
    };
  }) || [];

  // Calculate overall statistics
  const stats = {
    totalCompetencies: gapData.length,
    competenciesMet: gapData.filter(d => d.gap === 0).length,
    averageGap: gapData.length > 0 ? Math.round(gapData.reduce((sum, d) => sum + d.gap, 0) / gapData.length) : 0,
    priorityGaps: gapData.filter(d => d.priority === 'high' && d.gap > 0).length,
  };

  const completionRate = stats.totalCompetencies > 0
    ? Math.round((stats.competenciesMet / stats.totalCompetencies) * 100)
    : 0;

  // Prepare radar chart data
  const radarData = gapData.slice(0, 8).map(d => ({
    subject: d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name,
    current: d.currentScore,
    required: d.requiredScore,
  }));

  // Sort gaps by priority
  const sortedGaps = [...gapData].sort((a, b) => {
    if (a.gap === 0 && b.gap > 0) return 1;
    if (a.gap > 0 && b.gap === 0) return -1;
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return b.gap - a.gap;
  });

  return (
    <DashboardLayout>
      <PageContainer isLoading={isLoading} pageTitle="能力缺口分析" pageDescription="对比当前能力与目标岗位要求，识别需要提升的能力">
        <div className="space-y-5">
          {/* Position Selection */}
          <Card>
            <CardHeader>
              <CardTitle>选择目标岗位</CardTitle>
              <CardDescription>
                选择您想要对比的岗位，系统将分析您的能力缺口
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedPosition?.toString() || ""}
                onValueChange={(value) => setSelectedPosition(parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="请选择岗位..." />
                </SelectTrigger>
                <SelectContent>
                  {positions?.map(pos => (
                    <SelectItem key={pos.id} value={pos.id.toString()}>
                      {pos.name}
                      {userProfile?.positionId === pos.id && (
                        <Badge variant="outline" className="ml-2">当前岗位</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {!selectedPosition && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                请先选择一个目标岗位，以查看能力缺口分析
              </AlertDescription>
            </Alert>
          )}

          {selectedPosition && gapData.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                该岗位暂无能力要求数据，请联系管理员配置
              </AlertDescription>
            </Alert>
          )}

          {selectedPosition && gapData.length > 0 && (
            <>
              {/* Statistics Overview — gradient style */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
                <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">总体完成度</p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{completionRate}%</div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <Progress value={completionRate} className="h-1.5 w-full" />
                    <div className="text-muted-foreground">岗位达标进度</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">能力达标数</p>
                      <Target className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{stats.competenciesMet}/{stats.totalCompetencies}</div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      已达要求 <CheckCircle2 className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">达到岗位要求的能力</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">平均缺口</p>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{stats.averageGap}分</div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                      待补强 <Sparkles className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">当前与要求的平均差</div>
                  </CardFooter>
                </Card>

                <Card className="@container/card bg-gradient-to-t from-amber-50/50 to-card dark:from-amber-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">优先提升项</p>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight tabular-nums">{stats.priorityGaps}项</div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                    <div className="line-clamp-1 flex gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                      重点突破 <TrendingUp className="size-3.5" />
                    </div>
                    <div className="text-muted-foreground">高优先级且有缺口</div>
                  </CardFooter>
                </Card>
              </div>

              {/* Radar Chart Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>能力对比雷达图</CardTitle>
                  <CardDescription>
                    蓝色为当前水平，红色为岗位要求（显示前8项能力）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="当前水平"
                        dataKey="current"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name="岗位要求"
                        dataKey="required"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gap Details */}
              <Card>
                <CardHeader>
                  <CardTitle>详细缺口分析</CardTitle>
                  <CardDescription>
                    按优先级和缺口大小排序的能力清单
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sortedGaps.map(gap => (
                      <div key={gap.competencyId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{gap.name}</h3>
                              {gap.isImportant && (
                                <Badge variant="default">核心能力</Badge>
                              )}
                              {gap.priority === 'high' && (
                                <Badge variant="destructive">高优先级</Badge>
                              )}
                              {gap.priority === 'medium' && (
                                <Badge variant="secondary">中优先级</Badge>
                              )}
                            </div>
                          </div>
                          {gap.gap === 0 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Target className="w-3 h-3 mr-1" />
                              已达标
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              需提升 {gap.gap}分
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">当前水平</span>
                            <span className="font-medium tabular-nums">{gap.currentScore}分</span>
                          </div>
                          <Progress value={gap.currentScore} className="h-2" />

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">岗位要求</span>
                            <span className="font-medium tabular-nums">{gap.requiredScore}分</span>
                          </div>
                          <Progress value={gap.requiredScore} className="h-2 bg-red-100" />
                        </div>

                        {gap.gap > 0 && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/learning-path?competency=${gap.competencyId}`)}
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              查看学习路径
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/assessment?competency=${gap.competencyId}`)}
                            >
                              开始评估
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {stats.priorityGaps > 0 && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>建议：</strong>
                    您有 {stats.priorityGaps} 项高优先级能力需要提升。
                    建议优先关注这些能力，它们对您的职业发展最为关键。
                    <Button
                      variant="link"
                      className="ml-2 p-0 h-auto"
                      onClick={() => navigate('/learning-path')}
                    >
                      查看推荐学习路径 →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
