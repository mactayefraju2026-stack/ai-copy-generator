from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import black, white, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import KeepTogether

doc = SimpleDocTemplate(
    "/home/user/ai-copy-generator/MemeCoins-Trading-Guide.pdf",
    pagesize=letter,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle('Title', parent=styles['Normal'],
    fontSize=26, fontName='Helvetica-Bold', textColor=black,
    alignment=TA_CENTER, spaceAfter=6)

subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
    fontSize=13, fontName='Helvetica', textColor=black,
    alignment=TA_CENTER, spaceAfter=20)

h1_style = ParagraphStyle('H1', parent=styles['Normal'],
    fontSize=16, fontName='Helvetica-Bold', textColor=black,
    spaceBefore=18, spaceAfter=8, borderPad=4)

h2_style = ParagraphStyle('H2', parent=styles['Normal'],
    fontSize=13, fontName='Helvetica-Bold', textColor=black,
    spaceBefore=12, spaceAfter=6)

body_style = ParagraphStyle('Body', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', textColor=black,
    spaceBefore=4, spaceAfter=4, leading=16, alignment=TA_JUSTIFY)

bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', textColor=black,
    spaceBefore=3, spaceAfter=3, leading=15, leftIndent=20)

bold_style = ParagraphStyle('Bold', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica-Bold', textColor=black,
    spaceBefore=4, spaceAfter=4)

warning_style = ParagraphStyle('Warning', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica-Bold', textColor=black,
    spaceBefore=6, spaceAfter=6, leading=16, alignment=TA_CENTER)

small_style = ParagraphStyle('Small', parent=styles['Normal'],
    fontSize=9, fontName='Helvetica', textColor=black,
    spaceBefore=2, spaceAfter=2, alignment=TA_CENTER)

story = []

# ─── HEADER ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("MEME COIN TRADING GUIDE", title_style))
story.append(Paragraph("Simple Strategy to Buy Low & Sell for Profit", subtitle_style))
story.append(HRFlowable(width="100%", thickness=2, color=black))
story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("Prepared by Your AI Trading Assistant  |  May 2026", small_style))
story.append(Spacer(1, 0.25*inch))

# ─── SECTION 1: WHAT IS A MEME COIN ──────────────────────────────────────────
story.append(Paragraph("1.  WHAT IS A MEME COIN?", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

story.append(Paragraph(
    "A meme coin is a brand new cryptocurrency token that anyone can create and launch "
    "in seconds. They usually start at a very tiny price — sometimes less than $0.0001 "
    "(a fraction of one cent). When a lot of people start buying it, the price goes up "
    "fast. Early buyers who sell at the right time can double, triple, or even 100x their money.",
    body_style))

story.append(Spacer(1, 0.1*inch))

story.append(Paragraph("Famous examples:", h2_style))
ex_data = [
    ["Coin", "Started At", "Peak Price", "If you invested $100"],
    ["Dogecoin (DOGE)", "$0.0002", "$0.73", "$365,000"],
    ["Shiba Inu (SHIB)", "$0.000000001", "$0.00008", "$8,000,000"],
    ["Pepe (PEPE)", "$0.000001", "$0.00002", "$2,000"],
]
ex_table = Table(ex_data, colWidths=[1.7*inch, 1.3*inch, 1.3*inch, 2.2*inch])
ex_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 10),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#F5F5F5'), white]),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))
story.append(ex_table)
story.append(Spacer(1, 0.08*inch))
story.append(Paragraph("* These are rare extreme cases. Most meme coins go to zero.", small_style))

# ─── SECTION 2: YOUR MATH IS RIGHT ───────────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("2.  YOUR MATH — YOU ARE 100% CORRECT", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

story.append(Paragraph(
    "Here is exactly how the profit works with your own numbers:", body_style))
story.append(Spacer(1, 0.1*inch))

math_data = [
    ["YOUR EXAMPLE", "Numbers", "Result"],
    ["You spend", "$50 total", "Your investment"],
    ["Price per coin at buy", "$1.00 each", "You get 50 coins"],
    ["Price goes up to", "$2.00 each", "2x pump"],
    ["Your 50 coins now worth", "50 x $2.00", "$100.00"],
    ["Your profit", "$100 - $50", "+ $50 PROFIT"],
    ["Return on investment", "$50 / $50", "100% gain = DOUBLED"],
]
math_table = Table(math_data, colWidths=[2.5*inch, 1.8*inch, 2.2*inch])
math_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 11),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 10),
    ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
    ('ROWBACKGROUNDS', (0,1), (-1,-2), [HexColor('#F5F5F5'), white]),
    ('BACKGROUND', (0,-1), (-1,-1), HexColor('#E8E8E8')),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
]))
story.append(math_table)

story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("More profit examples with different pumps:", h2_style))

