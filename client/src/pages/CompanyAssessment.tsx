import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, Info } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { toast } from "sonner";

// 8 域评估问题，对齐 DB competencyDomains 的 8 个能力域
const assessmentQuestions = {
  strategic_leadership: [
    { id: "sl_1", question: "企业是否有清晰的长期战略规划？", description: "明确的愿景、使命和3-5年战略目标" },
    { id: "sl_2", question: "战略目标是否能够有效分解并落实到各部门？", description: "目标分解机制和执行跟踪体系" },
    { id: "sl_3", question: "企业是否能够快速响应市场变化调整战略？", description: "战略灵活性和应变能力" },
    { id: "sl_4", question: "是否有系统的竞争分析和市场洞察机制？", description: "市场研究、竞品分析和行业趋势把握" },
    { id: "sl_5", question: "战略决策是否基于数据和分析支撑？", description: "数据驱动的决策文化和分析能力" },
  ],
  product_innovation: [
    { id: "pi_1", question: "企业是否鼓励创新和试错？", description: "创新文化和容错机制" },
    { id: "pi_2", question: "研发投入是否足够？", description: "研发预算占比和资源投入" },
    { id: "pi_3", question: "是否有系统的创新管理流程？", description: "创新项目管理和成果转化" },
    { id: "pi_4", question: "产品/服务创新能力如何？", description: "新产品开发和服务创新" },
    { id: "pi_5", question: "是否关注新技术并积极应用？", description: "技术前瞻性和数字化转型" },
  ],
  marketing: [
    { id: "mk_1", question: "品牌定位是否清晰且被目标客户认知？", description: "品牌知名度、品牌价值和市场认知度" },
    { id: "mk_2", question: "营销渠道是否多元且高效？", description: "线上/线下渠道布局和转化效率" },
    { id: "mk_3", question: "客户获取成本是否合理可控？", description: "获客成本、ROI和营销投放效率" },
    { id: "mk_4", question: "是否有完善的客户关系管理体系？", description: "CRM系统、客户分层和忠诚度管理" },
    { id: "mk_5", question: "市场推广内容是否具有传播力和影响力？", description: "内容营销、社交媒体和口碑传播" },
  ],
  team_management: [
    { id: "tm_1", question: "组织架构是否支持业务发展需求？", description: "架构灵活性和业务适配度" },
    { id: "tm_2", question: "人才招聘和保留机制是否有效？", description: "招聘效率、员工满意度和离职率" },
    { id: "tm_3", question: "员工培训和发展体系是否完善？", description: "培训计划、职业发展路径和能力提升" },
    { id: "tm_4", question: "企业文化是否积极向上且被员工认同？", description: "价值观、文化氛围和员工敬业度" },
    { id: "tm_5", question: "跨部门协作是否顺畅？", description: "沟通机制、协作文化和团队配合" },
  ],
  operations_management: [
    { id: "om_1", question: "企业的核心业务流程是否标准化？", description: "流程文档化和标准化程度" },
    { id: "om_2", question: "运营效率是否持续改进和优化？", description: "持续改进机制和效率提升" },
    { id: "om_3", question: "成本管控是否有效？", description: "成本意识、预算管理和成本优化" },
    { id: "om_4", question: "质量管理体系是否完善？", description: "质量标准、监控和持续改进" },
    { id: "om_5", question: "供应链管理是否高效稳定？", description: "供应商管理、库存控制和物流优化" },
  ],
  financial_capability: [
    { id: "fc_1", question: "企业现金流是否健康稳定？", description: "现金流管理、资金周转和流动性" },
    { id: "fc_2", question: "财务预算和预测体系是否完善？", description: "预算编制、执行监控和偏差分析" },
    { id: "fc_3", question: "融资能力和资本结构是否合理？", description: "融资渠道、资本成本和财务杠杆" },
    { id: "fc_4", question: "财务风险管控是否到位？", description: "风险识别、内控制度和合规管理" },
    { id: "fc_5", question: "投资回报分析是否科学？", description: "项目评估、ROI分析和资本配置效率" },
  ],
  resource_integration: [
    { id: "ri_1", question: "是否拥有稳定的战略合作伙伴关系？", description: "合作伙伴网络、生态圈建设和互利共赢" },
    { id: "ri_2", question: "外部资源整合能力如何？", description: "政府关系、行业资源和社会资本运用" },
    { id: "ri_3", question: "产业链上下游协同是否高效？", description: "供应链整合、产业链布局和协同效应" },
    { id: "ri_4", question: "是否善于利用外部专业服务？", description: "咨询、法务、财税等外部专业资源利用" },
    { id: "ri_5", question: "跨界合作和资源置换能力如何？", description: "跨界整合、异业合作和资源创新配置" },
  ],
  entrepreneurial_mindset: [
    { id: "em_1", question: "团队是否保持创业激情和紧迫感？", description: "创业精神、使命驱动和奋斗文化" },
    { id: "em_2", question: "是否敢于挑战行业惯例和突破舒适区？", description: "颠覆思维、冒险精神和创新勇气" },
    { id: "em_3", question: "对市场机会的敏锐度和执行力如何？", description: "机会识别、快速决策和行动力" },
    { id: "em_4", question: "面对挫折和失败的恢复能力如何？", description: "韧性、抗压能力和从失败中学习" },
    { id: "em_5", question: "是否持续学习和自我迭代？", description: "学习型组织、知识管理和持续进化" },
  ],
} as const;

