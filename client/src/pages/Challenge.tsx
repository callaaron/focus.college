import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { 
  Target, 
  Trophy, 
  Flame, 
  CheckCircle2,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";

export default function Challenge() {
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
              <div className="text-2xl font-bold text-orange-600">0 天</div>
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
              <div className="text-2xl font-bold text-green-600">0 个</div>
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
              <div className="text-2xl font-bold text-yellow-600">0 分</div>
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
              <div className="text-2xl font-bold text-purple-600">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                暂无数据
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
                <CardTitle className="text-xl">今日挑战</CardTitle>
                <CardDescription className="mt-2">
                  完成今天的挑战任务，提升您的管理能力
                </CardDescription>
              </div>
              <Badge className="bg-orange-500 hover:bg-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                今天
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">挑战系统开发中</h3>
              <p className="text-sm text-muted-foreground mb-4">
                我们正在设计每日挑战任务系统，帮助您通过实际场景练习提升管理能力。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">场景挑战</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        真实管理场景模拟，锻炼实战能力
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">能力提升</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        针对性练习，持续提升薄弱环节
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">成就奖励</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        完成挑战获得积分，解锁成就徽章
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
            </Card>
          </FadeInUp>

          {/* Challenge History Placeholder */}
          <FadeInUp delay={0.3}>
            <Card>
          <CardHeader>
            <CardTitle>挑战历史</CardTitle>
            <CardDescription>
              查看您过往完成的挑战记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无挑战记录</p>
              <p className="text-sm mt-2">完成今日挑战后，记录将显示在这里</p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>挑战排行榜</CardTitle>
            <CardDescription>
              看看您在所有用户中的排名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>排行榜功能开发中</p>
              <p className="text-sm mt-2">即将支持与其他用户比拼挑战成绩</p>
            </div>
          </CardContent>
            </Card>
          </FadeInUp>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
