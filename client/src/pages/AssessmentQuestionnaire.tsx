import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { toast } from "sonner";

type QuestionWithAnswer = {
  id: number;
  competencyId: number;
  question: string;
  questionType: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  difficulty: string;
  userAnswer: number | null;
};

export default function AssessmentQuestionnaire() {
  const [, params] = useRoute("/assessment/questionnaire/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch session and questions
  const { data, isLoading, refetch } = trpc.assessment.getSessionQuestions.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  // Submit answer mutation
  const submitAnswerMutation = trpc.assessment.submitAnswer.useMutation({
    onSuccess: () => {
      toast.success("答案已保存");
      refetch(); // Refetch to get updated answer counts
    },
    onError: (error) => {
      toast.error(error.message || "保存失败，请重试");
      setIsSubmitting(false);
    },
  });

  // Complete session mutation
  const completeSessionMutation = trpc.assessment.completeSession.useMutation({
    onSuccess: () => {
      toast.success("评估已完成！正在跳转到结果页面...");
      setTimeout(() => {
        setLocation(`/assessment/results/${sessionId}`);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "完成评估失败");
      setIsSubmitting(false);
    },
  });

  // Load saved answer when question changes
  useEffect(() => {
    if (data?.questions && data.questions[currentQuestionIndex]) {
      const currentQuestion = data.questions[currentQuestionIndex];
      setSelectedAnswer(currentQuestion.userAnswer);
    }
  }, [currentQuestionIndex, data]);

  if (!sessionId) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>无效的评估会话ID</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!data || !data.questions || data.questions.length === 0) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>未找到评估题目</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const currentQuestion = data.questions[currentQuestionIndex];
  const progressPercentage = Math.round((data.answeredCount / data.totalQuestions) * 100);
  const isLastQuestion = currentQuestionIndex === data.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(parseInt(value));
  };

  const handleNext = async () => {
    // Save current answer if selected
    if (selectedAnswer !== null) {
      setIsSubmitting(true);
      try {
        await submitAnswerMutation.mutateAsync({
          sessionId: sessionId!,
          questionId: currentQuestion.id,
          competencyId: currentQuestion.competencyId,
          answer: selectedAnswer,
        });
        
        // Move to next question or complete
        if (isLastQuestion) {
          // All questions answered, complete the session
          await completeSessionMutation.mutateAsync({ sessionId: sessionId! });
        } else {
          setCurrentQuestionIndex((prev) => Math.min(prev + 1, data.questions.length - 1));
          setIsSubmitting(false);
        }
      } catch (error) {
        // Error already handled in mutation callbacks
        setIsSubmitting(false);
      }
    } else {
      toast.error("请选择一个答案");
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      toast.error("这是最后一题，请回答或返回之前的题目");
    } else {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, data.questions.length - 1));
    }
  };

  const difficultyColors = {
    easy: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    hard: "text-red-600 bg-red-50",
  };

  const difficultyLabels = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">评估进度</span>
                <span className="text-muted-foreground">
                  {data.answeredCount} / {data.totalQuestions} 题
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                已完成 {progressPercentage}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                第 {currentQuestionIndex + 1} 题 / 共 {data.totalQuestions} 题
              </CardTitle>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  difficultyColors[currentQuestion.difficulty as keyof typeof difficultyColors]
                }`}
              >
                {difficultyLabels[currentQuestion.difficulty as keyof typeof difficultyLabels]}
              </span>
            </div>
            <CardDescription className="text-base mt-4">
              {currentQuestion.question}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString() || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {[1, 2, 3, 4, 5].map((optionNum) => {
                const optionKey = `option${optionNum}` as keyof QuestionWithAnswer;
                const optionText = currentQuestion[optionKey] as string;
                
                return (
                  <div
                    key={optionNum}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent ${
                      selectedAnswer === optionNum
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedAnswer(optionNum)}
                  >
                    <RadioGroupItem
                      value={optionNum.toString()}
                      id={`option-${optionNum}`}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`option-${optionNum}`}
                      className="flex-1 cursor-pointer font-normal leading-relaxed"
                    >
                      {optionText}
                    </Label>
                    {selectedAnswer === optionNum && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            上一题
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLastQuestion || isSubmitting}
            >
              跳过
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : isLastQuestion ? (
                "完成评估"
              ) : (
                <>
                  下一题
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            💡 提示：请根据您的实际情况和真实感受选择最符合的选项。
            没有对错之分，诚实的答案才能帮助您获得准确的评估结果。
          </AlertDescription>
        </Alert>
      </div>
    </DashboardLayout>
  );
}
