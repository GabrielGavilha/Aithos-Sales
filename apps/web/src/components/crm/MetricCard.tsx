import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Metric } from "@/types";

const iconByTrend = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus
} as const;

export const MetricCard = ({ metric, index = 0 }: { metric: Metric; index?: number }) => {
  const TrendIcon = iconByTrend[metric.trend?.direction ?? "neutral"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.25 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-500">{metric.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
            {metric.trend ? (
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                <TrendIcon className="h-3.5 w-3.5" />
                {metric.trend.label}
              </p>
            ) : null}
          </div>
          {metric.helper ? <p className="mt-2 text-xs text-slate-500">{metric.helper}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
};
