import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AchievementCard from "@/components/AchievementCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target,
  TrendingUp,
  Award
} from "lucide-react";
import PageContainer from "@/components/PageContainer";

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch challenge achievements (with unlock status) from API
  const { data: allAchievements, isLoading } = trpc.challenges.getAchievements.useQuery();
  
  // Fetch challenges stats for progress calculation
  const { data: stats } = trpc.challenges.getStats.useQuery();

  // 基于统计数据计算进度（用于未解锁成就的进度条展示）
  const achievementsWithStatus = (allAchievements || []).map(achievement => {
    let progress = 0;

    if (stats) {
      if (achievement.category === 'count') {
        progress = Math.min(100, Math.round((stats.totalChallenges / achievement.requirement) * 100));
      } else if (achievement.category === 'streak') {
        progress = Math.min(100, Math.round((stats.currentStreak / achievement.requirement) * 100));
      } else if (achievement.category === 'accuracy' && stats.totalChallenges > 0) {
        const accuracy = Math.round((stats.correctCount / stats.totalChallenges) * 100);
        progress = Math.min(100, Math.round((accuracy / achievement.requirement) * 100));
      }
    }

    // unlocked 和 unlockedAt 直接使用 API 返回的值（来自 DB userChallengeAchievements）
    return {
      ...achievement,
      progress,
    };
  });

  // Filter by category
  const filteredAchievements = selectedCategory === "all" 
    ? achievementsWithStatus
    : achievementsWithStatus.filter(a => a.category === selectedCategory);

  // Calculate statistics
  const totalAchievements = achievementsWithStatus.length;
  const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;
  const totalPoints = achievementsWithStatus
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const completionRate = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <DashboardLayout>
      <PageContainer isLoading={isLoading} pageTitle="成就系统" pageDescription="解锁成就，见证你的成长历程">
        <div className="space-y-5">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:shadow-xs">
            <Card className="@container/card bg-gradient-to-t from-amber-50/50 to-card dark:from-amber-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">已解锁</p>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
                  {unlockedCount}/{totalAchievements}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                  完成度 {completionRate}% <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">持续解锁</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-purple-50/50 to-card dark:from-purple-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">成就积分</p>
                  <Star className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-purple-600 dark:text-purple-400">
                  {totalPoints}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                  累计获得 <Star className="size-3.5" />
                </div>
                <div className="text-muted-foreground">奖励中心</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-blue-50/50 to-card dark:from-blue-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">稀有成就</p>
                  <Award className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
                  {achievementsWithStatus.filter(a => a.unlocked && (a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary')).length}
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  已获得 <Award className="size-3.5" />
                </div>
                <div className="text-muted-foreground">珍贵收藏</div>
              </CardFooter>
            </Card>

            <Card className="@container/card bg-gradient-to-t from-emerald-50/50 to-card dark:from-emerald-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">完成率</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                  {completionRate}%
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 pt-0 text-xs">
                <div className="line-clamp-1 flex gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  继续加油 <TrendingUp className="size-3.5" />
                </div>
                <div className="text-muted-foreground">逐步达成</div>
              </CardFooter>
            </Card>
          </div>

          {/* Achievements Grid */}
          <Card>
            <CardHeader>
              <CardTitle>成就列表</CardTitle>
              <CardDescription>
                完成挑战，解锁更多成就徽章
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    全部 <Badge variant="secondary" className="ml-2">{achievementsWithStatus.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="count">
                    <Target className="h-3 w-3 mr-1" />
                    数量
                  </TabsTrigger>
                  <TabsTrigger value="streak">
                    <Flame className="h-3 w-3 mr-1" />
                    连续
                  </TabsTrigger>
                  <TabsTrigger value="accuracy">
                    <Trophy className="h-3 w-3 mr-1" />
                    准确率
                  </TabsTrigger>
                  <TabsTrigger value="special">
                    <Star className="h-3 w-3 mr-1" />
                    特殊
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={achievement.unlocked}
                        unlockedAt={achievement.unlockedAt}
                        progress={achievement.progress}
                      />
                    ))}
                  </div>

                  {filteredAchievements.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>该类别暂无成就</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
