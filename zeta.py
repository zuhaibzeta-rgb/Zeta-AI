import os
import html
import json
import math
import statistics
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
import yfinance as yf
from dotenv import load_dotenv

try:
    import ollama
except Exception:
    ollama = None

# --- ADDED: EXA + Convex imports (after line 20) ---
try:
    from exa_py import Exa
except Exception:
    Exa = None

try:
    from convex import ConvexClient
except Exception:
    ConvexClient = None
# --- END ADDED ---

# =========================================================
# ZETA.AI | GLOBAL COMMAND TERMINAL
#
# Expanded edition with deeper modular analytics, controls,
#
# scenario tools, portfolio intelligence, and multi-source tabs.
#
# =========================================================

load_dotenv()

st.set_page_config(
    page_title="ZETA.AI | GLOBAL COMMAND",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #050505;
        font-family: 'JetBrains Mono', monospace;
        color: #e0e0e0;
    }
    .stTabs [data-baseweb="tab-list"] { gap: 10px; background-color: #050505; }
    .stTabs [data-baseweb="tab"] {
        background-color: #111;
        border: 1px solid #333;
        padding: 10px 20px;
        border-radius: 6px;
        color: #888;
    }
    .stTabs [aria-selected="true"] { border-color: #00ff88 !important; color: #00ff88 !important; }
    .metric-card { background: #111; padding: 15px; border-radius: 8px; border-left: 5px solid #00ff88; }
    .small-note { color: #8b8b8b; font-size: 0.9rem; }
    .section-title { font-size: 1.2rem; font-weight: 700; margin-top: 0.5rem; margin-bottom: 0.5rem; color: #00ff88; }
    .subtle { color: #9e9e9e; }
</style>
""",
    unsafe_allow_html=True,
)

# =========================================================
# ENVIRONMENT / FILES
# =========================================================

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
DEFAULT_GEO_MAP_URL = os.getenv("GEO_MAP_URL", "")

NEWS_FILE = os.getenv("NEWS_FILE", "news.csv")
ALT_DATA_FILE = os.getenv("ALT_DATA_FILE", "alt_data.csv")
BACKTEST_FILE = os.getenv("BACKTEST_FILE", "backtest.csv")
PORTFOLIO_FILE = os.getenv("PORTFOLIO_FILE", "portfolio.csv")
WATCHLIST_FILE = os.getenv("WATCHLIST_FILE", "watchlist.csv")
ALERTS_FILE = os.getenv("ALERTS_FILE", "alerts.csv")
NOTES_FILE = os.getenv("NOTES_FILE", "notes.csv")
SCENARIOS_FILE = os.getenv("SCENARIOS_FILE", "scenarios.csv")
JOURNAL_FILE = os.getenv("JOURNAL_FILE", "journal.csv")

BUY_THRESHOLD = 0.35
SELL_THRESHOLD = -0.35
NEUTRAL_BAND = 0.15

# --- ADDED: EXA + Convex clients and functions (after line 72) ---
EXA_API_KEY = os.getenv("EXA_API_KEY", "3b06187a-40e0-474d-8d75-d86668dc0a85")
CONVEX_URL = os.getenv("CONVEX_URL", "https://accomplished-egret-892.convex.cloud")

exa_client = Exa(api_key=EXA_API_KEY) if Exa is not None else None
convex_client = ConvexClient(CONVEX_URL) if ConvexClient is not None else None

def exa_search(query, num_results=5):
    if exa_client is None:
        return []
    try:
        results = exa_client.search_and_contents(
            query,
            num_results=num_results,
            use_autoprompt=True,
            text=True
        )
        return [
            {
                "title": getattr(r, "title", ""),
                "url": getattr(r, "url", ""),
                "text": (getattr(r, "text", "") or "")[:400]
            }
            for r in results.results
        ]
    except Exception as e:
        st.warning(f"Exa error: {e}")
        return []

def convex_save_search(query, results):
    if convex_client is None:
        return
    try:
        convex_client.mutation(
            "searches:save",
            {
                "query": query,
                "results": json.dumps(results),
                "timestamp": datetime.now().isoformat()
            }
        )
    except Exception:
        pass
# --- END ADDED ---

# =========================================================
# AGENTS / TICKERS / SECTORS
# =========================================================

AGENTS: Dict[str, str] = {
    "Warren Buffett": "Value specialist focusing on moats and intrinsic safety.",
    "Jim Simons": "Quantitative wizard looking for mathematical patterns and mean reversion.",
    "George Soros": "Reflexivity expert focusing on geopolitical shifts and social feedback.",
    "Ken Griffin": "Market maker analyzing order flow, liquidity, and multi-strat arbitrage.",
    "Carl Icahn": "Activist focusing on corporate inefficiency and aggressive catalysts.",
    "Ray Dalio": "Macro economist mapping debt cycles and the 'Holy Grail' of diversification.",
    "Peter Lynch": "Growth-at-reasonable-price expert focused on consumer dominance.",
    "Stan Druckenmiller": "Top-down macro trader focusing on central bank policy and liquidity.",
    "John Maynard Keynes": "Psychology expert focusing on animal spirits and market aggregates.",
    "Benjamin Graham": "The father of value investing. Focuses on margin of safety and net-asset value.",
}

TICKERS: List[str] = [
    "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "BRK-B", "LLY", "AVGO",
    "V", "MA", "JPM", "UNH", "COST", "HD", "PG", "NFLX", "AMD", "ADBE",
    "CRM", "WMT", "BAC", "ORCL", "QCOM", "TXN", "TMUS", "INTU", "AMAT", "ISRG",
]

SECTOR_MAP: Dict[str, str] = {
    "AAPL": "Technology",
    "MSFT": "Technology",
    "NVDA": "Semiconductors",
    "TSLA": "Consumer Discretionary",
    "AMZN": "Consumer Discretionary",
    "GOOGL": "Communication Services",
    "META": "Communication Services",
    "BRK-B": "Financials",
    "LLY": "Healthcare",
    "AVGO": "Semiconductors",
    "V": "Financials",
    "MA": "Financials",
    "JPM": "Financials",
    "UNH": "Healthcare",
    "COST": "Consumer Staples",
    "HD": "Consumer Discretionary",
    "PG": "Consumer Staples",
    "NFLX": "Communication Services",
    "AMD": "Semiconductors",
    "ADBE": "Technology",
    "CRM": "Technology",
    "WMT": "Consumer Staples",
    "BAC": "Financials",
    "ORCL": "Technology",
    "QCOM": "Semiconductors",
    "TXN": "Semiconductors",
    "TMUS": "Communication Services",
    "INTU": "Technology",
    "AMAT": "Semiconductors",
    "ISRG": "Healthcare",
}

# =========================================================
# SESSION STATE
# =========================================================

if "selected_ticker" not in st.session_state:
    st.session_state.selected_ticker = TICKERS[0]
if "geo_map_url" not in st.session_state:
    st.session_state.geo_map_url = DEFAULT_GEO_MAP_URL
if "watchlist" not in st.session_state:
    st.session_state.watchlist = []
if "trade_log" not in st.session_state:
    st.session_state.trade_log = []
if "theme_mode" not in st.session_state:
    st.session_state.theme_mode = "dark"
if "last_debate_result" not in st.session_state:
    st.session_state.last_debate_result = ""
if "selected_scenario" not in st.session_state:
    st.session_state.selected_scenario = "Base"

# =========================================================
# UTILS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default

def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))

def pct_change_series(series: pd.Series) -> pd.Series:
    return series.pct_change().replace([float("inf"), float("-inf")], pd.NA).fillna(0)

def rolling_zscore(series: pd.Series, window: int = 20) -> pd.Series:
    mean = series.rolling(window).mean()
    std = series.rolling(window).std().replace(0, pd.NA)
    return ((series - mean) / std).fillna(0)

def normalize_signal(text: str) -> float:
    text = (text or "").lower()
    if any(k in text for k in ["extreme risk", "strong sell"]):
        return -1.0
    if "trim" in text:
        return -0.45
    if "market perform" in text or "hold" in text:
        return 0.0
    if "accumulate" in text:
        return 0.35
    if "strong buy" in text or "buy" in text:
        return 0.8
    if any(k in text for k in ["bull", "constructive", "positive"]):
        return 0.2
    if any(k in text for k in ["bear", "negative"]):
        return -0.2
    return 0.0

def signal_label(score: float) -> str:
    if score >= BUY_THRESHOLD:
        return "BUY"
    if score <= SELL_THRESHOLD:
        return "SELL"
    return "HOLD"

def risk_bucket(value: float) -> str:
    if value >= 80:
        return "Very High"
    if value >= 60:
        return "High"
    if value >= 40:
        return "Moderate"
    if value >= 20:
        return "Low"
    return "Very Low"

def ensure_dir_path(filepath: str) -> None:
    directory = os.path.dirname(filepath)
    if directory:
        os.makedirs(directory, exist_ok=True)

def read_csv_or_sample(
    path: str, sample_rows: List[Dict[str, Any]], expected_columns: List[str]
) -> pd.DataFrame:
    if os.path.exists(path):
        try:
            return pd.read_csv(path)
        except Exception:
            pass
    return pd.DataFrame(sample_rows, columns=expected_columns)

def append_row_csv(path: str, row: Dict[str, Any], columns: List[str]) -> None:
    ensure_dir_path(path)
    df_new = pd.DataFrame([row], columns=columns)
    if os.path.exists(path):
        try:
            df_old = pd.read_csv(path)
            df_all = pd.concat([df_old, df_new], ignore_index=True)
        except Exception:
            df_all = df_new
    else:
        df_all = df_new
    df_all.to_csv(path, index=False)

def dataframe_to_download_link(df: pd.DataFrame, filename: str) -> str:
    csv = df.to_csv(index=False)
    b64 = csv.encode("utf-8").hex()
    return f"data:text/csv;charset=utf-8,{b64}"

def safe_first_ticker(tickers: List[str]) -> str:
    return tickers[0] if tickers else "AAPL"

# =========================================================
# DOMAIN DATA FETCH
# =========================================================

@st.cache_data(ttl=300)
def get_live_metrics(ticker: str) -> Optional[Dict[str, Any]]:
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period="6mo", auto_adjust=False)
        if df.empty:
            return None

        close = float(df["Close"].iloc[-1])
        green_days = int((df["Close"] > df["Open"]).sum())
        profit_score = round((green_days / len(df)) * 100, 1)
        vol = float(df["Close"].pct_change().std() * (252 ** 0.5)) if len(df) > 1 else 0.0
        momentum = float((df["Close"].iloc[-1] / df["Close"].iloc[-21]) - 1) if len(df) > 21 else 0.0
        returns = pct_change_series(df["Close"])
        zscore = float(rolling_zscore(df["Close"], 20).iloc[-1]) if len(df) > 20 else 0.0
        try:
            info = stock.info or {}
        except Exception:
            info = {}
        return {
            "price": round(close, 2),
            "profit_score": profit_score,
            "mkt_cap": safe_float(info.get("marketCap", 0), 0.0),
            "pe": safe_float(info.get("trailingPE", 0), 0.0),
            "beta": safe_float(info.get("beta", 0), 0.0),
            "volatility": round(vol, 4),
            "momentum": round(momentum, 4),
            "zscore": round(zscore, 4),
            "avg_volume": safe_float(info.get("averageVolume", 0), 0.0),
            "returns_std": float(returns.std()),
            "df": df,
        }
    except Exception:
        return None

@st.cache_data(ttl=120)
def fetch_history(ticker: str, period: str = "1y") -> Optional[pd.DataFrame]:
    try:
        df = yf.Ticker(ticker).history(period=period, auto_adjust=False)
        if df.empty:
            return None
        df = df.reset_index()
        if "Date" not in df.columns and "Datetime" in df.columns:
            df = df.rename(columns={"Datetime": "Date"})
        return df
    except Exception:
        return None

@st.cache_data(ttl=120)
def fetch_news() -> pd.DataFrame:
    sample_rows = [
        {"date": "2026-03-20", "source": "reuters", "title": "Rates decision monitoring", "topic": "macro", "sentiment": "neutral"},
        {"date": "2026-03-20", "source": "bloomberg", "title": "Earnings season watch", "topic": "earnings", "sentiment": "positive"},
        {"date": "2026-03-20", "source": "wire", "title": "Geopolitical escalation tracker", "topic": "geo", "sentiment": "negative"},
        {"date": "2026-03-20", "source": "desk", "title": "Liquidity regime scan", "topic": "liquidity", "sentiment": "neutral"},
    ]
    return read_csv_or_sample(NEWS_FILE, sample_rows, ["date", "source", "title", "topic", "sentiment"])

@st.cache_data(ttl=120)
def fetch_alt_data() -> pd.DataFrame:
    sample_rows = [
        {"date": "2026-03-20", "source": "satellite", "asset": "AAPL", "signal": "parking_lot", "value": 0.71},
        {"date": "2026-03-20", "source": "web", "asset": "AAPL", "signal": "traffic", "value": 0.64},
        {"date": "2026-03-20", "source": "satellite", "asset": "AMZN", "signal": "parking_lot", "value": 0.83},
        {"date": "2026-03-20", "source": "web", "asset": "AMZN", "signal": "traffic", "value": 0.79},
        {"date": "2026-03-20", "source": "esg", "asset": "MSFT", "signal": "emissions", "value": 0.52},
        {"date": "2026-03-20", "source": "retail", "asset": "WMT", "signal": "footfall", "value": 0.68},
        {"date": "2026-03-20", "source": "shipping", "asset": "TSLA", "signal": "port_congestion", "value": 0.44},
    ]
    return read_csv_or_sample(ALT_DATA_FILE, sample_rows, ["date", "source", "asset", "signal", "value"])

@st.cache_data(ttl=120)
def fetch_backtest() -> pd.DataFrame:
    sample_rows = [
        {"date": "2026-01-01", "ticker": "AAPL", "strategy_return": 0.02, "benchmark_return": 0.01, "signal": "BUY"},
        {"date": "2026-01-15", "ticker": "MSFT", "strategy_return": 0.01, "benchmark_return": 0.005, "signal": "HOLD"},
        {"date": "2026-02-01", "ticker": "AMZN", "strategy_return": -0.01, "benchmark_return": -0.02, "signal": "SELL"},
    ]
    return read_csv_or_sample(BACKTEST_FILE, sample_rows, ["date", "ticker", "strategy_return", "benchmark_return", "signal"])

@st.cache_data(ttl=120)
def fetch_portfolio() -> pd.DataFrame:
    return read_csv_or_sample(PORTFOLIO_FILE, [], ["ticker", "side", "allocation", "price", "note", "timestamp"])

@st.cache_data(ttl=120)
def fetch_watchlist() -> pd.DataFrame:
    sample_rows = [{"ticker": "AAPL"}, {"ticker": "MSFT"}, {"ticker": "NVDA"}]
    return read_csv_or_sample(WATCHLIST_FILE, sample_rows, ["ticker"])

@st.cache_data(ttl=120)
def fetch_alerts() -> pd.DataFrame:
    sample_rows = [
        {"ticker": "AAPL", "threshold": 50, "kind": "profitability"},
        {"ticker": "TSLA", "threshold": -20, "kind": "risk"},
    ]
    return read_csv_or_sample(ALERTS_FILE, sample_rows, ["ticker", "threshold", "kind"])

@st.cache_data(ttl=120)
def fetch_notes() -> pd.DataFrame:
    sample_rows = [
        {"date": "2026-03-20", "ticker": "AAPL", "note": "Core moat remains strong."},
    ]
    return read_csv_or_sample(NOTES_FILE, sample_rows, ["date", "ticker", "note"])

@st.cache_data(ttl=120)
def fetch_scenarios() -> pd.DataFrame:
    sample_rows = [
        {"name": "Base", "shock_pct": 0, "rate_shock": 0.0, "demand_shock": 0.0, "liquidity_shock": 0.0},
        {"name": "Recession", "shock_pct": -10, "rate_shock": 0.5, "demand_shock": -0.7, "liquidity_shock": -0.5},
        {"name": "Inflation", "shock_pct": -5, "rate_shock": 0.9, "demand_shock": -0.2, "liquidity_shock": -0.1},
        {"name": "Risk-On", "shock_pct": 12, "rate_shock": -0.4, "demand_shock": 0.5, "liquidity_shock": 0.6},
    ]
    return read_csv_or_sample(SCENARIOS_FILE, sample_rows, ["name", "shock_pct", "rate_shock", "demand_shock", "liquidity_shock"])

@st.cache_data(ttl=120)
def fetch_journal() -> pd.DataFrame:
    sample_rows = [
        {"date": "2026-03-20", "ticker": "AAPL", "title": "Why this matters", "body": "Long-term moat, stable demand, and improving sentiment."},
    ]
    return read_csv_or_sample(JOURNAL_FILE, sample_rows, ["date", "ticker", "title", "body"])

# =========================================================
# LLM + AGENTS
# =========================================================

def ollama_chat(prompt: str) -> str:
    if ollama is None:
        return "OLLAMA PYTHON CLIENT NOT INSTALLED."
    try:
        os.environ["OLLAMA_HOST"] = OLLAMA_HOST
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response["message"]["content"]
    except Exception as e:
        return f"JUDGE OFFLINE: {e}"

def run_agent_brain(
    name: str,
    persona: str,
    ticker: str,
    price: float,
    score: float,
    beta: float,
    vol: float,
    momentum: float,
) -> Dict[str, Any]:
    prompt = (
        f"System: You are {name}, {persona}.\n"
        f"Task: Analyze {ticker} at ${price}. Profitability Score: {score}%. Beta: {beta}. Volatility: {vol}. Momentum: {momentum}.\n"
        "Be concise, specific, and produce one signal from: [Strong Buy, Accumulate, Market Perform, Trim, Strong Sell, Extreme Risk]."
    )
    thought = ollama_chat(prompt)
    signal = normalize_signal(thought)
    return {"agent": name, "thought": thought, "signal": signal}

def run_senior_partner_judge(ticker: str, reports: List[Dict[str, Any]], zeta_signal: float) -> str:
    summary = "\n".join([f"{r['agent']}: {r['thought']}" for r in reports])
    prompt = (
        f"You are the ZETA-AI Senior Partner. Review these 10 agent reports for {ticker}.\n"
        f"Current Zeta Signal: {zeta_signal:+.3f}.\n"
        "Return: 1) confidence percentage, 2) allocation advice, 3) buy/sell/hold view, 4) one-line risk note, 5) catalyst summary.\n\n"
        f"REPORTS:\n{summary}"
    )
    return ollama_chat(prompt)

# =========================================================
# ANALYTICS CORE
# =========================================================

def calculate_zeta_signal(reports: List[Dict[str, Any]]) -> float:
    if not reports:
        return 0.0
    vals = [r.get("signal", 0.0) for r in reports]
    return float(round(sum(vals) / len(vals), 3))

def build_candlestick_figure(hist: pd.DataFrame, ticker: str) -> go.Figure:
    hist = hist.copy()
    hist["YellowLine"] = hist["Close"].rolling(20).mean()
    hist["VWAP"] = (hist["Close"] * hist["Volume"]).cumsum() / hist["Volume"].cumsum()
    hist["EMA12"] = hist["Close"].ewm(span=12, adjust=False).mean()
    hist["EMA26"] = hist["Close"].ewm(span=26, adjust=False).mean()

    fig = go.Figure()
    fig.add_trace(
        go.Candlestick(
            x=hist["Date"],
            open=hist["Open"],
            high=hist["High"],
            low=hist["Low"],
            close=hist["Close"],
            name=f"{ticker} Candles",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=hist["Date"],
            y=hist["YellowLine"],
            mode="lines",
            name="Yellow Line (20D MA)",
            line=dict(color="yellow", width=2),
        )
    )
    fig.add_trace(
        go.Scatter(
            x=hist["Date"],
            y=hist["VWAP"],
            mode="lines",
            name="VWAP",
            line=dict(color="#00ff88", width=1.5, dash="dot"),
        )
    )
    fig.add_trace(
        go.Scatter(
            x=hist["Date"],
            y=hist["EMA12"],
            mode="lines",
            name="EMA12",
            line=dict(color="#66aaff", width=1.2),
        )
    )
    fig.add_trace(
        go.Scatter(
            x=hist["Date"],
            y=hist["EMA26"],
            mode="lines",
            name="EMA26",
            line=dict(color="#ff66aa", width=1.2),
        )
    )
    fig.update_layout(
        template="plotly_dark",
        height=650,
        margin=dict(l=10, r=10, t=30, b=10),
        xaxis_rangeslider_visible=False,
    )
    return fig

def build_sector_heatmap(market_state: Dict[str, Dict[str, Any]], focus_tickers: List[str]) -> go.Figure:
    labels = ["Market"]
    parents = [""]
    values = [0]
    colors = ["#000000"]
    texts = [""]
    customdata = ["Market"]

    for t in focus_tickers:
        d = market_state[t]
        labels.append(t)
        parents.append("Market")
        values.append(1000)
        colors.append("#00ff88" if d["profit_score"] >= 50 else "#ff4444")
        texts.append(f"{d['profit_score']}%")
        customdata.append(t)
    fig = go.Figure(
        go.Treemap(
            labels=labels,
            parents=parents,
            values=values,
            marker=dict(colors=colors),
            text=texts,
            textinfo="label+text",
            customdata=customdata,
            hovertemplate="%{label}<br>%{text}<extra></extra>",
        )
    )
    fig.update_layout(margin=dict(t=0, l=0, r=0, b=0), height=520, template="plotly_dark")
    return fig

def build_risk_matrix(market_state: Dict[str, Dict[str, Any]], tickers: List[str]) -> pd.DataFrame:
    rows = []
    for t in tickers:
        d = market_state[t]
        rows.append(
            {
                "Ticker": t,
                "Sector": SECTOR_MAP.get(t, "Other"),
                "Profitability": d["profit_score"],
                "Price": d["price"],
                "PE": d["pe"],
                "Beta": d["beta"],
                "Volatility": d["volatility"],
                "Momentum": d["momentum"],
                "ZScore": d["zscore"],
                "RiskScore": round((100 - d["profit_score"]) + abs(d["beta"]) * 10 + d["volatility"] * 100, 2),
            }
        )
    return pd.DataFrame(rows)

def build_correlation_df(tickers: List[str], period: str = "3mo") -> Optional[pd.DataFrame]:
    hist_series = {}
    for t in tickers:
        df = fetch_history(t, period=period)
        if df is not None and not df.empty:
            hist_series[t] = pct_change_series(df.set_index("Date")["Close"]).rename(t)
    if not hist_series:
        return None
    return pd.concat(hist_series.values(), axis=1).dropna(how="all").fillna(0)

def build_backtest_equity(backtest_df: pd.DataFrame) -> Optional[pd.DataFrame]:
    if backtest_df.empty:
        return None
    if not {"date", "strategy_return", "benchmark_return"}.issubset(backtest_df.columns):
        return None
    bt = backtest_df.copy()
    bt["date"] = pd.to_datetime(bt["date"], errors="coerce")
    bt = bt.sort_values("date")
    bt["strategy_equity"] = (1 + bt["strategy_return"].fillna(0)).cumprod()
    bt["benchmark_equity"] = (1 + bt["benchmark_return"].fillna(0)).cumprod()
    return bt

def compute_var(returns: pd.Series, alpha: float = 0.05) -> float:
    if returns.empty:
        return 0.0
    return float(returns.quantile(alpha))

def compute_max_drawdown(price_series: pd.Series) -> float:
    if price_series.empty:
        return 0.0
    running_max = price_series.cummax()
    dd = (price_series / running_max) - 1
    return float(dd.min())

def compute_sharpe(returns: pd.Series) -> float:
    if returns.empty or returns.std() == 0:
        return 0.0
    return float((returns.mean() / returns.std()) * math.sqrt(252))

def compute_hit_rate(returns: pd.Series) -> float:
    if returns.empty:
        return 0.0
    return float((returns > 0).mean())

def compute_cagr(equity_curve: pd.Series, periods_per_year: int = 252) -> float:
    if equity_curve.empty or len(equity_curve) < 2:
        return 0.0
    years = len(equity_curve) / periods_per_year
    if years <= 0:
        return 0.0
    total_return = equity_curve.iloc[-1] / equity_curve.iloc[0]
    return float(total_return ** (1 / years) - 1)

def scenario_adjusted_score(
    base: float,
    shock_pct: float,
    rate_shock: float,
    demand_shock: float,
    liquidity_shock: float,
) -> float:
    adj = base
    adj += shock_pct * 0.01
    adj += demand_shock * 0.4
    adj += liquidity_shock * 0.3
    adj -= abs(rate_shock) * 0.2
    return float(round(adj, 3))

def buy_sell_hold_from_score(score: float) -> str:
    if score > 0.25:
        return "Buy"
    if score < -0.25:
        return "Sell"
    return "Hold"

# =========================================================
# LOCAL FILE HELPERS
# =========================================================

def save_watchlist(ticker: str) -> None:
    fetch_watchlist.clear()
    current = fetch_watchlist()
    if ticker not in set(current["ticker"].astype(str)):
        append_row_csv(WATCHLIST_FILE, {"ticker": ticker}, ["ticker"])

def save_note(ticker: str, title: str, body: str) -> None:
    append_row_csv(
        NOTES_FILE,
        {
            "date": datetime.now().date().isoformat(),
            "ticker": ticker,
            "note": f"{title}: {body}",
        },
        ["date", "ticker", "note"],
    )

def save_journal(ticker: str, title: str, body: str) -> None:
    append_row_csv(
        JOURNAL_FILE,
        {
            "date": datetime.now().date().isoformat(),
            "ticker": ticker,
            "title": title,
            "body": body,
        },
        ["date", "ticker", "title", "body"],
    )

def save_scenario(
    name: str,
    shock_pct: float,
    rate_shock: float,
    demand_shock: float,
    liquidity_shock: float,
) -> None:
    append_row_csv(
        SCENARIOS_FILE,
        {
            "name": name,
            "shock_pct": shock_pct,
            "rate_shock": rate_shock,
            "demand_shock": demand_shock,
            "liquidity_shock": liquidity_shock,
        },
        ["name", "shock_pct", "rate_shock", "demand_shock", "liquidity_shock"],
    )

# =========================================================
# DATA LOAD / VALIDATION
# =========================================================

st.title("ZETA.AI | GLOBAL COMMAND TERMINAL")
st.caption("Local terminal for market snapshots, multi-agent debate, geopolitics, risk, alt-data, and backtesting.")

with st.spinner("Syncing Global Market Data..."):
    market_state: Dict[str, Dict[str, Any]] = {}
    for t in TICKERS:
        data = get_live_metrics(t)
        if data is not None:
            market_state[t] = data

if not market_state:
    st.error("No market data loaded. Check internet access or yfinance availability.")
    st.stop()

if st.session_state.selected_ticker not in market_state:
    st.session_state.selected_ticker = safe_first_ticker(list(market_state.keys()))

# =========================================================
# TABS
# =========================================================

(
    tab1,
    tab2,
    tab3,
    tab4,
    tab5,
    tab6,
    tab7,
    tab8,
    tab9,
) = st.tabs(
    [
        "📊 PERFORMANCE",
        "🌐 GEO-INT",
        "🧊 3D CUBE",
        "📚 MICRO + RISK",
        "🛰️ ALT DATA",
        "🧪 BACKTEST + CORR",
        "🗞️ NEWS + FLOW",
        "⚙️ SIGNAL LAB",
        "📰 FINANCIAL PRESS",
    ]
)

# =========================================================
# TAB 1: PERFORMANCE
# =========================================================

with tab1:
    st.markdown('<div class="section-title">Global Equity Heatmap</div>', unsafe_allow_html=True)
    st.caption("Select a stock from the dropdown — the chart, debate, trade panel, and risk scores update to match.")
    topbar = st.columns([1, 1, 1, 1])
    with topbar[0]:
        universe = st.selectbox("Universe", ["Top 10", "Top 20", "All"], index=0, key="universe_picker")
    with topbar[1]:
        ticker_keys = list(market_state.keys())
        current_idx = ticker_keys.index(st.session_state.selected_ticker) if st.session_state.selected_ticker in ticker_keys else 0
        selected = st.selectbox("Selected asset", ticker_keys, index=current_idx, key="selected_ticker")
    with topbar[2]:
        mode = st.selectbox("Action mode", ["Hold", "Buy", "Sell"], index=0, key="trade_mode")
    with topbar[3]:
        alloc = st.slider("Allocation %", 0, 100, 10, 5, key="trade_alloc")

    item_list = list(market_state.items())
    if universe == "Top 10":
        item_list = item_list[:10]
    elif universe == "Top 20":
        item_list = item_list[:20]
    focus_tickers = [t for t, _ in item_list]
    fig_heat = build_sector_heatmap(market_state, focus_tickers)
    st.plotly_chart(fig_heat, use_container_width=True)

    # --- ADDED: ZETA Search Section (after line 598) ---
    st.markdown("### 🔍 Ask ZETA")
    zeta_query = st.text_input("", placeholder="Ask ZETA anything...", key="zeta_ask_input")
    if st.button("Search", key="zeta_search_btn"):
        if zeta_query.strip():
            with st.spinner("Searching..."):
                results = exa_search(zeta_query)
                convex_save_search(zeta_query, results)
                if results:
                    for r in results:
                        st.markdown(f"{r['title']}")
                        st.write(r["text"])
                        st.markdown("---")
                else:
                    st.warning("No results found.")
    # --- END ADDED ---

    live = market_state[selected]
    hist = fetch_history(selected, period="6mo")
    col_a, col_b = st.columns([3, 1])
    with col_a:
        if hist is not None and not hist.empty:
            st.plotly_chart(build_candlestick_figure(hist, selected), use_container_width=True)
        else:
            st.warning("No historical data available for candlestick chart.")
    with col_b:
        st.markdown("### Trade Panel")
        st.metric("Ticker", selected)
        st.metric("Price", f"${live['price']}")
        st.metric("Profitability", f"{live['profit_score']}%")
        st.metric("Beta", f"{live['beta']:.2f}")
        st.metric("Volatility", f"{live['volatility']:.2f}")
        st.metric("Momentum", f"{live['momentum']:+.2%}")
        zeta_preview = (live["profit_score"] / 100.0) * 2 - 1
        st.metric("Zeta Bias", f"{zeta_preview:+.2f}")
        st.metric("Suggested Action", mode)
        if st.button("Commit Paper Trade", key="commit_trade_btn"):
            append_row_csv(
                PORTFOLIO_FILE,
                {
                    "ticker": selected,
                    "side": mode,
                    "allocation": alloc,
                    "price": live["price"],
                    "note": "Manual trade from performance tab",
                    "timestamp": datetime.now().isoformat(timespec="seconds"),
                },
                ["ticker", "side", "allocation", "price", "note", "timestamp"],
            )
            fetch_portfolio.clear()
            st.success("Paper trade saved.")

    st.markdown("### 10-Agent Autonomous Debate")
    if st.button("EXECUTE 10-AGENT AUTONOMOUS DEBATE", type="primary", key="debate_btn"):
        reports: List[Dict[str, Any]] = []
        with st.status(f"Opening Neural Links for {selected}...", expanded=True) as status_box:
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [
                    executor.submit(
                        run_agent_brain,
                        n,
                        p,
                        selected,
                        live["price"],
                        live["profit_score"],
                        live["beta"],
                        live["volatility"],
                        live["momentum"],
                    )
                    for n, p in AGENTS.items()
                ]
                for f in as_completed(futures):
                    res = f.result()
                    reports.append(res)
                    st.write(f"✅ {res['agent']} response received.")
            zeta_signal = calculate_zeta_signal(reports)
            verdict = signal_label(zeta_signal)
            st.write(f"⚖️ Zeta Signal: {zeta_signal:+.3f} ({verdict})")
            st.write("⚖️ Senior Partner (Llama) is synthesizing verdict...")
            final_verdict = run_senior_partner_judge(selected, reports, zeta_signal)
            status_box.update(label="Debate Concluded", state="complete")
            st.session_state.last_debate_result = final_verdict
        st.markdown(f"### 🛡️ FINAL SENIOR PARTNER VERDICT: {selected}")
        st.info(final_verdict)
        st.success(f"Zeta Signal: {zeta_signal:+.3f} | Action: {verdict} | Allocation hint: {alloc}%")
        report_cols = st.columns(2)
        for i, report in enumerate(reports):
            with report_cols[i % 2].expander(f"Agent Log: {report['agent']}"):
                st.write(report["thought"])
                st.write(f"Signal score: {report['signal']:+.2f}")

    st.markdown("### Quick Metrics")
    metric_cols = st.columns(4)
    metric_cols[0].metric("Sector", SECTOR_MAP.get(selected, "Other"))
    metric_cols[1].metric("Market Cap", f"${live['mkt_cap'] / 1e9:.2f}B" if live["mkt_cap"] else "N/A")
    metric_cols[2].metric("P/E", f"{live['pe']:.2f}" if live["pe"] else "N/A")
    metric_cols[3].metric("Risk Label", risk_bucket(live["profit_score"]))

    st.markdown("### Ticker Journal")
    journal = fetch_journal()
    st.dataframe(journal[journal["ticker"] == selected], use_container_width=True)

# =========================================================
# TAB 2: GEO-INT
# =========================================================

with tab2:
    st.markdown('<div class="section-title">Geopolitical Intelligence — World Monitor</div>', unsafe_allow_html=True)
    st.caption("Click the button below to open the World Monitor GitHub repo.")
    st.markdown(
        '<a href="https://github.com/koala73/worldmonitor" target="_blank"'
        ' style="display:inline-block; padding:14px 32px;'
        ' background:#00ff88; border-radius:6px;'
        ' color:#000; font-weight:700; font-family:\'JetBrains Mono\',monospace;'
        ' text-decoration:none; font-size:1rem;">'
        '🌍 Open World Monitor (GitHub)'
        '</a>',
        unsafe_allow_html=True,
    )
    st.markdown("---")
    st.markdown("### Geo Event Categories")
    geo_categories = pd.DataFrame(
        [
            {"Layer": "Conflicts", "Status": "Active Watch"},
            {"Layer": "Bases", "Status": "Stable"},
            {"Layer": "Hotspots", "Status": "Elevated"},
            {"Layer": "Nuclear", "Status": "Watch"},
            {"Layer": "Sanctions", "Status": "Moderate"},
            {"Layer": "Weather", "Status": "Dynamic"},
            {"Layer": "Economic", "Status": "Mixed"},
            {"Layer": "Waterways", "Status": "Flowing"},
            {"Layer": "Outages", "Status": "Localized"},
            {"Layer": "Military", "Status": "Active"},
            {"Layer": "Natural", "Status": "Event Risk"},
            {"Layer": "Iran Attacks", "Status": "Monitored"},
        ]
    )
    st.dataframe(geo_categories, use_container_width=True)
    with st.expander("⚙️ Setup — How to run World Monitor locally"):
        st.code(
            "git clone https://github.com/koala73/worldmonitor.git\n"
            "cd worldmonitor\n"
            "npm install\n"
            "npm run dev",
            language="bash",
        )
        st.write("• Runs on http://localhost:5173 by default.")
        st.write("• Keep the npm run dev terminal open while using ZETA.AI.")

# =========================================================
# TAB 3: 3D CUBE
# =========================================================

with tab3:
    st.markdown('<div class="section-title">3D Risk-Alpha Hypercube</div>', unsafe_allow_html=True)
    plot_data = []
    for t, d in market_state.items():
        plot_data.append(
            {
                "Ticker": t,
                "Profitability": d["profit_score"],
                "Price": d["price"],
                "Mkt_Cap": (d["mkt_cap"] or 0) / 1e9,
                "Beta": d["beta"],
                "Volatility": d["volatility"],
                "Momentum": d["momentum"],
                "ZScore": d["zscore"],
            }
        )
    df_3d = pd.DataFrame(plot_data)
    if not df_3d.empty:
        fig_3d = px.scatter_3d(
            df_3d,
            x="Profitability",
            y="Price",
            z="Mkt_Cap",
            color="Profitability",
            size="Volatility",
            text="Ticker",
            color_continuous_scale="RdYlGn",
            title="3D Market Position: Profit vs Value vs Size",
        )
        fig_3d.update_layout(
            template="plotly_dark",
            height=800,
            scene=dict(
                xaxis_title="Profitability (%)",
                yaxis_title="Price (USD)",
                zaxis_title="Market Cap (Billions)",
            ),
        )
        st.plotly_chart(fig_3d, use_container_width=True)
        st.markdown("### Dispersion Table")
        st.dataframe(df_3d.sort_values("Profitability", ascending=False), use_container_width=True)
        st.markdown("### Momentum / Z-Score Scanner")
        fig_momo = px.bar(
            df_3d.sort_values("Momentum", ascending=False).head(15),
            x="Ticker",
            y="Momentum",
            color="Momentum",
        )
        fig_momo.update_layout(template="plotly_dark", height=420)
        st.plotly_chart(fig_momo, use_container_width=True)

# =========================================================
# TAB 4: MICRO + RISK
# =========================================================

with tab4:
    st.markdown('<div class="section-title">Risk Management Engineering + Microeconomics Dashboard</div>', unsafe_allow_html=True)
    risk_df = build_risk_matrix(market_state, list(market_state.keys()))
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Avg Profitability", f"{risk_df['Profitability'].mean():.2f}%")
    c2.metric("Avg PE", f"{risk_df['PE'].mean():.2f}")
    c3.metric("Avg Beta", f"{risk_df['Beta'].mean():.2f}")
    c4.metric("Avg RiskScore", f"{risk_df['RiskScore'].mean():.2f}")
    st.markdown("### Microeconomics")
    micro_cols = st.columns(4)
    micro_cols[0].metric("Consumer Demand", "Stable")
    micro_cols[1].metric("Credit Conditions", "Watch")
    micro_cols[2].metric("Rates Sensitivity", "High")
    micro_cols[3].metric("Labor Pressure", "Moderate")
    st.markdown("### Risk Breakdown")
    fig_risk = px.bar(
        risk_df.sort_values("RiskScore", ascending=False).head(12),
        x="Ticker",
        y="RiskScore",
        color="Sector",
    )
    fig_risk.update_layout(template="plotly_dark", height=450)
    st.plotly_chart(fig_risk, use_container_width=True)
    st.markdown("### Order Flow + Liquidity Heat Map")
    flow_df = pd.DataFrame(
        {
            "Level": ["Bid 1", "Bid 2", "Mid", "Ask 1", "Ask 2"],
            "Intensity": [0.82, 0.65, 0.48, 0.58, 0.77],
        }
    )
    flow_matrix = flow_df[["Intensity"]].T
    flow_matrix.columns = flow_df["Level"]
    fig_flow = px.imshow(
        flow_matrix,
        labels=dict(x="Level", y="", color="Intensity"),
        title="Order Flow / Liquidity Heat Map",
        aspect="auto",
    )
    fig_flow.update_layout(template="plotly_dark", height=300)
    st.plotly_chart(fig_flow, use_container_width=True)
    st.markdown("### VaR / Drawdown / Sharpe")
    selected_hist = fetch_history(selected, period="1y")
    if selected_hist is not None and not selected_hist.empty:
        returns = pct_change_series(selected_hist["Close"])
        var_95 = compute_var(returns, 0.05)
        mdd = compute_max_drawdown(selected_hist["Close"])
        sharpe = compute_sharpe(returns)
        hit_rate = compute_hit_rate(returns)
        cols = st.columns(4)
        cols[0].metric("VaR 95%", f"{var_95:.2%}")
        cols[1].metric("Max Drawdown", f"{mdd:.2%}")
        cols[2].metric("Sharpe", f"{sharpe:.2f}")
        cols[3].metric("Hit Rate", f"{hit_rate:.2%}")

# =========================================================
# TAB 5: ALT DATA
# =========================================================

with tab5:
    st.markdown('<div class="section-title">Alternative Data Integration</div>', unsafe_allow_html=True)
    alt_df = fetch_alt_data()
    st.dataframe(alt_df, use_container_width=True)
    if {"date", "asset", "value"}.issubset(alt_df.columns):
        alt_df2 = alt_df.copy()
        alt_df2["date"] = pd.to_datetime(alt_df2["date"], errors="coerce")
        fig_alt = px.line(
            alt_df2,
            x="date",
            y="value",
            color="asset",
            line_group="signal",
            title="Alternative Data Trends",
        )
        fig_alt.update_layout(template="plotly_dark", height=450)
        st.plotly_chart(fig_alt, use_container_width=True)
    st.markdown("### Alt-Data Ideas You Can Add")
    st.write("• Satellite parking-lot counts")
    st.write("• Web traffic / app ranking")
    st.write("• ESG or emissions feeds")
    st.write("• Retail footfall estimates")
    st.write("• Shipping / port congestion")
    st.write("• Dark-store pickup demand")
    st.write("• Mobility / commuting intensity")
    st.write("• Weather disruption severity")
    st.markdown("### Input Schema")
    st.code(
        "date,source,asset,signal,value\n"
        "2026-03-20,satellite,AAPL,parking_lot,0.71\n"
        "2026-03-20,web,AAPL,traffic,0.64",
        language="text",
    )

# =========================================================
# TAB 6: BACKTEST + CORR
# =========================================================

with tab6:
    st.markdown('<div class="section-title">Correlation Matrix + Backtesting</div>', unsafe_allow_html=True)
    ticker_subset = list(market_state.keys())[:10]
    returns_df = build_correlation_df(ticker_subset, period="3mo")
    if returns_df is not None:
        corr = returns_df.corr()
        fig_corr = px.imshow(corr, text_auto=True, title="Return Correlation Matrix")
        fig_corr.update_layout(template="plotly_dark", height=700)
        st.plotly_chart(fig_corr, use_container_width=True)
        st.markdown("### Correlation Summary")
        corr_long = corr.stack().reset_index()
        corr_long.columns = ["Ticker1", "Ticker2", "Correlation"]
        st.dataframe(corr_long.sort_values("Correlation", ascending=False), use_container_width=True)
    else:
        st.warning("Not enough price history for correlation matrix.")
    backtest_df = fetch_backtest()
    st.dataframe(backtest_df, use_container_width=True)
    bt = build_backtest_equity(backtest_df)
    if bt is not None:
        fig_bt = go.Figure()
        fig_bt.add_trace(go.Scatter(x=bt["date"], y=bt["strategy_equity"], mode="lines", name="Strategy"))
        fig_bt.add_trace(go.Scatter(x=bt["date"], y=bt["benchmark_equity"], mode="lines", name="Benchmark"))
        fig_bt.update_layout(template="plotly_dark", height=500, title="Equity Curve Backtest")
        st.plotly_chart(fig_bt, use_container_width=True)
        c1, c2, c3 = st.columns(3)
        c1.metric("CAGR", f"{compute_cagr(bt['strategy_equity']):.2%}")
        c2.metric("Strategy End Value", f"{bt['strategy_equity'].iloc[-1]:.2f}")
        c3.metric("Benchmark End Value", f"{bt['benchmark_equity'].iloc[-1]:.2f}")
    st.markdown("### Backtest Setup")
    st.write("• Signal generate -> paper trade -> compare to benchmark")
    st.write("• Add transaction costs and slippage later")
    st.write("• Compute Sharpe, max drawdown, win-rate, CAGR next")

# =========================================================
# TAB 7: NEWS + FLOW
# =========================================================

with tab7:
    st.markdown('<div class="section-title">News Aggregator + Event Flow</div>', unsafe_allow_html=True)
    news_df = fetch_news()
    st.dataframe(news_df, use_container_width=True)
    if {"date", "sentiment"}.issubset(news_df.columns):
        nd = news_df.copy()
        nd["date"] = pd.to_datetime(nd["date"], errors="coerce")
        fig_news = px.histogram(
            nd,
            x="topic" if "topic" in nd.columns else "source",
            color="sentiment" if "sentiment" in nd.columns else None,
            title="News Volume / Sentiment",
        )
        fig_news.update_layout(template="plotly_dark", height=450)
        st.plotly_chart(fig_news, use_container_width=True)
    st.markdown("### Event Feed")
    events = [
        "Rates decision monitoring",
        "Earnings season watch",
        "Geo-political escalation tracker",
        "Liquidity regime scan",
        "Supply chain stress monitor",
        "AI capex cycle tracker",
    ]
    for e in events:
        st.write(f"• {e}")
    st.markdown("### Add Your Own News CSV")
    st.code(
        "date,source,title,topic,sentiment\n"
        "2026-03-20,reuters,Central bank holds rates,macro,neutral\n"
        "2026-03-20,bloomberg,Tech earnings surprise,earnings,positive",
        language="text",
    )

# =========================================================
# TAB 8: SIGNAL LAB
# =========================================================

with tab8:
    st.markdown('<div class="section-title">Signal Lab</div>', unsafe_allow_html=True)
    st.write("Use this area to test custom score formulas and strategy rules.")
    s1, s2, s3, s4 = st.columns(4)
    with s1:
        profit_weight = st.slider("Profitability weight", 0.0, 2.0, 1.0, 0.05, key="signal_profit_weight")
    with s2:
        risk_weight = st.slider("Risk weight", 0.0, 2.0, 0.7, 0.05, key="signal_risk_weight")
    with s3:
        momentum_weight = st.slider("Momentum weight", 0.0, 2.0, 0.8, 0.05, key="signal_momentum_weight")
    with s4:
        zscore_weight = st.slider("Z-score weight", 0.0, 2.0, 0.4, 0.05, key="signal_zscore_weight")
    signal_rows = []
    for ticker, d in market_state.items():
        hist_sl = fetch_history(ticker, period="3mo")
        if hist_sl is None or hist_sl.empty:
            continue
        momentum = float((hist_sl["Close"].iloc[-1] / hist_sl["Close"].iloc[-21]) - 1) if len(hist_sl) > 21 else 0.0
        risk = d["volatility"] + abs(d["beta"]) * 0.1
        score = (
            (d["profit_score"] / 100.0) * profit_weight
            + momentum * momentum_weight
            - risk * risk_weight
            + d["zscore"] * zscore_weight * 0.1
        )
        signal_rows.append(
            {
                "Ticker": ticker,
                "Momentum": momentum,
                "Risk": risk,
                "Score": score,
                "Action": signal_label(score),
                "Sector": SECTOR_MAP.get(ticker, "Other"),
            }
        )
    signal_df = pd.DataFrame(signal_rows).sort_values("Score", ascending=False)
    st.dataframe(signal_df, use_container_width=True)
    if not signal_df.empty:
        fig_signal = px.bar(
            signal_df.head(15),
            x="Ticker",
            y="Score",
            color="Action",
            title="Custom Strategy Scores",
        )
        fig_signal.update_layout(template="plotly_dark", height=450)
        st.plotly_chart(fig_signal, use_container_width=True)
    st.markdown("### Signal Formula Notes")
    st.write("• Profitability contributes to long bias")
    st.write("• Risk and beta reduce score")
    st.write("• Momentum improves score")
    st.write("• Z-score can detect stretched moves")

# =========================================================
# TAB 9: FINANCIAL PRESS
# =========================================================

with tab9:
    st.markdown('<div class="section-title">Financial Press — Live Headlines</div>', unsafe_allow_html=True)
    st.caption("Live RSS headlines from global financial publications. Click any headline to read the full article.")
    import xml.etree.ElementTree as ET
    import urllib.request

    RSS_FEEDS = [
        {"name": "Wall Street Journal", "rss": "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", "color": "#c8a84b", "emoji": "📰"},
        {"name": "Financial Times", "rss": "https://www.ft.com/rss/home", "color": "#f4a000", "emoji": "🦢"},
        {"name": "Reuters Business", "rss": "https://feeds.reuters.com/reuters/businessNews", "color": "#ff6600", "emoji": "🔴"},
        {"name": "Bloomberg Markets", "rss": "https://feeds.bloomberg.com/markets/news.rss", "color": "#0068ff", "emoji": "📡"},
        {"name": "Economic Times Markets", "rss": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "color": "#00875a", "emoji": "📈"},
        {"name": "India Today Business", "rss": "https://www.indiatoday.in/rss/1206578", "color": "#e63946", "emoji": "🇮🇳"},
        {"name": "Business Times", "rss": "https://www.businesstimes.com.sg/rss/all-news", "color": "#0099cc", "emoji": "🇸🇬"},
        {"name": "Nikkei Asia", "rss": "https://asia.nikkei.com/rss/feed/nar", "color": "#e30613", "emoji": "🇯🇵"},
    ]

    @st.cache_data(ttl=300)
    def fetch_rss(url: str):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=6) as resp:
                raw = resp.read()
                root = ET.fromstring(raw)
                items = []
                for item in root.iter("item"):
                    title = item.findtext("title", "").strip()
                    link = item.findtext("link", "").strip()
                    pub = item.findtext("pubDate", "").strip()
                    if title and link:
                        items.append({"title": title, "link": link, "pub": pub})
                return items[:8]
        except Exception as e:
            return []

    selected_feed = st.selectbox(
        "Select publication",
        [f["name"] for f in RSS_FEEDS],
        key="press_feed_select",
    )
    chosen_feed = next(f for f in RSS_FEEDS if f["name"] == selected_feed)

    if st.button("🔄 Refresh Headlines", key="rss_refresh_btn"):
        fetch_rss.clear()

    with st.spinner(f"Loading {selected_feed} headlines..."):
        articles = fetch_rss(chosen_feed["rss"])

    st.markdown(f"### {chosen_feed['emoji']} {chosen_feed['name']} — Latest Headlines")
    if articles:
        for art in articles:
            st.markdown(
                f'''<div style="background:#111; border-left:4px solid {chosen_feed["color"]}; border-radius:6px; padding:12px 16px; margin-bottom:10px;">
                        <a href="{art["link"]}" target="_blank" style="color:{chosen_feed["color"]}; font-weight:700; font-family:'JetBrains Mono',monospace; font-size:0.95rem; text-decoration:none;">
                            {art["title"]}
                        </a>
                        <div style="color:#555; font-size:0.75rem; margin-top:4px; font-family:'JetBrains Mono',monospace;">
                            {art["pub"]}
                        </div>
                    </div>''',
                unsafe_allow_html=True,
            )
    else:
        st.warning(
            f"Could not load headlines from {selected_feed}. "
            "Some publications block automated requests. Try another source or click Refresh."
        )

    st.markdown(
        f'<a href="{chosen_feed["rss"]}" target="_blank" style="color:{chosen_feed["color"]};">→ Open RSS feed directly</a>',
        unsafe_allow_html=True,
    )
    st.markdown("---")
    st.markdown("### All Publications")
    all_cols = st.columns(4)
    for i, feed in enumerate(RSS_FEEDS):
        with all_cols[i % 4]:
            st.markdown(
                f'<a href="{feed["rss"]}" target="_blank" style="color:{feed["color"]}; font-family:\'JetBrains Mono\',monospace; font-size:0.85rem;">→ {feed["emoji"]} {feed["name"]}</a>',
                unsafe_allow_html=True,
            )

# =========================================================
# SIDEBAR
# =========================================================

st.sidebar.markdown("### SYSTEM STATUS")
st.sidebar.write("OLLAMA ENGINE: ONLINE" if ollama is not None else "OLLAMA ENGINE: CLIENT MISSING")
st.sidebar.write(f"LLAMA MODEL: {OLLAMA_MODEL}")
st.sidebar.write("COUNCIL SIZE: 10/10")
st.sidebar.progress(1.0)

st.sidebar.markdown("### STARTUP CHECKLIST")
st.sidebar.write("- ollama serve")
st.sidebar.write("- streamlit run zeta.py")
st.sidebar.write("- cd worldmonitor && npm run dev")

st.sidebar.markdown("### EXTEND YOUR STACK")
st.sidebar.write("• Signal Lab to tune weights")
st.sidebar.write("• Alt Data tab for satellite / ESG feeds")
st.sidebar.write("• News + Flow tab for your own CSV news feed")
st.sidebar.write("• GEO-INT tab to open World Monitor")

st.sidebar.caption(f"Updated {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")