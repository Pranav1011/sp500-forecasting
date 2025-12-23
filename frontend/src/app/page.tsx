import { fetchMetrics, fetchPredictions, fetchEquityCurve, fetchFeatureImportance, fetchSummary } from "@/lib/api";
import { PredictionPanel } from "@/components/PredictionPanel";
import { EquityChart } from "@/components/EquityChart";
import { MetricsTable } from "@/components/MetricsTable";
import { BacktestSummary } from "@/components/BacktestSummary";
import { FeatureImportance } from "@/components/FeatureImportance";
import { Activity, TrendingUp, BarChart3 } from "lucide-react";

async function getData() {
  try {
    const [metricsRes, predictionsRes, equityRes, featuresRes, summaryRes] = await Promise.all([
      fetchMetrics().catch(() => ({ metrics: {} })),
      fetchPredictions().catch(() => ({ predictions: {} })),
      fetchEquityCurve(5).catch(() => ({ data: [] })),
      fetchFeatureImportance(5).catch(() => ({ features: {} })),
      fetchSummary().catch(() => ({})),
    ]);

    return {
      metrics: metricsRes.metrics || {},
      predictions: predictionsRes.predictions || {},
      equityCurve: equityRes.data || [],
      features: featuresRes.features || {},
      summary: summaryRes || {},
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {
      metrics: {},
      predictions: {},
      equityCurve: [],
      features: {},
      summary: {},
    };
  }
}

export default async function Home() {
  const { metrics, predictions, equityCurve, features, summary } = await getData();

  const hasData = Object.keys(predictions).length > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-white">S&P 500 Forecasting Platform</h1>
              <p className="text-sm text-gray-500">Multi-horizon ML predictions • Ensemble models • Real-time backtesting</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-400">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="p-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <BarChart3 className="w-16 h-16 mb-4 text-zinc-700" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-sm">Run the ML pipeline to generate predictions and metrics.</p>
            <code className="mt-4 px-4 py-2 bg-zinc-900 rounded text-sm text-orange-500">
              python -m ml.data_collection && python -m ml.feature_engineering && python -m ml.train_models && python -m ml.backtest
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Row 1: Predictions */}
            <div className="col-span-3">
              <PredictionPanel predictions={predictions} />
            </div>

            {/* Row 2: Equity Chart + Feature Importance */}
            <EquityChart data={equityCurve} horizon={5} />
            <FeatureImportance features={features} horizon={5} />

            {/* Row 3: Backtest Summary */}
            <div className="col-span-3">
              <BacktestSummary data={summary} />
            </div>

            {/* Row 4: Model Comparison Table */}
            <MetricsTable metrics={metrics} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-3 mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>S&P 500 Forecasting Platform • Built with XGBoost, Random Forest, Ridge Regression</span>
          <span>Data updated daily via GitHub Actions</span>
        </div>
      </footer>
    </main>
  );
}