more_data = [
    ["You Invest", "Coins Bought @ $1", "Price Goes To", "Sell Value", "YOUR PROFIT"],
    ["$50", "50 coins", "$2  (2x)", "$100", "+$50"],
    ["$50", "50 coins", "$3  (3x)", "$150", "+$100"],
    ["$50", "50 coins", "$5  (5x)", "$250", "+$200"],
    ["$100", "100 coins", "$2  (2x)", "$200", "+$100"],
    ["$100", "100 coins", "$3  (3x)", "$300", "+$200"],
    ["$200", "200 coins", "$2  (2x)", "$400", "+$200"],
]
more_table = Table(more_data, colWidths=[1.0*inch, 1.5*inch, 1.3*inch, 1.2*inch, 1.5*inch])
more_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 10),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#F5F5F5'), white]),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('FONTNAME', (-1,1), (-1,-1), 'Helvetica-Bold'),
]))
story.append(more_table)

# ─── SECTION 3: HOW IT WORKS STEP BY STEP ────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("3.  HOW IT WORKS — STEP BY STEP", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

steps = [
    ("STEP 1", "Someone creates a new meme coin on Pump.fun (costs $2 to create on Solana blockchain)."),
    ("STEP 2", "The coin launches at a very tiny price — like $0.000001 or even less than 1 cent."),
    ("STEP 3", "Word spreads on Twitter/X, Telegram, TikTok. People start buying."),
    ("STEP 4", "More buyers = price goes UP. Early buyers who bought at $0.001 now see $0.01 = 10x profit."),
    ("STEP 5", "Smart early buyers SELL at 2x, 3x, or 5x and take their profit."),
    ("STEP 6", "Late buyers get stuck when early buyers sell (price drops back down)."),
]
for title, text in steps:
    row = Table([[Paragraph(title, bold_style), Paragraph(text, body_style)]],
                colWidths=[1.0*inch, 5.5*inch])
    row.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(row)

# ─── SECTION 4: WHERE TO FIND MEME COINS ─────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("4.  WHERE TO FIND NEW MEME COINS", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

tools_data = [
    ["Tool / Website", "What It Does", "Cost"],
    ["pump.fun", "Launch and buy new Solana meme coins", "FREE"],
    ["dexscreener.com", "See NEW tokens the second they launch", "FREE"],
    ["dextools.io", "Filter tokens by liquidity and volume", "FREE"],
    ["coinsniper.net", "List of vetted presale projects", "FREE"],
    ["honeypot.is", "Check if a token is a SCAM before buying", "FREE"],
    ["Phantom Wallet (App)", "Wallet to hold and trade Solana tokens", "FREE"],
]
tools_table = Table(tools_data, colWidths=[2.0*inch, 3.3*inch, 1.2*inch])
tools_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('ALIGN', (0,0), (0,-1), 'LEFT'),
    ('ALIGN', (1,0), (1,-1), 'LEFT'),
    ('ALIGN', (2,0), (2,-1), 'CENTER'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,1), (-1,-1), 10),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#F5F5F5'), white]),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
]))
story.append(tools_table)

# ─── SECTION 5: 5 SAFETY RULES ───────────────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("5.  5 SAFETY RULES — ALWAYS CHECK BEFORE BUYING", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

rules = [
    ("RULE 1", "LIQUIDITY LOCKED",
     "The developer locked the money in the pool so they cannot steal it and run. "
     "Check on DEXTools. If NOT locked — SKIP immediately."),
    ("RULE 2", "MINIMUM $10,000 LIQUIDITY",
     "If the coin has less than $10,000 total, one person can crash the price instantly. "
     "Always check the liquidity number on DexScreener."),
    ("RULE 3", "GROWING VOLUME",
     "Volume should be increasing — for example $500 five minutes ago, now $5,000. "
     "That means real people are buying. Flat or falling volume = no interest."),
    ("RULE 4", "NOT A HONEYPOT",
     "Some fake tokens let you BUY but block you from SELLING. Always check honeypot.is "
     "before you spend even $1. If it is a honeypot — your money is trapped forever."),
    ("RULE 5", "CONTRACT RENOUNCED",
     "The developer gave up control over the code. They cannot secretly print more tokens "
     "and crash the price. Look for 'Renounced' on DexScreener."),
]

for i, (rule, title, desc) in enumerate(rules):
    bg = HexColor('#F0F0F0') if i % 2 == 0 else white
    rule_data = [[
        Paragraph(rule, bold_style),
        Paragraph(f"<b>{title}</b><br/>{desc}", body_style)
    ]]
    rule_table = Table(rule_data, colWidths=[1.0*inch, 5.5*inch])
    rule_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (0,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, black),
    ]))
    story.append(rule_table)
    story.append(Spacer(1, 0.04*inch))

