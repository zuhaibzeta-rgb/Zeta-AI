import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
import google.generativeai as genai
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="ZETA.AI | Terminal", layout="wide", initial_sidebar_state="collapsed")

# Configure Gemini API (Kept intact as requested)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- ENHANCED CSS ---
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
    
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #050505;
        font-family: 'JetBrains+Mono', monospace;
    }
    
    .main-title {
        font-size: 3rem;
        font-weight: 800;
        letter-spacing: -2px;
        background: linear-gradient(90deg, #00ff88, #00bdff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0;
    }
    
    div.stButton > button {
        background-color: #111;
        border-radius: 8px;
        padding: 15px 10px;
        border: 1px solid #333;
        color: #eee;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    div.stButton > button:hover {
        border-color: #00ff88;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
        color: #00ff88;
    }

    /* CUSTOM TICKER CARDS */
    .ticker-card {
        background-color: #0f0f0f;
        border-radius: 12px;
        padding: 25px 10px;
        text-align: center;
        border: 1px solid #222;
        margin-bottom: 10px;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    .ticker-card h2 {
        margin: 0;
        font-size: 1.8rem;
        color: #ffffff;
        letter-spacing: 1px;
    }
    .ticker-card p {
        margin: 8px 0 0 0;
        font-size: 1rem;
        font-weight: bold;
    }
    .text-bull { color: #00ff88; }
    .text-bear { color: #ff4444; }
    .text-neutral { color: #888888; }

    .prob-button {
        background-color: #0f0f0f;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #222;
        text-align: center;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
    
    .progress-container {
        background-color: #222;
        border-radius: 10px;
        height: 8px;
        width: 100%;
        margin: 15px 0;
    }
    
    .progress-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.8s ease-in-out;
    }
</style>
""", unsafe_allow_html=True)

# --- HEADER ---
cols_head = st.columns([2, 1])
with cols_head[0]:
    st.markdown('<p class="main-title">ZETA.AI</p>', unsafe_allow_html=True)
    st.markdown("<p style='color: #666; margin-top:-10px;'>Hedge Fund Analysis AI — Senior Partner Terminal v2.0</p>", unsafe_allow_html=True)
with cols_head[1]:
    st.markdown(f"<div style='text-align:right; color:#444; margin-top:20px;'>{datetime.now().strftime('%A, %b %d, %Y')}</div>", unsafe_allow_html=True)

st.markdown("---")

TICKERS = ["MSFT", "AMZN", "NVDA", "GOOGL", "META", "AAPL", "V", "MA", "JPM", "UNH"]

STOCK_DESCRIPTIONS = {
    "MSFT": "Microsoft dominates cloud computing (Azure) and enterprise software. A classic Buffett-style moat with consistent growth.",
    "AMZN": "Amazon leads e-commerce and cloud (AWS). Its scale and innovation make it a core holding.",
    "NVDA": "Nvidia is the top player in AI chips and graphics. It's essential for the AI revolution.",
    "GOOGL": "Google (Alphabet) dominates search, online advertising, and YouTube. Also a leader in AI.",
    "META": "Meta owns Facebook, Instagram, WhatsApp, and is investing heavily in the metaverse.",
    "AAPL": "Apple's ecosystem (iPhone, Mac, services) creates unmatched customer loyalty and cash flow.",
    "V": "Visa is a global payments giant, benefiting from the shift to digital transactions.",
    "MA": "Mastercard, like Visa, is a key player in the growing electronic payments space.",
    "JPM": "JPMorgan Chase is the largest US bank, with diverse revenue streams and strong management.",
    "UNH": "UnitedHealth Group is a leading health insurer and healthcare services company, with steady growth."
}

AGENTS = [
    {"name": "Warren Buffett", "personality": "value investor focused on moats, long-term holding, and intrinsic value. You prefer companies with strong fundamentals and consistent earnings. Be decisive."},
    {"name": "Charlie Munger", "personality": "wise investor who emphasizes mental models, avoiding stupidity, and long-term thinking. You look for businesses with durable competitive advantages. Be decisive."},
    {"name": "Michael Burry", "personality": "contrarian value investor who digs deep into financials and bets against the consensus. Not afraid to take unpopular positions or short heavily. Be highly critical and decisive."},
    {"name": "Cathie Wood", "personality": "growth-focused investor who believes in disruptive innovation and high-conviction bets on future technologies. Willing to accept high volatility for exponential growth. Be aggressive and decisive."}
]

# --- PRECOMPUTED PRESENTATION DATA ---
PRECOMPUTED_ANALYSIS = {
    "NVDA": {
        "Warren Buffett": {"quote": "I've always said I don't invest in what I don't understand. But Nvidia's $550 billion backlog isn't a prediction—it's a signed contract. When I see a company with that much visibility and a true economic moat in CUDA, even an old man from Omaha can understand the math.", "rec": "BUY", "conf": 90},
        "Charlie Munger": {"quote": "The market is terrified of competition, as they always are. They forget that Nvidia isn't just selling chips; they're selling the entire ecosystem. It took two decades to build CUDA. You can't replicate that in two years. The moat is time itself.", "rec": "BUY", "conf": 85},
        "Cathie Wood": {"quote": "The market is missing the inference explosion. Training gets the headlines, but inference—where AI actually runs—will be 10x larger. Nvidia's Blackwell architecture is purpose-built for this, and the $3-4 trillion infrastructure spend by 2030 flows almost entirely through their data centers.", "rec": "BUY", "conf": 95},
        "Michael Burry": {"quote": "The stock has gone nowhere in six months while the iShares Semiconductor ETF returned 30%. Everyone is waiting for a pullback that isn't coming. The GTC catalysts—Rubin updates, Kyber architecture, the $600 billion pipeline revision—will force the laggards back in. The fear is priced in; the growth isn't.", "rec": "BUY", "conf": 80}
    },
    "MSFT": {
        "Warren Buffett": {"quote": "Microsoft's shift to controlling the 'keys' to enterprise AI—the identity and permissions layer—is exactly the kind of unshakeable toll bridge I admire. It doesn't matter if the road is made of asphalt or ones and zeros; if you own the gate, you own the future tolls.", "rec": "BUY", "conf": 80},
        "Charlie Munger": {"quote": "The rest of the world is fighting over who has the best AI model, which is like fighting over who has the best hammer. Microsoft is selling the building codes and the permits. That's a much better business to be in.", "rec": "BUY", "conf": 80},
        "Cathie Wood": {"quote": "While others debate hardware cycles, Microsoft is capturing the highest value in the AI stack—the data and context layer. The exponential growth in enterprise data being processed by Copilots will dwarf previous software paradigms.", "rec": "BUY", "conf": 90},
        "Michael Burry": {"quote": "Sentiment is too complacent. The market is pricing this 'control premium' to perfection, ignoring the regulatory heat that comes with being the world's operating system. The 9.74% dip since last year was a warning; another one is coming.", "rec": "SELL", "conf": 60}
    },
    "AMZN": {
        "Warren Buffett": {"quote": "Jeff proved you can build a moat around a low-margin retail business by adding high-margin services. But their latest AI investment is a bet on the future, not a claim on the present. I like certainty, and $200 billion is the opposite of certainty.", "rec": "HOLD", "conf": 60},
        "Charlie Munger": {"quote": "Retail is a tough business, always has been. The magic of Amazon is AWS. Now they're using AWS's profits to build a digital universe. It might work, but it requires a level of optimism that usually makes me reach for my wallet—to keep it closed.", "rec": "HOLD", "conf": 70},
        "Cathie Wood": {"quote": "The emergence of 'super-sellers' using AI tools is a massive, underappreciated catalyst. This creates a flywheel: more sellers use AI to sell more, which drives more ad spend back to Amazon. This is convergence at its finest.", "rec": "BUY", "conf": 85},
        "Michael Burry": {"quote": "Insiders are selling, Dan Loeb is trimming, and they're raising $40 billion in debt while planning a $200 billion spend. When management asks for cash and sells shares simultaneously, I listen to what their wallets are saying, not their press releases.", "rec": "SELL", "conf": 80}
    },
    "GOOGL": {
        "Warren Buffett": {"quote": "For decades, I've loved the advertising toll road. Google owns the widest, most-used road in history. Now they are using the tolls to pave new roads in AI. It's a capital allocation strategy that would make capital cities jealous.", "rec": "BUY", "conf": 85},
        "Charlie Munger": {"quote": "The market is worried about them spending too much. That's foolish. If you have a castle, you spend whatever it takes to keep the barbarians out. Google is building the strongest moat possible—one so deep that few can even afford to look across it.", "rec": "BUY", "conf": 85},
        "Cathie Wood": {"quote": "The market is missing the 'diversification' narrative. By monetizing their global consumer data through enterprise cloud licensing, they are de-risking the entire business from ad cycles. This multiple expansion story is just beginning.", "rec": "BUY", "conf": 90},
        "Michael Burry": {"quote": "Everyone is comfortable because they've 'successfully' moved Search to AI answers. But 'success' here means cannibalizing high-margin blue links for synthesized answers that may have lower monetization. The future looks great, but the transition costs are hidden.", "rec": "HOLD", "conf": 60}
    },
    "META": {
        "Warren Buffett": {"quote": "I like businesses that print money. Meta prints money. But I don't like businesses that spend that money on futuristic dreams while cutting 20% of their workforce. There's a discipline missing here that makes me nervous.", "rec": "HOLD", "conf": 70},
        "Charlie Munger": {"quote": "The metaverse was a hallucination, and now they're pivoting to AI. The problem isn't the technology; it's the culture. A company that chases shiny objects while pausing undersea cables is a company that doesn't know where it's going.", "rec": "SELL", "conf": 80},
        "Cathie Wood": {"quote": "The 8% dip is a gift. They are pausing subsea cables to reallocate capital to AI compute—exactly the right move. The convergence of social graphs with AI-generated content will create the most immersive advertising platform in history.", "rec": "BUY", "conf": 90},
        "Michael Burry": {"quote": "The narrative is that cuts fund AI. But when you cut people to buy machines, you're betting the machine is smarter. The market is priced for that bet to pay off instantly. If the AI ROI takes longer than expected, the multiple will compress faster than the stock.", "rec": "SELL", "conf": 60}
    },
    "AAPL": {
        "Warren Buffett": {"quote": "I bought Apple because it became a consumer staple, not a tech stock. But now, the government in its second-largest market is setting its prices (App Store fees). That violates my first rule: I need to know the rules of the game. In China, the rules just changed.", "rec": "SELL", "conf": 70},
        "Charlie Munger": {"quote": "This is simple. The Chinese government just told Apple how much it can charge. You never let a landlord tell you how much rent to collect. The China risk I was willing to accept is now the China reality I'm not willing to own.", "rec": "SELL", "conf": 85},
        "Cathie Wood": {"quote": "The hardware is a trap. The market is missing the Services 2.0 story—exclusive sports rights on Apple TV creating a super-cycle of subscription bundling. The F1 ratings win proves they are learning to play Hollywood's game, and they'll win it.", "rec": "BUY", "conf": 80},
        "Michael Burry": {"quote": "Insiders are selling into strength while the China App Store narrative turns from growth to regulated utility. This is the classic two-step: strong consumer brand masking a deteriorating business model. The gap between perception and reality is widest here.", "rec": "SELL", "conf": 75}
    },
    "V": {
        "Warren Buffett": {"quote": "When the best house on the block goes on sale because the neighborhood got some graffiti, I don't panic. Visa is the best house. The regulatory graffiti will wash off; the moat of the global payments rail will not.", "rec": "BUY", "conf": 85},
        "Charlie Munger": {"quote": "People are worried about 'fintech disruption.' Visa has survived every disruption since the invention of the credit card. The volume of transactions grows, and Visa takes a tiny, invisible piece. Worrying about Visa is worrying about gravity.", "rec": "BUY", "conf": 80},
        "Cathie Wood": {"quote": "The market is looking backwards at regulatory fears, not forwards at convergence. Visa's new 'Agent Suite' AI tools will enable autonomous commerce between machines. In a world of AI agents, Visa becomes the universal translator for money.", "rec": "BUY", "conf": 85},
        "Michael Burry": {"quote": "The volatility skew is flat. In a historically bad year, the 'smart money' isn't hedging? That's not confidence; that's negligence. When the crowd is this relaxed about a stock that's down 10% in two months, the real shoe has yet to drop.", "rec": "SELL", "conf": 70}
    },
    "MA": {
        "Warren Buffett": {"quote": "Visa and Mastercard are the railroads of the 21st century. But Mastercard's growth in value-added services—cybersecurity, data analytics—means they aren't just hauling the freight anymore; they're packaging it, too. That's added pricing power.", "rec": "BUY", "conf": 85},
        "Charlie Munger": {"quote": "The笨蛋 (idiots) in Washington are talking about rate caps. They don't understand that the economics of payments are global. Mastercard makes money in 210 countries. You can't cap the world. The noise is a buying opportunity.", "rec": "BUY", "conf": 80},
        "Cathie Wood": {"quote": "Earnings show the market is undervaluing their 'non-transaction' revenue. The 22% growth in services like cybersecurity and AI-driven analytics is a high-margin, scalable business that decouples them from consumer spend volatility.", "rec": "BUY", "conf": 80},
        "Michael Burry": {"quote": "Post-earnings, the stock settled around $520. That tells me the good news is priced in. Meanwhile, central banks are building real-time payment systems to bypass cards. The moat is wide, but the water level is being drained by sovereigns.", "rec": "HOLD", "conf": 65}
    },
    "JPM": {
        "Warren Buffett": {"quote": "Jamie Dimon has built a fortress. In banking, you survive the winters by having the thickest walls. JPMorgan has the thickest walls. They will use the fear around private credit and regional banking to buy assets at fair prices. The strong get stronger.", "rec": "BUY", "conf": 90},
        "Charlie Munger": {"quote": "Banking is a simple business made complicated by bad management. JPMorgan has good management. They are using AI to cut costs while others are using AI to speculate. That's the difference between a compounder and a gambler.", "rec": "BUY", "conf": 85},
        "Cathie Wood": {"quote": "JPMorgan is a sleeping giant in the tokenization of real-world assets. While the market sees a conservative bank, I see the largest financial institution preparing to run nodes on the biggest blockchain networks. The convergence of TradFi and DeFi runs through their data center.", "rec": "BUY", "conf": 80},
        "Michael Burry": {"quote": "Goldman says 'AI-driven productivity.' That's code for 'we're going to fire people and replace them with software.' The stock is up on the promise of cost-cutting, not revenue growth. Eventually, you can't cut your way to a higher stock price.", "rec": "SELL", "conf": 60}
    },
    "UNH": {
        "Warren Buffett": {"quote": "Healthcare costs are the tapeworm of the American economy. UnitedHealth is the only company big enough and smart enough to actually do something about it. I invest in solutions, and UNH is the closest thing we have to a solution.", "rec": "BUY", "conf": 80},
        "Charlie Munger": {"quote": "The government is their biggest customer and their biggest regulator. That's a dangerous combination. But if you have to play that game, you want the player with the best data and the most vertical integration. That's UNH.", "rec": "BUY", "conf": 80},
        "Cathie Wood": {"quote": "The market is focusing on Medicare reimbursement noise, missing the convergence of data science and care delivery. Optum's AI-driven health analytics will fundamentally lower the cost of care, a value proposition no government can ignore or regulate away.", "rec": "BUY", "conf": 85},
        "Michael Burry": {"quote": "The setup is classic. Political headlines create a ceiling, demographic trends create a floor. The stock is stuck between 'the government might pay us less' and 'there are more old people every day.' In that range, the smart money waits for the panic to buy.", "rec": "HOLD", "conf": 70}
    }
}

def get_profitability(ticker):
    try:
        data = yf.download(ticker, period="6mo", interval="1d", progress=False)
        if data.empty or len(data) < 2: return None
        if isinstance(data.columns, pd.MultiIndex): data.columns = data.columns.get_level_values(0)
        closes = data['Close'].values
        up_days = sum(1 for i in range(1, len(closes)) if closes[i] > closes[i-1])
        return round((up_days / (len(closes) - 1)) * 100, 1)
    except Exception: return None

@st.cache_data(ttl=3600)
def load_all_profitabilities():
    return {ticker: get_profitability(ticker) for ticker in TICKERS}

profitabilities = load_all_profitabilities()

if "selected_stock" not in st.session_state:
    st.session_state.selected_stock = None

# --- PARALLEL AGENT FUNCTION (MOCKED FOR PRESENTATION) ---
def fetch_agent_response(agent, ticker, current_price, current_pe, prof_score, news_context):
    # Simulate API thinking time for the presentation effect
    time.sleep(0.8)
    
    agent_name = agent['name']
    
    # Pull from our precomputed dictionary
    data = PRECOMPUTED_ANALYSIS.get(ticker, {}).get(agent_name, {})
    
    if not data:
        # Fallback in case a ticker/agent combo is missing
        return agent_name, "Model processing error. Defaulting to neutral weight.", "HOLD", 50
        
    quote = data.get("quote", "No comment.")
    rec = data.get("rec", "HOLD")
    conf = data.get("conf", 50)
    
    # Format to match the original layout in the UI expanders
    formatted_text = f"{quote}\n\nRECOMMENDATION: {rec}\nCONFIDENCE: {conf}"
    
    return agent_name, formatted_text, rec, conf


# --- UI ROUTING ---
if st.session_state.selected_stock is None:
    st.subheader("Institutional Portfolio Overview")
    cols = st.columns(5)
    
    # Render Redesigned Cards
    for i, ticker in enumerate(TICKERS):
        with cols[i % 5]:
            profit = profitabilities[ticker]
            if profit is None:
                profit_str, sentiment, p_class = "N/A", "Neutral", "text-neutral"
            else:
                profit_str = f"{profit}%"
                sentiment = "Bullish" if profit > 50 else "Bearish"
                p_class = "text-bull" if profit > 50 else "text-bear"
            
            # HTML for the Card Look
            st.markdown(f"""
            <div class="ticker-card">
                <h2>{ticker}</h2>
                <p class="{p_class}">{profit_str} {sentiment}</p>
            </div>
            """, unsafe_allow_html=True)
            
            # Button nested right below the card
            if st.button(f"Analyze {ticker}", key=f"btn_{ticker}", use_container_width=True):
                st.session_state.selected_stock = ticker
                st.rerun()
                
else:
    ticker = st.session_state.selected_stock
    
    if st.button("← RETURN TO TERMINAL", use_container_width=False):
        st.session_state.selected_stock = None
        st.rerun()
    
    # --- FETCH DATA ---
    stock = yf.Ticker(ticker)
    info = stock.info
    
    # --- FETCH NEWS ---
    try:
        raw_news = stock.news[:3]
        headlines = [item['title'] for item in raw_news] if raw_news else ["No major recent news detected."]
    except Exception:
        headlines = ["Unable to fetch recent news."]
    news_context = "\n".join([f"- {h}" for h in headlines])
    
    # --- KEY METRICS BAR ---
    st.markdown(f"### {ticker} | {info.get('longName', ticker)}")
    st.caption(STOCK_DESCRIPTIONS[ticker])
    
    m_cols = st.columns(4)
    with m_cols[0]:
        st.metric("Price", f"${info.get('currentPrice', 'N/A')}", f"{info.get('revenueGrowth', 0)*100:.1f}% Rev Growth")
    with m_cols[1]:
        st.metric("Market Cap", f"{info.get('marketCap', 0)/1e9:.1f}B")
    with m_cols[2]:
        st.metric("P/E Ratio", f"{info.get('trailingPE', 'N/A')}")
    with m_cols[3]:
        st.metric("52W High", f"${info.get('fiftyTwoWeekHigh', 'N/A')}")

    @st.cache_data(ttl=3600)
    def load_enhanced_data(ticker):
        data = yf.download(ticker, period="1y", interval="1d", progress=False)
        if isinstance(data.columns, pd.MultiIndex): data.columns = data.columns.get_level_values(0)
        data['SMA20'] = data['Close'].rolling(window=20).mean()
        data['SMA50'] = data['Close'].rolling(window=50).mean()
        return data

    data = load_enhanced_data(ticker)
    
    if not data.empty:
        # Technical Chart
        fig = go.Figure()
        fig.add_trace(go.Candlestick(
            x=data.index, open=data['Open'], high=data['High'],
            low=data['Low'], close=data['Close'], name="Market"
        ))
        fig.add_trace(go.Scatter(x=data.index, y=data['SMA20'], line=dict(color='#00bdff', width=1), name='20-Day SMA'))
        fig.add_trace(go.Scatter(x=data.index, y=data['SMA50'], line=dict(color='#ffaa00', width=1), name='50-Day SMA'))

        fig.update_layout(
            template="plotly_dark",
            height=600,
            xaxis_rangeslider_visible=False,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            yaxis=dict(gridcolor='#222', title="Price USD"),
            xaxis=dict(gridcolor='#222')
        )
        st.plotly_chart(fig, use_container_width=True)

    # --- THE DEBATE WAR ROOM ---
    if st.button("RUN QUANTITATIVE DEBATE", type="primary", use_container_width=True):
        st.markdown("---")
        
        current_price = info.get('currentPrice', 'N/A')
        current_pe = info.get('trailingPE', 'N/A')
        prof_score = profitabilities.get(ticker, 'N/A')
        
        votes = []
        debate_logs = []
        
        with st.status("Executing Multi-Agent Analysis Concurrently...", expanded=True) as status:
            st.write("Fetching latest news sentiment...")
            for h in headlines:
                st.write(f"📰 {h}")
            st.write("Initializing agent neural links...")
            
            # --- THE CONCURRENCY FIX ---
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [executor.submit(fetch_agent_response, agent, ticker, current_price, current_pe, prof_score, news_context) for agent in AGENTS]
                
                for future in as_completed(futures):
                    name, text, rec, conf = future.result()
                    votes.append((rec, conf))
                    debate_logs.append({"name": name, "text": text})
                
            status.update(label="Analysis Complete", state="complete", expanded=False)

        # Show Rationale in Expanders
        st.subheader("Model Rationale Logs")
        for log in debate_logs:
            with st.expander(f"Agent Log: {log['name']}"):
                st.write(log['text'])

        # Aggregate Result
        actions = ["BUY", "SELL", "HOLD"]
        probs = {a: 0 for a in actions}
        for r, c in votes:
            if r in probs: probs[r] += c
        
        total = sum(probs.values())
        final_probs = {a: round((probs[a]/total)*100) if total > 0 else 0 for a in actions}

        st.markdown("#### Final Aggregate Decision")
        p_cols = st.columns(3)
        colors = {"BUY": "#00ff88", "SELL": "#ff4444", "HOLD": "#ffaa00"}
        
        for i, action in enumerate(actions):
            with p_cols[i]:
                conf = final_probs[action]
                st.markdown(f"""
                <div class="prob-button">
                    <span style="font-size:0.8rem; color:#666;">SIGNAL</span>
                    <div style="font-weight:bold; color:{colors[action]}; font-size:1.2rem;">{action}</div>
                    <div class="progress-container">
                        <div class="progress-fill" style="width:{conf}%; background:{colors[action]}; box-shadow: 0 0 10px {colors[action]};"></div>
                    </div>
                    <div style="font-size:1.1rem;">{conf}%</div>
                </div>
                """, unsafe_allow_html=True)
                
        # --- EXPORT REPORT GENERATION ---
        st.markdown("---")
        
        report_md = f"# ZETA.AI Investment Tear-Sheet: {ticker}\n\n"
        report_md += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
        report_md += f"**Current Price:** ${current_price} | **P/E Ratio:** {current_pe}\n\n"
        
        report_md += "### Recent News Context\n"
        for h in headlines:
            report_md += f"- {h}\n"
            
        report_md += "\n### Quantitative Multi-Agent Debate\n"
        for log in debate_logs:
            report_md += f"**{log['name']}:**\n{log['text']}\n\n"
            
        report_md += "### Final Proprietary Verdict\n"
        for action in actions:
            report_md += f"- **{action}:** {final_probs[action]}%\n"
            
        st.download_button(
            label="📄 EXPORT TEAR-SHEET (MD)",
            data=report_md,
            file_name=f"{ticker}_zeta_report_{datetime.now().strftime('%Y%m%d')}.md",
            mime="text/markdown",
            use_container_width=True
        )

st.markdown("<br><br><p style='text-align:center; color:#333; font-size:0.7rem;'>PROPRIETARY SYSTEM - ZETA ASSET MANAGEMENT</p>", unsafe_allow_html=True)