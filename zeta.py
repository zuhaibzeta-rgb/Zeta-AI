import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
import ollama # The Llama 3 Engine

load_dotenv()

# --- TERMINAL CONFIG ---
st.set_page_config(page_title="ZETA.AI | GLOBAL COMMAND", layout="wide", initial_sidebar_state="collapsed")

# --- PRO TERMINAL CSS ---
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #050505;
        font-family: 'JetBrains+Mono', monospace;
        color: #e0e0e0;
    }
    .stTabs [data-baseweb="tab-list"] { gap: 10px; background-color: #050505; }
    .stTabs [data-baseweb="tab"] {
        background-color: #111;
        border: 1px solid #333;
        padding: 10px 20px;
        border-radius: 4px;
        color: #888;
    }
    .stTabs [aria-selected="true"] { border-color: #00ff88 !important; color: #00ff88 !important; }
    .metric-card {
        background: #111;
        padding: 15px;
        border-radius: 8px;
        border-left: 5px solid #00ff88;
    }
</style>
""", unsafe_allow_html=True)

# --- THE BOARD OF 10 (Apex Predators) ---
AGENTS = {
    "Warren Buffett": "Value specialist focusing on moats and intrinsic safety.",
    "Jim Simons": "Quantitative wizard looking for mathematical patterns and mean reversion.",
    "George Soros": "Reflexivity expert focusing on geopolitical shifts and social feedback.",
    "Ken Griffin": "Market maker analyzing order flow, liquidity, and multi-strat arbitrage.",
    "Carl Icahn": "Activist focusing on corporate inefficiency and aggressive catalysts.",
    "Ray Dalio": "Macro economist mapping debt cycles and the 'Holy Grail' of diversification.",
    "Peter Lynch": "Growth-at-reasonable-price expert focused on consumer dominance.",
    "Stan Druckenmiller": "Top-down macro trader focusing on central bank policy and liquidity.",
    "John Maynard Keynes": "Psychology expert focusing on animal spirits and market aggregates.",
    "Benjamin Graham": "The father of value investing. Focuses on margin of safety and net-asset value."
}

TICKERS = [
    "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "BRK-B", "LLY", "AVGO",
    "V", "MA", "JPM", "UNH", "COST", "HD", "PG", "NFLX", "AMD", "ADBE",
    "CRM", "WMT", "BAC", "ORCL", "QCOM", "TXN", "TMUS", "INTU", "AMAT", "ISRG"
]

# --- CORE LOGIC ENGINES ---

def get_live_metrics(ticker):
    """Fetches real market data and calculates the 50% profitability rule."""
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period="6mo")
        if df.empty: return None
        
        current_price = df['Close'].iloc[-1]
        # Profitability = Percentage of green days over the last 6 months
        green_days = (df['Close'] > df['Open']).sum()
        profit_score = round((green_days / len(df)) * 100, 1)
        
        return {
            "price": round(current_price, 2),
            "profit_score": profit_score,
            "mkt_cap": stock.info.get('marketCap', 0),
            "pe": stock.info.get('trailingPE', 0)
        }
    except: return None

def run_agent_brain(name, persona, ticker, price, score):
    """Triggers an autonomous Llama 3 process for a specific agent."""
    prompt = f"System: You are {name}, {persona}. Task: Analyze {ticker} at ${price}. Profitability Score: {score}%. Be brief (2 sentences). Provide a signal from: [Strong Buy, Accumulate, Market Perform, Trim, Strong Sell, Extreme Risk]."
    try:
        response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
        return {"agent": name, "thought": response['message']['content']}
    except:
        return {"agent": name, "thought": "Neural link timeout. Connection restricted."}

def run_senior_partner_judge(ticker, reports):
    """Llama 3 acts as the 'Senior Partner' to synthesize all 10 reports into a final verdict."""
    summary = "\n".join([f"{r['agent']}: {r['thought']}" for r in reports])
    prompt = f"You are the ZETA-AI Senior Partner. Review these 10 agent reports for {ticker} and issue a FINAL CONSOLIDATED JUDGMENT. Include specific allocation advice and a confidence percentage.\n\nREPORTS:\n{summary}"
    try:
        response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
        return response['message']['content']
    except:
        return "JUDGE OFFLINE: Local LLM error."

# --- UI LAYOUT ---

st.title("ZETA-AI | GLOBAL COMMAND TERMINAL")

# Global Data Fetch
with st.spinner("Syncing Global Market Data..."):
    market_state = {t: get_live_metrics(t) for t in TICKERS if get_live_metrics(t) is not None}

tab1, tab2, tab3 = st.tabs(["📊 PERFORMANCE HEATMAP", "🌐 GEO-INT (WORLD MONITOR)", "🧊 3D ALPHA-CUBE"])

with tab1:
    st.subheader("Global Equity Heatmap")
    
    # 50% Rule: Green >= 50, Red < 50
    labels, parents, colors, values = ["Market"], [""], ["#000"], [0]
    for t, d in market_state.items():
        labels.append(t)
        parents.append("Market")
        values.append(1000) # Balanced weights
        colors.append("#00ff88" if d['profit_score'] >= 50 else "#ff4444")
    
    fig_heat = go.Figure(go.Treemap(
        labels=labels, parents=parents, values=values,
        marker_colors=colors,
        textinfo="label+text",
        text=[f"{market_state[t]['profit_score']}%" if t in market_state else "" for t in labels]
    ))
    fig_heat.update_layout(margin=dict(t=0, l=0, r=0, b=0), height=500, template="plotly_dark")
    st.plotly_chart(fig_heat, use_container_width=True)

    # Agent Debate Trigger
    selected = st.selectbox("SELECT ASSET FOR COUNCIL DEBATE", list(market_state.keys()))
    if st.button("EXECUTE 10-AGENT AUTONOMOUS DEBATE", type="primary"):
        reports = []
        with st.status(f"Opening Neural Links for {selected}...", expanded=True) as s:
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(run_agent_brain, n, p, selected, market_state[selected]['price'], market_state[selected]['profit_score']) for n, p in AGENTS.items()]
                for f in as_completed(futures):
                    res = f.result()
                    reports.append(res)
                    st.write(f"✅ {res['agent']} response received.")
            
            st.write("⚖️ Senior Partner (Llama 3) is synthesizing verdict...")
            final_verdict = run_senior_partner_judge(selected, reports)
            s.update(label="Debate Concluded", state="complete")
        
        st.markdown(f"### 🛡️ FINAL SENIOR PARTNER VERDICT: {selected}")
        st.info(final_verdict)
        
        # Display the 10 detailed reports
        cols = st.columns(2)
        for i, r in enumerate(reports):
            with cols[i % 2].expander(f"Agent Log: {r['agent']}"):
                st.write(r['thought'])

with tab2:
    st.subheader("Geopolitical Intelligence Interface")
    # This embeds your cloned World Monitor repo (assuming it's running on 5173)
    st.markdown('<iframe src="http://localhost:5173" width="100%" height="800px" style="border:1px solid #333; border-radius:10px;"></iframe>', unsafe_allow_html=True)
    st.caption("Live Geopolitical Risk Layer - Cloned 'worldmonitor' repository integration.")

with tab3:
    st.subheader("3D Risk-Alpha Hypercube")
    # Creating data for 3D mapping
    plot_data = []
    for t, d in market_state.items():
        plot_data.append({"Ticker": t, "Profitability": d['profit_score'], "Price": d['price'], "Mkt_Cap": d['mkt_cap'] / 1e9})
    
    df_3d = pd.DataFrame(plot_data)
    fig_3d = px.scatter_3d(
        df_3d, x='Profitability', y='Price', z='Mkt_Cap',
        color='Profitability', text='Ticker',
        color_continuous_scale='RdYlGn',
        title="3D Market Position: Profit vs Value vs Size"
    )
    fig_3d.update_layout(template="plotly_dark", height=800, scene=dict(
        xaxis_title='Profitability (%)',
        yaxis_title='Price (USD)',
        zaxis_title='Market Cap (Billions)'
    ))
    st.plotly_chart(fig_3d, use_container_width=True)

st.sidebar.markdown("### SYSTEM STATUS")
st.sidebar.write(f"**OLLAMA ENGINE:** ONLINE")
st.sidebar.write(f"**LLAMA 3 STATUS:** ACTIVE")
st.sidebar.write(f"**COUNCIL SIZE:** 10/10")
st.sidebar.progress(1.0)