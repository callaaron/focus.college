import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { PageTransition, FadeInUp } from "@/components/PageTransition";
import { toast } from "sonner";

// Assessment questions for each dimension
const assessmentQuestions = {
  strategy: [
    {
      id: "strategy_1",
      question: "企业是否有清晰的长期战略规划？",
      description: "明确的愿景、使命和3-5年战略目标",
    },
    {
      id: "strategy_2",
      question: "战略目标是否能够有效分解并落实到各部门？",
      description: "目标分解机制和执行跟踪体系",
    },
    {
      id: "strategy_3",
      question: "企业是否能够快速响应市场变化调整战略？",
      description: "战略灵活性和应变能力",
    },
    {
      id: "strategy_4",
      question: "是否有系统的竞争分析和市场洞察机制？",
      description: "市场研究、竞品分析和行业趋势把握",
    },
    {
      id: "strategy_5",
      question: "战略决策是否基于数据和分析支撑？",
      description: "数据驱动的决策文化和分析能力",
    },
  ],
  operation: [
    {
      id: "operation_1",
      question: "企业的核心业务流程是否标准化？",
      description: "流程文档化和标准化程度",
    },
    {
      id: "operation_2",
      question: "运营效率是否持续改进和优化？",
      description: "持续改进机制和效率提升",
    },
    {
      id: "operation_3",
      question: "成本管控是否有效？",
      description: "成本意识、预算管理和成本优化",
    },
    {
      id: "operation_4",
      question: "质量管理体系是否完善？",
      description: "质量标准、监控和持续改进",
    },
    {
      id: "operation_5",
      question: "供应链管理是否高效稳定？",
      description: "供应商管理、库存控制和物流优化",
    },
  ],
  organization: [
    {
      id: "organization_1",
      question: "组织架构是否支持业务发展需求？",
      description: "架构灵活性和业务适配度",
    },
    {
      id: "organization_2",
      question: "人才招聘和保留机制是否有效？",
      description: "招聘效率、员工满意度和离职率",
    },
    {
      id: "organization_3",
      question: "员工培训和发展体系是否完善？",
      description: "培训计划、职业发展路径和能力提升",
    },
    {
      id: "organization_4",
      question: "企业文化是否积极向上且被员工认同？",
      description: "价值观、文化氛围和员工敬业度",
    },
    {
      id: "organization_5",
      question: "跨部门协作是否顺畅？",
      description: "沟通机制、协作文化和团队配合",
    },
  ],
  innovation: [
    {
      id: "innovation_1",
      question: "企业是否鼓励创新和试错？",
      description: "创新文化和容错机制",
    },
    {
      id: "innovation_2",
      question: "研发投入是否足够？",
      description: "研发预算占比和资源投入",
    },
    {
      id: "innovation_3",
      question: "是否有系统的创新管理流程？",
      description: "创新项目管理和成果转化",
    },
    {
      id: "innovation_4",
      question: "企业是否关注新技术并积极应用？",
      description: "技术前瞻性和数字化转型",
    },
    {
      id: "innovation_5",
      question: "产品/服务创新能力如何？",
      description: "新产品开发和服务创新",
    },
  ],
};

type Dimension = "strategy" | "operation" | "organization" | "innovation";

const dimensions: { key: Dimension; label: string; icon: string }[] = [
  { key: "strategy", label: "战略能力", icon: "🎯" },
  { key: "operation", label: "运营能力", icon: "⚙️" },
  { key: "organization", label: "组织能力", icon: "👥" },
  { key: "innovation", label: "创新能力", icon: "💡" },
];

