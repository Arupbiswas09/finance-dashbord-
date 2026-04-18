import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Database, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface YukiRawDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
}

interface QuarterData {
  quarter: number;
  quarter_label: string;
  year: number;
  cumulative_summary: any;
  quarterly_summary: any;
  quarterly_accounts: any[];
  cumulative_accounts: any[];
  categorized_accounts: any;
}

interface ComprehensiveRawData {
  report_period: string;
  quarters_included: number;
  all_quarters: QuarterData[];
  yuki_administration_id: string;
  generated_at: string;
}

export function YukiRawDataModal({ open, onOpenChange, reportId }: YukiRawDataModalProps) {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [rawData, setRawData] = useState<ComprehensiveRawData | null>(null);
  const [dataType, setDataType] = useState<'comprehensive' | 'legacy'>('comprehensive');
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('overview');
  const { toast } = useToast();

  useEffect(() => {
    if (open && reportId) {
      fetchRawData();
    }
  }, [open, reportId]);

  const fetchRawData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      // buildApiUrl('/api/dashboard/stats'), { headers }
      const response = await fetch(`http://localhost:8000/api/reports/${reportId}/yuki-raw-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch raw Yuki data');
      }

      const data = await response.json();

      if (data.has_raw_data) {
        setHasData(true);
        setRawData(data.raw_data);
        setDataType(data.data_type || 'comprehensive');

        // Set overview as default selected
        setSelectedQuarter('overview');
      } else {
        setHasData(false);
        setError(data.message || 'No raw data available');
      }
    } catch (err) {
      console.error('Error fetching raw Yuki data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch raw data');
      toast({
        title: "Error",
        description: "Failed to fetch raw Yuki data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const downloadAsJson = () => {
    if (!rawData) return;

    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw_data_report_${reportId}_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Raw data downloaded as JSON file"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // --- Helper: compute inputs used by rule-based recommendations ---
  const computeRuleBasedInputs = () => {
    if (!rawData || !rawData.all_quarters || rawData.all_quarters.length === 0) return null;

    const last = rawData.all_quarters[rawData.all_quarters.length - 1];
    const cumulative = last.cumulative_accounts || [];
    const cumulativeSummary = last.cumulative_summary || {};

    const sumByCodeStarts = (codes: string[]) =>
      cumulative
        .filter((acc: any) => acc.code && codes.some((p) => String(acc.code).startsWith(p)))
        .reduce((sum: number, acc: any) => sum + Math.abs(acc.amount || 0), 0);

    const sumByExactCodes = (codes: string[]) =>
      cumulative
        .filter((acc: any) => acc.code && codes.includes(String(acc.code)))
        .reduce((sum: number, acc: any) => sum + Math.abs(acc.amount || 0), 0);

    const findByExactCode = (code: string) =>
      cumulative.find((acc: any) => String(acc.code) === code);

    const listByCodeStarts = (prefix: string) =>
      cumulative
        .filter((acc: any) => acc.code && String(acc.code).startsWith(prefix))
        .map((acc: any) => ({ code: String(acc.code), description: acc.description, amount: Math.abs(acc.amount || 0) }));

    // Inputs
    const advance_payment_total = sumByCodeStarts(['67']);
    const pension_investment_total = sumByCodeStarts(['618']);
    const bank_balance = sumByCodeStarts(['55']);

    // Average quarterly expenses from quarterly summaries
    const avg_expenses = (() => {
      const totals = rawData.all_quarters.map((q: any) => Math.abs(q.quarterly_summary?.total_expenses || 0));
      if (!totals.length) return 0;
      return totals.reduce((a: number, b: number) => a + b, 0) / totals.length;
    })();

    const supplier_debts_total = sumByCodeStarts(['44']);

    const restaurant_acc = findByExactCode('616680');
    const restaurant_amount = Math.abs(restaurant_acc?.amount || 0);

    const representation_acc = findByExactCode('616500');
    const representation_amount = Math.abs(representation_acc?.amount || 0);

    const revenue_total = Math.abs(cumulativeSummary?.total_revenue || 0);

    const sum_133xx = sumByCodeStarts(['133']);
    const sum_14xx = sumByCodeStarts(['14']);
    const gross_dividend = Math.max(0, sum_133xx - sum_14xx);

    const rc_account = cumulative.find((acc: any) => {
      const code = String(acc.code || '');
      const desc = String(acc.description || '').toUpperCase();
      return desc.includes('R/C') || code.toUpperCase().includes('R/C');
    });
    const rc_amount = Math.abs(rc_account?.amount || 0);

    return {
      advance_payment_total,
      pension_investment_total,
      bank_balance,
      avg_expenses,
      supplier_debts_total,
      restaurant_amount,
      representation_amount,
      revenue_total,
      sum_133xx,
      sum_14xx,
      gross_dividend,
      rc_amount,
      advance_payment_accounts: listByCodeStarts('67'),
      pension_investment_accounts: listByCodeStarts('618')
    };
  };

  const renderRuleBasedInputs = () => {
    const inputs = computeRuleBasedInputs();
    if (!inputs) return null;

    const rows = [
      { label: 'Advance payments total (67xxxx)', value: formatCurrency(inputs.advance_payment_total) },
      { label: 'Pension/Investments total (618xxx)', value: formatCurrency(inputs.pension_investment_total) },
      { label: 'Bank balance (55xxxx)', value: formatCurrency(inputs.bank_balance) },
      { label: 'Average quarterly expenses', value: formatCurrency(inputs.avg_expenses) },
      { label: 'Supplier debts (44xxxx)', value: formatCurrency(inputs.supplier_debts_total) },
      { label: 'Restaurant expenses (616680)', value: formatCurrency(inputs.restaurant_amount) },
      { label: 'Representation expenses (616500)', value: formatCurrency(inputs.representation_amount) },
      { label: 'Revenue (YTD cumulative)', value: formatCurrency(inputs.revenue_total) },
      { label: 'Dividend capacity (133xx - 14xx)', value: `${formatCurrency(inputs.sum_133xx)} - ${formatCurrency(inputs.sum_14xx)} = ${formatCurrency(inputs.gross_dividend)}` },
      { label: 'R/C ledger amount', value: formatCurrency(inputs.rc_amount) }
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rule-based Inputs (Derived from Raw Data)</CardTitle>
            <p className="text-sm text-gray-600">These are the metrics used to compute the rule-based recommendations.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-medium text-gray-600">{r.label}</td>
                      <td className="p-3 text-right">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advance Payment Accounts (67xxxx)</span>
                <Badge variant="outline">{inputs.advance_payment_accounts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputs.advance_payment_accounts.map((acc: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono">{acc.code}</td>
                        <td className="p-2">{acc.description}</td>
                        <td className="p-2 text-right">{formatCurrency(acc.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pension/Investment Accounts (618xxx)</span>
                <Badge variant="outline">{inputs.pension_investment_accounts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputs.pension_investment_accounts.map((acc: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono">{acc.code}</td>
                        <td className="p-2">{acc.description}</td>
                        <td className="p-2 text-right">{formatCurrency(acc.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    if (!rawData || !rawData.all_quarters) return null;

    return (
      <div className="space-y-6">
        {/* Overview Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Quarters Overview - Quarterly Values</CardTitle>
            <p className="text-sm text-gray-600">Comparing quarterly performance across all periods</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">Quarter</th>
                    <th className="text-right p-3 font-semibold">Revenue</th>
                    <th className="text-right p-3 font-semibold">Expenses</th>
                    <th className="text-right p-3 font-semibold">Net Profit</th>
                    <th className="text-right p-3 font-semibold">Margin %</th>
                    <th className="text-right p-3 font-semibold">Assets</th>
                    <th className="text-right p-3 font-semibold">Liabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.all_quarters.map((quarter, idx) => {
                    const q = quarter.quarterly_summary;
                    return (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{quarter.quarter_label}</td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          {formatCurrency(q?.total_revenue || 0)}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          {formatCurrency(q?.total_expenses || 0)}
                        </td>
                        <td className={`p-3 text-right font-bold ${(q?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(q?.net_profit || 0)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {(q?.profit_margin || 0).toFixed(1)}%
                        </td>
                        <td className="p-3 text-right text-blue-600 font-medium">
                          {formatCurrency(q?.total_assets || 0)}
                        </td>
                        <td className="p-3 text-right text-orange-600 font-medium">
                          {formatCurrency((q?.total_liabilities || 0) + (q?.total_equity || 0))}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="border-t-2 bg-blue-50 font-bold">
                    <td className="p-3">Total (All Quarters)</td>
                    <td className="p-3 text-right text-green-700">
                      {formatCurrency(rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.total_revenue || 0), 0))}
                    </td>
                    <td className="p-3 text-right text-red-700">
                      {formatCurrency(rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.total_expenses || 0), 0))}
                    </td>
                    <td className="p-3 text-right text-green-700">
                      {formatCurrency(rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.net_profit || 0), 0))}
                    </td>
                    <td className="p-3 text-right">
                      {(() => {
                        const totalRev = rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.total_revenue || 0), 0);
                        const totalProfit = rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.net_profit || 0), 0);
                        return totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0.0';
                      })()}%
                    </td>
                    <td className="p-3 text-right text-blue-700">
                      {formatCurrency(rawData.all_quarters[rawData.all_quarters.length - 1]?.quarterly_summary?.total_assets || 0)}
                    </td>
                    <td className="p-3 text-right text-orange-700">
                      {(() => {
                        const lastQ = rawData.all_quarters[rawData.all_quarters.length - 1]?.quarterly_summary;
                        return formatCurrency((lastQ?.total_liabilities || 0) + (lastQ?.total_equity || 0));
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Rule-based Inputs */}
        {renderRuleBasedInputs()}

        {/* Quarterly Comparison Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue & Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rawData.all_quarters.map((quarter, idx) => {
                  const q = quarter.quarterly_summary;
                  const maxVal = Math.max(
                    ...rawData.all_quarters.map(q => Math.max(q.quarterly_summary?.total_revenue || 0, q.quarterly_summary?.total_expenses || 0))
                  );
                  const revWidth = ((q?.total_revenue || 0) / maxVal) * 100;
                  const expWidth = ((q?.total_expenses || 0) / maxVal) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="text-xs font-medium text-gray-600">{quarter.quarter_label}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-gray-500">Revenue</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-green-500 h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                              style={{ width: `${revWidth}%` }}
                            >
                              {revWidth > 20 && formatCurrency(q?.total_revenue || 0)}
                            </div>
                          </div>
                          {revWidth <= 20 && <span className="text-xs font-medium">{formatCurrency(q?.total_revenue || 0)}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-gray-500">Expenses</div>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-red-500 h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                              style={{ width: `${expWidth}%` }}
                            >
                              {expWidth > 20 && formatCurrency(q?.total_expenses || 0)}
                            </div>
                          </div>
                          {expWidth <= 20 && <span className="text-xs font-medium">{formatCurrency(q?.total_expenses || 0)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Net Profit by Quarter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rawData.all_quarters.map((quarter, idx) => {
                  const q = quarter.quarterly_summary;
                  const profits = rawData.all_quarters.map(q => q.quarterly_summary?.net_profit || 0);
                  const maxProfit = Math.max(...profits.map(Math.abs));
                  const profit = q?.net_profit || 0;
                  const profitWidth = (Math.abs(profit) / maxProfit) * 100;
                  const isPositive = profit >= 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="text-xs font-medium text-gray-600">{quarter.quarter_label}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`${isPositive ? 'bg-green-500' : 'bg-red-500'} h-full flex items-center justify-end pr-2 text-xs text-white font-bold`}
                            style={{ width: `${profitWidth}%` }}
                          >
                            {profitWidth > 25 && formatCurrency(profit)}
                          </div>
                        </div>
                        {profitWidth <= 25 && (
                          <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cumulative View */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Year-to-Date View</CardTitle>
            <p className="text-sm text-gray-600">Running totals from Q1 onwards</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">Period</th>
                    <th className="text-right p-3 font-semibold">Cumulative Revenue</th>
                    <th className="text-right p-3 font-semibold">Cumulative Expenses</th>
                    <th className="text-right p-3 font-semibold">Cumulative Profit</th>
                    <th className="text-right p-3 font-semibold">YTD Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.all_quarters.map((quarter, idx) => {
                    const c = quarter.cumulative_summary;
                    return (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">Jan - {quarter.quarter_label}</td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          {formatCurrency(c?.total_revenue || 0)}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          {formatCurrency(c?.total_expenses || 0)}
                        </td>
                        <td className={`p-3 text-right font-bold ${(c?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(c?.net_profit || 0)}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {(c?.profit_margin || 0).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Account-wise Bifurcation - Revenue Accounts */}
        {(() => {
          // Collect all unique revenue accounts across all quarters
          const allRevenueAccounts = new Map<string, { code: string; description: string; quarterlyAmounts: number[] }>();

          rawData.all_quarters.forEach((quarter, qIdx) => {
            const revenueAccounts = quarter.quarterly_accounts?.filter((acc: any) => acc.code?.startsWith('7')) || [];
            revenueAccounts.forEach((acc: any) => {
              if (!allRevenueAccounts.has(acc.code)) {
                allRevenueAccounts.set(acc.code, {
                  code: acc.code,
                  description: acc.description,
                  quarterlyAmounts: new Array(rawData.all_quarters.length).fill(0)
                });
              }
              allRevenueAccounts.get(acc.code)!.quarterlyAmounts[qIdx] = Math.abs(acc.amount || 0);
            });
          });

          if (allRevenueAccounts.size === 0) return null;

          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Revenue Accounts (Code 7x) - All Quarters Bifurcation</span>
                  <Badge variant="outline">{allRevenueAccounts.size} accounts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="text-left p-2 font-semibold sticky left-0 bg-green-50">Code</th>
                        <th className="text-left p-2 font-semibold min-w-[200px]">Description</th>
                        {rawData.all_quarters.map((quarter, idx) => (
                          <th key={idx} className="text-right p-2 font-semibold whitespace-nowrap">
                            {quarter.quarter_label}
                          </th>
                        ))}
                        <th className="text-right p-2 font-semibold bg-green-100 whitespace-nowrap">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(allRevenueAccounts.values())
                        .sort((a, b) => a.code.localeCompare(b.code))
                        .map((account, idx) => {
                          const total = account.quarterlyAmounts.reduce((sum, amt) => sum + amt, 0);
                          return (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="p-2 font-mono text-xs sticky left-0 bg-white">{account.code}</td>
                              <td className="p-2 text-xs">{account.description}</td>
                              {account.quarterlyAmounts.map((amount, qIdx) => (
                                <td key={qIdx} className="p-2 text-right font-medium text-xs whitespace-nowrap">
                                  {amount > 0 ? formatCurrency(amount) : '-'}
                                </td>
                              ))}
                              <td className="p-2 text-right font-bold bg-green-50 whitespace-nowrap">
                                {formatCurrency(total)}
                              </td>
                            </tr>
                          );
                        })}
                      <tr className="border-t-2 bg-green-100 font-bold">
                        <td className="p-2" colSpan={2}>Total Revenue</td>
                        {rawData.all_quarters.map((quarter, idx) => (
                          <td key={idx} className="p-2 text-right">
                            {formatCurrency(quarter.quarterly_summary?.total_revenue || 0)}
                          </td>
                        ))}
                        <td className="p-2 text-right bg-green-200">
                          {formatCurrency(rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.total_revenue || 0), 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Account-wise Bifurcation - Expense Accounts */}
        {(() => {
          // Collect all unique expense accounts across all quarters
          const allExpenseAccounts = new Map<string, { code: string; description: string; quarterlyAmounts: number[] }>();

          rawData.all_quarters.forEach((quarter, qIdx) => {
            const expenseAccounts = quarter.quarterly_accounts?.filter((acc: any) => acc.code?.startsWith('6')) || [];
            expenseAccounts.forEach((acc: any) => {
              if (!allExpenseAccounts.has(acc.code)) {
                allExpenseAccounts.set(acc.code, {
                  code: acc.code,
                  description: acc.description,
                  quarterlyAmounts: new Array(rawData.all_quarters.length).fill(0)
                });
              }
              allExpenseAccounts.get(acc.code)!.quarterlyAmounts[qIdx] = acc.amount || 0;
            });
          });

          if (allExpenseAccounts.size === 0) return null;

          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Expense Accounts (Code 6x) - All Quarters Bifurcation</span>
                  <Badge variant="outline">{allExpenseAccounts.size} accounts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="text-left p-2 font-semibold sticky left-0 bg-red-50">Code</th>
                        <th className="text-left p-2 font-semibold min-w-[200px]">Description</th>
                        {rawData.all_quarters.map((quarter, idx) => (
                          <th key={idx} className="text-right p-2 font-semibold whitespace-nowrap">
                            {quarter.quarter_label}
                          </th>
                        ))}
                        <th className="text-right p-2 font-semibold bg-red-100 whitespace-nowrap">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(allExpenseAccounts.values())
                        .sort((a, b) => a.code.localeCompare(b.code))
                        .map((account, idx) => {
                          const total = account.quarterlyAmounts.reduce((sum, amt) => sum + amt, 0);
                          return (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="p-2 font-mono text-xs sticky left-0 bg-white">{account.code}</td>
                              <td className="p-2 text-xs">{account.description}</td>
                              {account.quarterlyAmounts.map((amount, qIdx) => (
                                <td key={qIdx} className="p-2 text-right font-medium text-xs whitespace-nowrap">
                                  {amount > 0 ? formatCurrency(amount) : '-'}
                                </td>
                              ))}
                              <td className="p-2 text-right font-bold bg-red-50 whitespace-nowrap">
                                {formatCurrency(total)}
                              </td>
                            </tr>
                          );
                        })}
                      <tr className="border-t-2 bg-red-100 font-bold">
                        <td className="p-2" colSpan={2}>Total Expenses</td>
                        {rawData.all_quarters.map((quarter, idx) => (
                          <td key={idx} className="p-2 text-right">
                            {formatCurrency(quarter.quarterly_summary?.total_expenses || 0)}
                          </td>
                        ))}
                        <td className="p-2 text-right bg-red-200">
                          {formatCurrency(rawData.all_quarters.reduce((sum, q) => sum + (q.quarterly_summary?.total_expenses || 0), 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    );
  };

  const renderQuarterData = (quarterData: QuarterData) => {
    const quarterly = quarterData.quarterly_summary;
    const cumulative = quarterData.cumulative_summary;
    const accounts = quarterData.quarterly_accounts || [];

    // Categorize accounts
    const categorized = {
      revenue: accounts.filter((acc: any) => acc.code?.startsWith('7')),
      expenses: accounts.filter((acc: any) => acc.code?.startsWith('6')),
      assets: accounts.filter((acc: any) => ['2', '3', '4', '5'].some(d => acc.code?.startsWith(d))),
      liabilities: accounts.filter((acc: any) => acc.code?.startsWith('1') || acc.code?.startsWith('4')),
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards - Quarterly vs Cumulative */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Quarterly Values ({quarterData.quarter_label})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue:</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(quarterly?.total_revenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expenses:</span>
                <span className="text-sm font-bold text-red-600">{formatCurrency(quarterly?.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net Profit:</span>
                <span className={`text-sm font-bold ${(quarterly?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(quarterly?.net_profit || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profit Margin:</span>
                <span className="text-sm font-bold">{(quarterly?.profit_margin || 0).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Cumulative YTD (Jan - {quarterData.quarter_label})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue:</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(cumulative?.total_revenue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expenses:</span>
                <span className="text-sm font-bold text-red-600">{formatCurrency(cumulative?.total_expenses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net Profit:</span>
                <span className={`text-sm font-bold ${(cumulative?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cumulative?.net_profit || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profit Margin:</span>
                <span className="text-sm font-bold">{(cumulative?.profit_margin || 0).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance Sheet */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(quarterly?.total_assets || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Liabilities & Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency((quarterly?.total_liabilities || 0) + (quarterly?.total_equity || 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Accounts Table */}
        {categorized.revenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Revenue Accounts (Code 7x) - Quarterly</span>
                <Badge variant="outline">{categorized.revenue.length} accounts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium">Code</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorized.revenue
                      .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''))
                      .map((account: any, idx: number) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="p-2 font-mono text-xs">{account.code}</td>
                          <td className="p-2">{account.description}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(Math.abs(account.amount || 0))}</td>
                        </tr>
                      ))}
                    <tr className="border-t-2 bg-green-50 font-bold">
                      <td className="p-2" colSpan={2}>Total Revenue</td>
                      <td className="p-2 text-right">{formatCurrency(quarterly?.total_revenue || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expense Accounts Table */}
        {categorized.expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Expense Accounts (Code 6x) - Quarterly</span>
                <Badge variant="outline">{categorized.expenses.length} accounts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium">Code</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="text-right p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorized.expenses
                      .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''))
                      .map((account: any, idx: number) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="p-2 font-mono text-xs">{account.code}</td>
                          <td className="p-2">{account.description}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(account.amount || 0)}</td>
                        </tr>
                      ))}
                    <tr className="border-t-2 bg-amber-50 font-bold">
                      <td className="p-2" colSpan={2}>Total Expenses</td>
                      <td className="p-2 text-right">{formatCurrency(quarterly?.total_expenses || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Raw Financial Data - Report #{reportId}
          </DialogTitle>
          <DialogDescription>
            {dataType === 'comprehensive'
              ? 'Comprehensive quarterly data with calculations for all quarters'
              : 'Legacy Yuki API response data'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Loading raw data...</p>
              </div>
            </div>
          )}

          {!loading && error && !hasData && (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-500" />
                    <h3 className="font-semibold text-lg">No Raw Data Available</h3>
                    <p className="text-sm text-gray-600">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && hasData && rawData && dataType === 'comprehensive' && (
            <>
              {/* Header Info */}
              <div className="flex-shrink-0 grid grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-500">Report Period</div>
                    <div className="text-sm font-medium">{rawData.report_period}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-500">Quarters Included</div>
                    <Badge variant="default">{rawData.quarters_included}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-xs text-gray-500">Generated At</div>
                    <div className="text-sm font-medium">{new Date(rawData.generated_at).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(rawData, null, 2), 'Complete data')}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadAsJson}>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quarterly Tabs */}
              <Tabs value={selectedQuarter} onValueChange={(v) => setSelectedQuarter(v)} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="flex-shrink-0 w-full justify-start">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  {rawData.all_quarters?.map((quarter, idx) => (
                    <TabsTrigger key={idx} value={idx.toString()} className="flex-1">
                      {quarter.quarter_label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex-1 overflow-y-auto mt-4">
                  <TabsContent value="overview" className="mt-0">
                    {renderOverview()}
                  </TabsContent>
                  {rawData.all_quarters?.map((quarter, idx) => (
                    <TabsContent key={idx} value={idx.toString()} className="mt-0">
                      {renderQuarterData(quarter)}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </>
          )}

          {!loading && hasData && dataType === 'legacy' && (
            <div className="flex-1 overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Legacy Yuki API Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
