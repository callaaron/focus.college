import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Brain,
  Lightbulb,
  Rocket
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // 如果已登录，跳转到Dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE || "创业进化系统"}</h1>
          </div>
          <Button onClick={handleLogin} size="lg">
            登录 / 注册
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          <Lightbulb className="h-3 w-3 mr-1" />
          AI驱动的能力评估平台
        </Badge>
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          系统化提升管理能力
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          基于48项核心管理能力，通过AI评估、智能推荐和持续追踪，
          帮助创业者和管理者系统性地提升能力、加速成长
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleLogin} size="lg" className="text-lg px-8">
            开始评估
            <Rocket className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            了解更多
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>能力评估</CardTitle>
              <CardDescription>
                49道精心设计的评估题目，全面覆盖8大能力域、35项核心能力
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>AI智能分析</CardTitle>
              <CardDescription>
                基于AI的深度分析，识别能力短板，提供个性化提升建议
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>成长追踪</CardTitle>
              <CardDescription>
                可视化雷达图和趋势图，直观展示能力发展轨迹和进步空间
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>智能推荐</CardTitle>
              <CardDescription>
                根据行业和职位特点，推荐最需要关注的核心能力
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10">
          <CardContent className="py-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">48+</div>
                <div className="text-muted-foreground">核心管理能力</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">20+</div>
                <div className="text-muted-foreground">覆盖行业</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">管理职位</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">如何使用</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">完成初始评估</h4>
            <p className="text-muted-foreground">
              花费15-20分钟完成初始评估问卷，建立完整的能力画像
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">查看能力分析</h4>
            <p className="text-muted-foreground">
              通过雷达图直观了解自己的能力水平，识别优势和短板
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h4 className="text-xl font-semibold mb-2">持续提升成长</h4>
            <p className="text-muted-foreground">
              根据AI推荐的学习路径，持续提升，定期回顾进步
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardContent className="py-16 text-center">
            <h3 className="text-3xl font-bold mb-4">开始你的能力提升之旅</h3>
            <p className="text-lg mb-8 opacity-90">
              加入我们，系统化地评估和提升你的管理能力
            </p>
            <Button 
              onClick={handleLogin} 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
            >
              立即开始
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 创业进化系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
