import { fetchMetrics, fetchPredictions, fetchEquityCurve, fetchFeatureImportance, fetchSummary } from "@/lib/api";
import { PredictionPanel } from "@/components/PredictionPanel";
import { EquityChart } from "@/components/EquityChart";
import { MetricsTable } from "@/components/MetricsTable";
import { BacktestSummary } from "@/components/BacktestSummary";
import { FeatureImportance } from "@/components/FeatureImportance";
import { Activity, TrendingUp, BarChart3, Cpu, Database, GitBranch } from "lucide-react";

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
    <main className="min-h-screen bg-black text-white data-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  S&P 500 <span className="gradient-text">Forecasting Platform</span>
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Ensemble ML</span>
                  <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 15+ Years Data</span>
                  <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> Walk-Forward Validation</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-500">Last Updated</div>
                <div className="text-sm font-mono text-gray-300">{new Date().toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                <span className="w-2 h-2 bg-green-500 rounded-full live-pulse"></span>
                <span className="text-xs text-gray-400 font-medium">Live</span>
              </div>
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
      <footer className="border-t border-zinc-800 bg-zinc-900/50 px-6 py-4 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              XGBoost
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Random Forest
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Ridge Regression
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Built with Next.js • FastAPI • scikit-learn
          </div>
        </div>
      </footer>
    </main>
  );
}
