import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle, Lock, KeyRound } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PageTransition, FadeInUp } from "@/components/PageTransition";

// Form schema based on profile.update input
const profileFormSchema = z.object({
  industry: z.string().min(1, "请选择行业类型"),
  companySize: z.enum(["startup", "small", "medium", "large"], {
    required_error: "请选择公司规模",
  }),
  companyStage: z.enum([
    "seed", "angel", "series_a", "series_b", "series_c", 
    "series_d", "pre_ipo", "public", "mature"
  ], {
    required_error: "请选择发展阶段",
  }),
  currentRole: z.string().min(1, "请输入当前岗位"),
  managementLevel: z.enum(["executive", "senior", "middle", "junior"], {
    required_error: "请选择管理级别",
  }),
  directReports: z.coerce.number().min(0, "直接下属人数不能为负数"),
  managementLayers: z.coerce.number().min(0, "管理层级不能为负数"),
  yearsOfManagement: z.coerce.number().min(0, "管理年限不能为负数"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const companySizeOptions = [
  { value: "startup", label: "初创（<50人）" },
  { value: "small", label: "小型（50-200人）" },
  { value: "medium", label: "中型（200-1000人）" },
  { value: "large", label: "大型（1000+人）" },
];

const companyStageOptions = [
  { value: "seed", label: "种子轮" },
  { value: "angel", label: "天使轮" },
  { value: "series_a", label: "A轮" },
  { value: "series_b", label: "B轮" },
  { value: "series_c", label: "C轮" },
  { value: "series_d", label: "D轮" },
  { value: "pre_ipo", label: "Pre-IPO" },
  { value: "public", label: "已上市" },
  { value: "mature", label: "成熟企业" },
];

const managementLevelOptions = [
  { value: "executive", label: "高管（CEO/CXO/VP）" },
  { value: "senior", label: "高级管理者（总监/高级经理）" },
  { value: "middle", label: "中层管理者（经理/主管）" },
  { value: "junior", label: "基层管理者（组长/Team Lead）" },
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.profile.get.useQuery();
  const { data: completion, refetch: refetchCompletion } = trpc.profile.getCompletion.useQuery();
  
  // Fetch industries list
  const { data: industries, isLoading: industriesLoading } = trpc.industry.list.useQuery();

  // Mutations
  const createProfile = trpc.profile.create.useMutation();
  const updateProfile = trpc.profile.update.useMutation();

  // Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      industry: "",
      companySize: "startup",
      companyStage: "seed",
      currentRole: "",
      managementLevel: "middle",
      directReports: 0,
      managementLayers: 0,
      yearsOfManagement: 0,
    },
  });

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      form.reset({
        industry: profile.industry || "",
        companySize: profile.companySize || "startup",
        companyStage: profile.companyStage || "seed",
        currentRole: profile.currentRole || "",
        managementLevel: profile.managementLevel || "middle",
        directReports: profile.directReports || 0,
        managementLayers: profile.managementLayers || 0,
        yearsOfManagement: profile.yearsOfManagement || 0,
      });
    }
  }, [profile, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      if (profile) {
        // Update existing profile
        await updateProfile.mutateAsync(values);
      } else {
        // Create new profile
        await createProfile.mutateAsync(values);
      }
      
      setSubmitSuccess(true);
      
      // Refetch data
      await refetchProfile();
      await refetchCompletion();

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setSubmitError(error?.message || "保存失败，请重试");
    }
  };

  if (profileLoading || industriesLoading) {
    return <PageSkeleton />;
  }

  const industryOptions = industries?.map(ind => ({
    value: ind.name,
    label: ind.name
  })) || [];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <FadeInUp>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">用户画像配置</h1>
                <p className="text-muted-foreground mt-2">
                  完善您的个人信息，帮助系统提供更精准的能力评估和推荐
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation('/change-password')}
                className="flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                修改密码
              </Button>
            </div>
          </FadeInUp>

        {/* Completion Alert */}
        {completion && completion.completionRate < 100 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              信息完善度：<strong>{completion.completionRate}%</strong>
              {completion.missingFields.length > 0 && (
                <>
                  {" · "}还需完善：{completion.missingFields.join("、")}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              个人信息已成功保存！
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              请填写您的职业背景和管理信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Industry */}
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>行业类型</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择行业" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries?.map((industry) => (
                            <SelectItem key={industry.id} value={industry.name}>
                              {industry.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        选择您所在的行业领域
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Size */}
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>公司规模</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        公司的员工规模
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Stage */}
                <FormField
                  control={form.control}
                  name="companyStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发展阶段</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyStageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        公司当前的融资或发展阶段
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Current Role */}
                <FormField
                  control={form.control}
                  name="currentRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>当前岗位</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：产品总监、技术经理" {...field} />
                      </FormControl>
                      <FormDescription>
                        您目前担任的职位名称
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Management Level */}
                <FormField
                  control={form.control}
                  name="managementLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>管理级别</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managementLevelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        您在组织中的管理层级
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Direct Reports */}
                <FormField
                  control={form.control}
                  name="directReports"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>直接下属人数</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        直接向您汇报的团队成员数量
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Management Layers */}
                <FormField
                  control={form.control}
                  name="managementLayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>管理层级</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        您管理的组织层级数量（包括直接和间接下属）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Years of Management */}
                <FormField
                  control={form.control}
                  name="yearsOfManagement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>管理年限</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" {...field} />
                      </FormControl>
                      <FormDescription>
                        您担任管理岗位的累计年限
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={createProfile.isPending || updateProfile.isPending}
                  >
                    重置
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProfile.isPending || updateProfile.isPending}
                  >
                    {(createProfile.isPending || updateProfile.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    保存
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
