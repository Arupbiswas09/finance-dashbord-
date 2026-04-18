import { MetricBlockData } from '@/types/newsletter-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsBlockProps {
  data: MetricBlockData;
  onChange: (data: MetricBlockData) => void;
  theme: {
    primary: string;
    accent: string;
  };
}

export const MetricsBlock = ({ data, onChange, theme }: MetricsBlockProps) => {
  const updateMetric = (index: number, field: string, value: string) => {
    const updated = [...data.metrics];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ metrics: updated });
  };

  const addMetric = () => {
    onChange({
      metrics: [
        ...data.metrics,
        { label: '', value: '', change: '', trend: 'neutral' },
      ],
    });
  };

  const removeMetric = (index: number) => {
    onChange({
      metrics: data.metrics.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Metrics (3 KPIs)</Label>
        <Button size="sm" onClick={addMetric} disabled={data.metrics.length >= 3}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      {data.metrics.map((metric, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Metric {index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeMetric(index)}
              disabled={data.metrics.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Label>Label</Label>
            <Input
              value={metric.label}
              onChange={(e) => updateMetric(index, 'label', e.target.value)}
              placeholder="e.g., Revenue"
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              value={metric.value}
              onChange={(e) => updateMetric(index, 'value', e.target.value)}
              placeholder="e.g., $2.4M"
            />
          </div>
          <div>
            <Label>Change (optional)</Label>
            <Input
              value={metric.change || ''}
              onChange={(e) => updateMetric(index, 'change', e.target.value)}
              placeholder="e.g., +12%"
            />
          </div>
          <div>
            <Label>Trend</Label>
            <select
              value={metric.trend || 'neutral'}
              onChange={(e) => updateMetric(index, 'trend', e.target.value)}
              className="w-full mt-2 p-2 border rounded"
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

