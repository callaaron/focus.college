import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import PageContainer from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Clock, CheckCircle2, Circle, PlayCircle, FileText, Video, Book, GraduationCap, Star, Target, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LearningPath() {
  const [location, navigate] = useLocation();
  const [, params] = useRoute("/learning-path/:pathId");
  const pathId = params?.pathId ? parseInt(params.pathId) : null;

  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);

  // Fetch user data
  const { data: user } = trpc.auth.me.useQuery();

  // Fetch user's learning paths
  const { data: paths, isLoading: pathsLoading, refetch: refetchPaths } = trpc.learningPaths.getMy.useQuery(undefined, {
    enabled: !!user && !pathId,
  });

  // Fetch specific path details
  const { data: pathDetail, isLoading: detailLoading, refetch: refetchDetail } = trpc.learningPaths.getById.useQuery(
    { pathId: pathId! },
    { enabled: !!pathId }
  );

  const updateProgress = trpc.learningPaths.updateProgress.useMutation({
    onSuccess: () => {
      toast.success("学习进度已更新");
      refetchDetail();
      refetchPaths();
    },
    onError: (error) => {
      toast.error("更新失败：" + error.message);
    },
  });

  const isLoading = pathsLoading || detailLoading;

  const handleStartResource = (resource: any) => {
    if (!pathId) return;

    updateProgress.mutate({
      pathId,
      resourceId: resource.id,
      status: "in_progress",
      progressPercent: 0,
    });
  };

  const handleCompleteResource = (resource: any) => {
    if (!pathId) return;

    updateProgress.mutate({
      pathId,
      resourceId: resource.id,
      status: "completed",
      progressPercent: 100,
      notes: notes || undefined,
      rating: rating > 0 ? rating : undefined,
    });

    setNotes("");
    setRating(0);
    setSelectedResource(null);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "book": return <Book className="w-5 h-5" />;
      case "course": return <GraduationCap className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getResourceProgress = (resourceId: number) => {
    if (!pathDetail?.progress) return null;
    return pathDetail.progress.find((p: any) => p.resourceId === resourceId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200";
      case "intermediate": return "bg-blue-100 text-blue-700 border-blue-200";
      case "advanced": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Path detail view
  if (pathId && pathDetail) {
    const completionRate = pathDetail.totalResources > 0
      ? Math.round((pathDetail.completedResources / pathDetail.totalResources) * 100)
      : 0;

    return (
      <DashboardLayout>
        <PageContainer
          isLoading={false}
          pageTitle={pathDetail.title}
          pageDescription={pathDetail.description}
          pageHeaderAction={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/learning-path")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> 返回
              </Button>
              <Badge variant={pathDetail.status === 'completed' ? 'default' : 'secondary'}>
                {pathDetail.status === 'completed' ? '已完成' : pathDetail.status === 'active' ? '进行中' : '已暂停'}
              </Badge>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Progress Overview — gradient panel */}
            <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">学习进度</p>
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold tracking-tight tabular-nums">{completionRate}%</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={completionRate} className="h-2" />
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="text-center">
                    <div className="text-xl font-bold tabular-nums">{pathDetail.totalResources}</div>
                    <div className="text-xs text-muted-foreground">总资源数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 tabular-nums">{pathDetail.completedResources}</div>
                    <div className="text-xs text-muted-foreground">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 tabular-nums">{pathDetail.estimatedDays}天</div>
                    <div className="text-xs text-muted-foreground">预计时长</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card>
              <CardHeader>
                <CardTitle>学习资源</CardTitle>
                <CardDescription>按顺序完成以下资源以提升您的能力</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pathDetail.resources?.map((resource: any, index: number) => {
                    const progress = getResourceProgress(resource.id);
                    const isCompleted = progress?.status === 'completed';
                    const isInProgress = progress?.status === 'in_progress';

                    return (
                      <div key={resource.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-100 text-green-600' :
                            isInProgress ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                             isInProgress ? <PlayCircle className="w-5 h-5" /> :
                             <Circle className="w-5 h-5" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{resource.title}</h3>
                                  <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
                                    {resource.difficulty === 'beginner' ? '入门' :
                                     resource.difficulty === 'intermediate' ? '中级' :
                                     '高级'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                {getResourceIcon(resource.type)}
                                <span className="text-sm">{resource.type}</span>
                              </div>
                            </div>

                            {resource.estimatedTime && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Clock className="w-4 h-4" />
                                <span>{resource.estimatedTime}分钟</span>
                              </div>
                            )}

                            {progress && progress.progressPercent > 0 && !isCompleted && (
                              <Progress value={progress.progressPercent} className="h-2 mb-3" />
                            )}

                            <div className="flex gap-2">
                              {!progress || progress.status === 'not_started' ? (
                                <Button size="sm" onClick={() => handleStartResource(resource)}>
                                  开始学习
                                </Button>
                              ) : isInProgress ? (
                                <>
                                  {resource.url && (
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        继续学习
                                      </a>
                                    </Button>
                                  )}
                                  <Button size="sm" onClick={() => setSelectedResource(resource)}>
                                    标记完成
                                  </Button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    已完成
                                  </Badge>
                                  {progress.rating && (
                                    <div className="flex items-center">
                                      {[...Array(progress.rating)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Complete Resource Dialog */}
            {selectedResource && (
              <Card>
                <CardHeader>
                  <CardTitle>完成学习 - {selectedResource.title}</CardTitle>
                  <CardDescription>添加您的学习笔记和评分</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">学习笔记（可选）</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="记录您的学习收获、心得体会..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">资源评分（可选）</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleCompleteResource(selectedResource)}>
                      确认完成
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedResource(null)}>
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <PageContainer isLoading={isLoading} pageTitle="学习路径" pageDescription="基于能力缺口生成的个性化学习计划">
        <div className="space-y-5">
          {!paths || paths.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>暂无学习路径</CardTitle>
                <CardDescription>
                  完成能力评估和缺口分析后，系统将为您生成个性化学习路径
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/gap-analysis")}>
                    <Target className="w-4 h-4 mr-2" />
                    前往缺口分析
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/assessment")}>
                    开始能力评估
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paths.map((path: any) => {
                const completionRate = path.totalResources > 0
                  ? Math.round((path.completedResources / path.totalResources) * 100)
                  : 0;

                return (
                  <Card key={path.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/learning-path/${path.id}`)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{path.title}</CardTitle>
                          <CardDescription className="mt-2">{path.description}</CardDescription>
                        </div>
                        <Badge variant={path.status === 'completed' ? 'default' : 'secondary'}>
                          {path.status === 'completed' ? '已完成' : path.status === 'active' ? '进行中' : '已暂停'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm tabular-nums">完成进度 <strong>{completionRate}%</strong></span>
                          </div>
                          <Progress value={completionRate} />
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="tabular-nums">{path.totalResources} 个资源</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="tabular-nums">预计 {path.estimatedDays} 天</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="tabular-nums">{path.completedResources} 已完成</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
