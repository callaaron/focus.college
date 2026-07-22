import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageContainer from "@/components/PageContainer";

export default function Analysis() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: profile } = trpc.profile.get.useQuery();
  const analyzeDocument = trpc.analysis.analyzeDocument.useMutation();

  const handleAnalyze = async () => {
    if (!title.trim() || !content.trim()) {
      setError("请填写标题和内容");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeDocument.mutateAsync({
        title: title.trim(),
        content: content.trim(),
      });

      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis error:", err);
      // 友好的错误提示
      if (err?.message?.includes('OPENAI_API_KEY') || err?.message?.includes('API')) {
        setError("❌ AI 分析功能需要配置 OpenAI API Key。\n\n" +
                 "💡 如何解决：\n" +
                 "1. 获取 OpenAI API Key (https://platform.openai.com/api-keys)\n" +
                 "2. 在 .env 文件中配置 OPENAI_API_KEY\n" +
                 "3. 重启服务器\n\n" +
                 "📝 暂时可以使用其他功能：能力评估、能力看板、成长历程等");
      } else {
        setError(err?.message || "分析失败，请重试");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <DashboardLayout>
      <PageContainer pageTitle="综合分析" pageDescription="上传工作文档，AI 将分析您的管理能力表现">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Info Alert */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>AI能力分析：</strong>
              上传您的会议记录、项目总结、团队汇报等工作文档，系统将使用AI深度分析文档中体现的管理能力，
              并给出L1-L5的专业评级和改进建议。
            </AlertDescription>
          </Alert>

          {/* Analysis Form */}
          <Card>
            <CardHeader>
              <CardTitle>上传分析文档</CardTitle>
              <CardDescription>
                请提供您的工作文档内容，支持会议记录、项目复盘、团队汇报等
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">文档标题</Label>
                <Input
                  id="title"
                  placeholder="例如：Q4产品规划会议记录"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">文档内容</Label>
                <Textarea
                  id="content"
                  placeholder="请粘贴您的文档内容...&#10;&#10;例如：&#10;会议时间：2024-01-15&#10;参会人员：产品团队、技术团队&#10;会议议题：Q4产品路线图规划&#10;&#10;讨论内容：&#10;1. 市场分析...&#10;2. 用户需求...&#10;3. 技术方案...&#10;"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={analyzing}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  建议提供详细的文档内容，包含完整的背景、过程和结果，以获得更准确的分析
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !title.trim() || !content.trim()}
                  className="flex-1"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      开始分析
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={analyzing}
                >
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Overall Score */}
              <Card className="@container/card bg-gradient-to-t from-primary/5 to-card dark:from-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>综合评分</CardTitle>
                      <CardDescription>
                        基于文档内容的整体能力评估
                      </CardDescription>
                    </div>
                    <div className="text-4xl font-bold text-primary tabular-nums">
                      {analysisResult.overallScore}
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Identified Competencies */}
              <Card>
                <CardHeader>
                  <CardTitle>识别的管理能力</CardTitle>
                  <CardDescription>
                    从文档中分析出的具体管理能力表现
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.competencies.map((comp: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-base">{comp.name}</CardTitle>
                                <Badge variant="outline">{comp.category}</Badge>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-2xl font-bold text-primary tabular-nums">
                                {comp.score}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                L{comp.level}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              证据分析
                            </h4>
                            <p className="text-sm text-muted-foreground pl-6">
                              {comp.evidence}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              提升建议
                            </h4>
                            <p className="text-sm text-muted-foreground pl-6">
                              {comp.suggestion}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>综合评价</CardTitle>
                  <CardDescription>
                    AI对您管理能力的整体分析和建议
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {analysisResult.summary}
                  </div>
                </CardContent>
              </Card>

              {/* Success Message */}
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  分析完成！您的能力评分已自动更新到能力看板。
                  <Button
                    variant="link"
                    className="ml-2 h-auto p-0 text-green-700 hover:text-green-900"
                    onClick={() => window.location.href = '/competencies'}
                  >
                    查看能力看板 →
                  </Button>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Examples */}
          {!analysisResult && !analyzing && (
            <Card>
              <CardHeader>
                <CardTitle>使用示例</CardTitle>
                <CardDescription>
                  以下是一些适合分析的文档类型
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-blue-600" />
                      会议记录
                    </div>
                    <p className="text-xs text-muted-foreground">
                      团队会议、项目评审会、战略规划会等会议的完整记录
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      项目总结
                    </div>
                    <p className="text-xs text-muted-foreground">
                      项目复盘报告、阶段性总结、经验教训文档
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Award className="h-4 w-4 text-purple-600" />
                      工作汇报
                    </div>
                    <p className="text-xs text-muted-foreground">
                      周报、月报、季度总结等定期工作汇报
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