type DomainKey = keyof typeof assessmentQuestions;

const dimensions: { key: DomainKey; label: string; icon: string }[] = [
  { key: "strategic_leadership", label: "战略领导力", icon: "🎯" },
  { key: "product_innovation", label: "产品创新", icon: "💡" },
  { key: "marketing", label: "市场营销", icon: "📣" },
  { key: "team_management", label: "团队管理", icon: "👥" },
  { key: "operations_management", label: "运营管理", icon: "⚙️" },
  { key: "financial_capability", label: "财务能力", icon: "💰" },
  { key: "resource_integration", label: "资源整合", icon: "🤝" },
  { key: "entrepreneurial_mindset", label: "创业心态", icon: "🚀" },
];

export default function CompanyAssessment() {
  const [, navigate] = useLocation();
  const [currentDimension, setCurrentDimension] = useState<DomainKey>("strategic_leadership");
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
    const allQuestions = dimensions.flatMap((d) => assessmentQuestions[d.key]);
    const unanswered = allQuestions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      toast.error("评估未完成", {
        description: `还有 ${unanswered.length} 个问题未回答`,
      });
      return;
    }

    setIsSubmitting(true);

    // Calculate scores for each of the 8 domains
    const calculateDomainScore = (domain: DomainKey) => {
      const questions = assessmentQuestions[domain];
      const total = questions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
      return Math.round((total / (questions.length * 100)) * 100);
    };

    // Build domain scores object
    const domainScores: Record<string, number> = {};
    dimensions.forEach((d) => {
      domainScores[d.key] = calculateDomainScore(d.key);
    });

    // Map 4 of the 8 domains to the schema's fixed columns (for backward compatibility)
    const strategyScore = domainScores["strategic_leadership"];
    const operationScore = domainScores["operations_management"];
    const organizationScore = domainScores["team_management"];
    const innovationScore = domainScores["product_innovation"];

    // Store all 8 domain scores + question-level details in detailedScores JSON
    const detailedScores = JSON.stringify({
      domainScores,
      questions: dimensions.map((d) => ({
        domain: d.key,
        domainLabel: d.label,
        answers: assessmentQuestions[d.key].map((q) => ({
          id: q.id,
          question: q.question,
          score: answers[q.id],
        })),
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
      <PageContainer pageTitle="企业能力评估" pageDescription="评估企业在 8 个核心能力域的现状" className="max-w-4xl">
        <div className="space-y-5">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">评估进度</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {currentDimensionIndex + 1} / {dimensions.length}
                  </span>
                </div>
                <Progress value={progress} />
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

          {/* Questions */}
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
                        <span className="text-2xl font-bold text-primary tabular-nums">{value}</span>
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

          {/* Navigation */}
          <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentDimensionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                上一域
              </Button>

              {currentDimensionIndex < dimensions.length - 1 ? (
                <Button onClick={handleNext} disabled={!isCurrentDimensionComplete}>
                  下一域
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

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold">评估提示</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>共 8 个能力域、40 道题，覆盖企业核心能力全景</li>
                    <li>0分表示能力非常薄弱或不具备</li>
                    <li>50分表示能力处于行业中等水平</li>
                    <li>100分表示能力处于行业领先水平</li>
                    <li>评估结果将帮助您了解企业能力现状并制定改进计划</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