# ─── SECTION 6: THE 50/50 EXIT RULE ──────────────────────────────────────────
story.append(Spacer(1, 0.15*inch))
story.append(Paragraph("6.  THE 50/50 EXIT RULE — HOW TO PROTECT YOUR MONEY", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

story.append(Paragraph(
    "This is the most important rule for meme coin trading. When your coin doubles (2x) "
    "in price — sell HALF immediately. This way you get your original money back, "
    "and the rest rides for free.", body_style))

story.append(Spacer(1, 0.1*inch))

exit_data = [
    ["", "Example with $50 investment"],
    ["You buy", "50 coins at $1 each = $50 spent"],
    ["Price doubles to $2", "Your 50 coins = worth $100"],
    ["YOU SELL HALF (25 coins)", "25 x $2 = $50 back in your pocket"],
    ["You still hold", "25 coins — these are NOW FREE (cost you nothing)"],
    ["If it goes to $0", "You lost nothing — already got $50 back"],
    ["If it goes to $5", "25 x $5 = $125 — PURE PROFIT"],
]
exit_table = Table(exit_data, colWidths=[2.5*inch, 4.0*inch])
exit_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('SPAN', (0,0), (0,0)),
    ('FONTSIZE', (0,0), (-1,0), 11),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ('FONTNAME', (0,3), (-1,3), 'Helvetica-Bold'),
    ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,1), (-1,-1), 10),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#F5F5F5'), white]),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
]))
story.append(exit_table)

# ─── SECTION 7: YOUR BUDGET PLAN ─────────────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("7.  YOUR BUDGET PLAN", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

budget_data = [
    ["Your Total Crypto Budget", "How to Split It", "Why"],
    ["$250 total", "", ""],
    ["$200 (80%)", "ETH + SOL day trading", "Safer, consistent profit"],
    ["$25 (10%)", "Meme coin sniping", "High risk, high reward"],
    ["$25 (10%)", "Emergency / fees", "Always keep some backup"],
    ["Max per meme coin", "$10 – $15 only", "Never bet big on one coin"],
]
budget_table = Table(budget_data, colWidths=[2.2*inch, 2.5*inch, 1.8*inch])
budget_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), black),
    ('TEXTCOLOR', (0,0), (-1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('SPAN', (0,1), (-1,1)),
    ('BACKGROUND', (0,1), (-1,1), HexColor('#DDDDDD')),
    ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('FONTNAME', (0,2), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,2), (-1,-1), 10),
    ('ROWBACKGROUNDS', (0,2), (-1,-2), [HexColor('#F5F5F5'), white]),
    ('BACKGROUND', (0,-1), (-1,-1), HexColor('#E8E8E8')),
    ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
    ('GRID', (0,0), (-1,-1), 0.5, black),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
]))
story.append(budget_table)

# ─── SECTION 8: YOUR FIRST MEME COIN TRADE ───────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(Paragraph("8.  YOUR FIRST MEME COIN TRADE — EXACT STEPS", h1_style))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))

first_steps = [
    ("Step 1", "Download Phantom Wallet app on your phone (free, Solana wallet)"),
    ("Step 2", "Send $25 worth of SOL from Kraken to your Phantom wallet"),
    ("Step 3", "Open DexScreener → tap 'New Pairs' → filter by Solana chain"),
    ("Step 4", "Watch new tokens appear in real time — do NOT buy yet, just watch"),
    ("Step 5", "When you see a token — go to honeypot.is and paste the contract address"),
    ("Step 6", "Check: Is liquidity locked? Is contract renounced? Volume growing?"),
    ("Step 7", "If ALL checks pass → buy $10 worth on Pump.fun or Raydium"),
    ("Step 8", "Set a mental target: when price doubles (2x) → sell half immediately"),
    ("Step 9", "Let the other half ride. If it goes to $0 = you lost $5. If it pumps = profit"),
    ("Step 10", "Never invest more than $15 in any single meme coin. Ever."),
]

for num, (step, text) in enumerate(first_steps):
    bg = HexColor('#F5F5F5') if num % 2 == 0 else white
    step_data = [[Paragraph(step, bold_style), Paragraph(text, body_style)]]
    step_table = Table(step_data, colWidths=[0.85*inch, 5.65*inch])
    step_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (0,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, black),
    ]))
    story.append(step_table)

# ─── SECTION 9: WARNING BOX ───────────────────────────────────────────────────
story.append(Spacer(1, 0.25*inch))
warn_data = [[Paragraph(
    "⚠  IMPORTANT WARNING\n\n"
    "98% of meme coins go to ZERO. Only invest money you can afford to LOSE completely.\n"
    "Never use rent money, savings, or borrowed money.\n"
    "Treat every meme coin investment like a lottery ticket — it might win, it might not.\n"
    "Start with $10 only. Learn first. Scale later.",
    warning_style)]]
warn_table = Table(warn_data, colWidths=[6.5*inch])
warn_table.setStyle(TableStyle([
    ('BOX', (0,0), (-1,-1), 2, black),
    ('TOPPADDING', (0,0), (-1,-1), 14),
    ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ('LEFTPADDING', (0,0), (-1,-1), 14),
    ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ('BACKGROUND', (0,0), (-1,-1), HexColor('#F0F0F0')),
]))
story.append(warn_table)

# ─── FOOTER ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.2*inch))
story.append(HRFlowable(width="100%", thickness=1, color=black))
story.append(Spacer(1, 0.08*inch))
story.append(Paragraph(
    "This guide is for educational purposes only. Not financial advice. "
    "Always do your own research before investing in any cryptocurrency.",
    small_style))
story.append(Paragraph("AI Trading Assistant  |  May 2026", small_style))

doc.build(story)
print("PDF created successfully: MemeCoins-Trading-Guide.pdf")
