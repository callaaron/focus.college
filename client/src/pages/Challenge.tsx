import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeInUp, StaggerContainer } from "@/components/PageTransition";
import { PageSkeleton } from "@/components/PageSkeleton";
import { trpc } from "@/lib/trpc";
import { 
  Target, 
  Trophy, 
  Flame, 
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Challenge() {
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch today's challenge
  const { data: dailyChallenge, isLoading: challengeLoading } = trpc.challenges.getDailyChallenge.useQuery();

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = trpc.challenges.getStats.useQuery();

  // Fetch challenge history
  const { data: history, isLoading: historyLoading } = trpc.challenges.getHistory.useQuery({
    limit: 5,
    offset: 0,
  });

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.challenges.getLeaderboard.useQuery({
    period: 'all',
    limit: 10,
  });

  // Submit answer mutation
  const submitAnswerMutation = trpc.challenges.submitAnswer.useMutation({
    onSuccess: (data) => {
      setShowResult(true);
      toast({
        title: data.isCorrect ? "回答正确！🎉" : "回答错误",
        description: data.isCorrect 
          ? `恭喜您获得 ${data.pointsEarned} 积分！` 
          : "继续加油，下次一定能答对！",
        variant: data.isCorrect ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !dailyChallenge) {
      toast({
        title: "请选择答案",
        description: "请先选择一个答案选项",
        variant: "destructive",
      });
      return;
    }

    submitAnswerMutation.mutate({
      challengeId: dailyChallenge.id,
      selectedAnswer,
      timeSpent: 60, // TODO: Track actual time spent
    });
  };

  if (challengeLoading || statsLoading) {
    return <PageSkeleton />;
  }

  const isAlreadyCompleted = dailyChallenge?.isCompleted || showResult;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <FadeInUp>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">今日挑战</h1>
              <p className="text-muted-foreground mt-2">
                每天完成管理能力小挑战，持续提升您的实战水平
              </p>
            </div>
          </FadeInUp>

          {/* Stats Cards */}
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    连续打卡
                  </CardTitle>
                  <Flame className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.currentStreak || 0} 天
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    继续保持
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    累计完成
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.totalChallenges || 0} 个
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    挑战已完成
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    获得积分
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.totalPoints || 0} 分
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    可兑换奖励
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    排名
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.rank ? `#${stats.rank}` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.rank ? '全站排名' : '暂无排名'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </StaggerContainer>

          {/* Today's Challenge */}
          <FadeInUp delay={0.2}>
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {dailyChallenge?.title || '今日挑战'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {dailyChallenge?.scenario?.description || '完成今天的挑战任务，提升您的管理能力'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-orange-500 hover:bg-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    今天
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scenario */}
                {dailyChallenge?.scenario?.context && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      情境描述
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {dailyChallenge.scenario.context}
                    </p>
                  </div>
                )}

                {/* Question */}
                {dailyChallenge?.scenario?.question && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">
                      {dailyChallenge.scenario.question}
                    </h4>
                  </div>
                )}

                {/* Options */}
                {dailyChallenge?.options && dailyChallenge.options.length > 0 && (
                  <div className="space-y-3">
                    {dailyChallenge.options.map((option: any, index: number) => {
                      const optionNumber = index + 1;
                      const isSelected = selectedAnswer === optionNumber;
                      const isCorrect = showResult && dailyChallenge.correctAnswer === optionNumber;
                      const isWrong = showResult && isSelected && dailyChallenge.correctAnswer !== optionNumber;

                      return (
                        <button
                          key={index}
                          onClick={() => !isAlreadyCompleted && setSelectedAnswer(optionNumber)}
                          disabled={isAlreadyCompleted}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border-2 transition-all",
                            "hover:border-primary hover:bg-muted/50",
                            isSelected && !showResult && "border-primary bg-primary/10",
                            isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                            isWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                            !isSelected && !isCorrect && !isWrong && "border-border",
                            isAlreadyCompleted && "opacity-75 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                              isSelected && !showResult && "border-primary bg-primary text-primary-foreground",
                              isCorrect && "border-green-500 bg-green-500 text-white",
                              isWrong && "border-red-500 bg-red-500 text-white",
                              !isSelected && !isCorrect && !isWrong && "border-border"
                            )}>
                              {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : 
                               isWrong ? <AlertCircle className="h-4 w-4" /> :
                               String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{option.text || option}</p>
                              {showResult && option.explanation && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {option.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Submit Button */}
                {!isAlreadyCompleted && (
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAnswer(null)}
                      disabled={selectedAnswer === null}
                    >
                      重置
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null || submitAnswerMutation.isPending}
                    >
                      {submitAnswerMutation.isPending ? "提交中..." : "提交答案"}
                    </Button>
                  </div>
                )}

                {/* Already Completed Message */}
                {isAlreadyCompleted && !showResult && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-semibold">今日挑战已完成！</p>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      明天再来继续挑战吧！
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge History */}
            <FadeInUp delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>挑战历史</CardTitle>
                  <CardDescription>
                    查看您过往完成的挑战记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : history && history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {item.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{item.challengeTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.completedAt).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={item.isCorrect ? "default" : "destructive"}>
                            {item.pointsEarned} 分
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>暂无挑战记录</p>
                      <p className="text-sm mt-2">完成今日挑战后，记录将显示在这里</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Leaderboard */}
            <FadeInUp delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>挑战排行榜</CardTitle>
                  <CardDescription>
                    看看您在所有用户中的排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : leaderboard && leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.map((item: any, index: number) => (
                        <div
                          key={item.userId}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            index < 3 && "bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold",
                              index === 0 && "bg-yellow-500 text-white",
                              index === 1 && "bg-gray-400 text-white",
                              index === 2 && "bg-amber-700 text-white",
                              index >= 3 && "bg-muted text-muted-foreground"
                            )}>
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{item.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.totalChallenges} 个挑战
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-yellow-600">{item.totalPoints}</p>
                            <p className="text-xs text-muted-foreground">积分</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>排行榜功能开发中</p>
                      <p className="text-sm mt-2">即将支持与其他用户比拼挑战成绩</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInUp>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