export default function CompanyAssessment() {
  const [, navigate] = useLocation();
  const [currentDimension, setCurrentDimension] = useState<Dimension>("strategy");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestions = assessmentQuestions[currentDimension];
  const currentDimensionIndex = dimensions.findIndex((d) => d.key === currentDimension);
  const progress = ((currentDimensionIndex + 1) / dimensions.length) * 100;

  // Check if current dimension is completed
  const isCurrentDimensionComplete = currentQuestions.every(
    (q) => answers[q.id] !== undefined
  );

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!isCurrentDimensionComplete) {
      toast.error("请完成所有问题", {
        description: "请为当前维度的所有问题打分后再继续",
      });
      return;
    }

    const nextIndex = currentDimensionIndex + 1;
    if (nextIndex < dimensions.length) {
      setCurrentDimension(dimensions[nextIndex].key);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentDimensionIndex - 1;
    if (prevIndex >= 0) {
      setCurrentDimension(dimensions[prevIndex].key);
    }
  };

  const saveMutation = trpc.organizationAssessment.save.useMutation({
    onSuccess: () => {
      toast.success("✅ 评估完成", {
        description: "企业能力评估已保存，查看您的能力看板",
      });
      navigate("/company");
    },
    onError: (error) => {
      toast.error("保存失败", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allQuestions = [
      ...assessmentQuestions.strategy,
      ...assessmentQuestions.operation,
      ...assessmentQuestions.organization,
      ...assessmentQuestions.innovation,
    ];

    const unanswered = allQuestions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      toast.error("评估未完成", {
        description: `还有 ${unanswered.length} 个问题未回答`,
      });
      return;
    }

    setIsSubmitting(true);

    // Calculate scores for each dimension
    const calculateDimensionScore = (dimension: Dimension) => {
      const questions = assessmentQuestions[dimension];
      const total = questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      return Math.round((total / (questions.length * 100)) * 100);
    };

    const strategyScore = calculateDimensionScore("strategy");
    const operationScore = calculateDimensionScore("operation");
    const organizationScore = calculateDimensionScore("organization");
    const innovationScore = calculateDimensionScore("innovation");

    // Prepare detailed scores
    const detailedScores = JSON.stringify({
      strategy: assessmentQuestions.strategy.map((q) => ({
        id: q.id,
        question: q.question,
        score: answers[q.id],
      })),
      operation: assessmentQuestions.operation.map((q) => ({
        id: q.id,
        question: q.question,
        score: answers[q.id],
      })),
      organization: assessmentQuestions.organization.map((q) => ({
        id: q.id,
        question: q.question,
        score: answers[q.id],
      })),
      innovation: assessmentQuestions.innovation.map((q) => ({
        id: q.id,
        question: q.question,
        score: answers[q.id],
      })),
    });

    saveMutation.mutate({
      strategyScore,
      operationScore,
      organizationScore,
      innovationScore,
      detailedScores,
    });
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <FadeInUp>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">企业能力评估</h1>
              <p className="text-muted-foreground mt-1">
                评估企业在四个核心维度的能力现状
              </p>
            </div>
          </FadeInUp>

          {/* Progress */}
          <FadeInUp delay={0.1}>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">评估进度</span>
                    <span className="text-sm text-muted-foreground">
                      {currentDimensionIndex + 1} / {dimensions.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {dimensions.map((dim) => (
                      <span
                        key={dim.key}
                        className={
                          dim.key === currentDimension ? "font-semibold text-primary" : ""
                        }
                      >
                        {dim.icon} {dim.label}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Questions */}
          <FadeInUp delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">
                    {dimensions[currentDimensionIndex].icon}
                  </span>
                  <span>{dimensions[currentDimensionIndex].label}</span>
                </CardTitle>
                <CardDescription>
                  请根据企业实际情况对以下问题进行评分（0-100分）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuestions.map((question, index) => {
                  const value = answers[question.id] || 0;
                  return (
                    <div key={question.id} className="space-y-3 pb-6 border-b last:border-b-0">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {question.description}
                          </p>
                        </div>
                      </div>
                      <div className="pl-8 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">当前评分:</span>
                          <span className="text-2xl font-bold text-primary">{value}</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={([v]) => handleAnswerChange(question.id, v)}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0 - 较弱</span>
                          <span>50 - 中等</span>
                          <span>100 - 优秀</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Navigation */}
          <FadeInUp delay={0.3}>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentDimensionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                上一个维度
              </Button>

              {currentDimensionIndex < dimensions.length - 1 ? (
                <Button onClick={handleNext} disabled={!isCurrentDimensionComplete}>
                  下一个维度
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isCurrentDimensionComplete}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      完成评估
                    </>
                  )}
                </Button>
              )}
            </div>
          </FadeInUp>

          {/* Info Card */}
          <FadeInUp delay={0.4}>
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold">评估提示</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      <li>请根据企业实际情况客观评分</li>
                      <li>0分表示能力非常薄弱或不具备</li>
                      <li>50分表示能力处于行业中等水平</li>
                      <li>100分表示能力处于行业领先水平</li>
                      <li>评估结果将帮助您了解企业能力现状并制定改进计划</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
