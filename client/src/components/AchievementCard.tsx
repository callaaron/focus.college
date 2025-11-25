import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy, Star, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    category: 'streak' | 'count' | 'accuracy' | 'special';
    requirement: number;
    points: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  unlocked: boolean;
  unlockedAt?: string | null;
  progress?: number; // 0-100
}

const rarityConfig = {
  common: {
    bg: "bg-gray-100 dark:bg-gray-900",
    border: "border-gray-300 dark:border-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-500",
  },
  rare: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500",
  },
  epic: {
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-500",
  },
  legendary: {
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-500",
  },
};

const categoryIcons = {
  streak: Flame,
  count: Target,
  accuracy: Trophy,
  special: Star,
};

export default function AchievementCard({ 
  achievement, 
  unlocked, 
  unlockedAt,
  progress = 0 
}: AchievementCardProps) {
  const config = rarityConfig[achievement.rarity];
  const CategoryIcon = categoryIcons[achievement.category];
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        config.border,
        unlocked 
          ? `${config.bg} hover:scale-105 hover:shadow-lg` 
          : "bg-muted/30 opacity-60 hover:opacity-80"
      )}
    >
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2">
        <Badge 
          className={cn(config.badge, "text-xs text-white")}
          variant="default"
        >
          {achievement.rarity}
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon/Emoji */}
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center text-4xl",
            unlocked ? config.bg : "bg-muted"
          )}>
            {unlocked ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
          </div>

          {/* Name */}
          <h3 className={cn(
            "font-bold text-lg",
            unlocked ? config.text : "text-muted-foreground"
          )}>
            {achievement.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>

          {/* Progress Bar (for unlocked achievements) */}
          {!unlocked && progress > 0 && (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", config.badge)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Date */}
          {unlocked && unlockedAt && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              解锁于 {new Date(unlockedAt).toLocaleDateString('zh-CN')}
            </div>
          )}

          {/* Category & Points */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CategoryIcon className="h-3 w-3" />
              <span className="capitalize">{achievement.category}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="h-3 w-3 fill-yellow-600" />
              <span>{achievement.points} 积分</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Shine Effect for Unlocked Achievements */}
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
      )}
    </Card>
  );
}
