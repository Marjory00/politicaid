"""
Export Service — generates PDF and CSV exports of bills.
"""
import io
import csv
import logging
from typing import List
from app.models.bill import Bill

logger = logging.getLogger(__name__)


class ExportService:

    def export_csv(self, bills: List[Bill]) -> bytes:
        """
        Generate a CSV file from a list of bills.
        Returns bytes that can be streamed as a file download.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            "Bill Number", "Title", "Status", "Chamber",
            "Sponsor", "Party", "Introduced Date",
            "Sentiment Label", "Sentiment Score",
            "Yea Votes", "Nay Votes", "Abstain Votes",
            "Summary", "Source URL"
        ])

        # Data rows
        for bill in bills:
            writer.writerow([
                bill.bill_number,
                bill.title,
                bill.status,
                bill.chamber or "",
                bill.sponsor or "",
                bill.sponsor_party or "",
                str(bill.introduced_date)[:10] if bill.introduced_date else "",
                bill.sentiment_label or "",
                bill.sentiment_score or "",
                bill.yea_votes or 0,
                bill.nay_votes or 0,
                bill.abstain_votes or 0,
                (bill.summary or "")[:200],
                bill.source_url or "",
            ])

        return output.getvalue().encode("utf-8")

    def export_pdf(self, bills: List[Bill]) -> bytes:
        """
        Generate a PDF report from a list of bills.
        Returns bytes that can be streamed as a file download.
        """
        try:
            from fpdf import FPDF

            pdf = FPDF()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.add_page()

            # ── Title ──────────────────────────────────────
            pdf.set_font("Helvetica", "B", 20)
            pdf.set_text_color(26, 54, 93)
            pdf.cell(0, 12, "PoliticAId — Legislative Bills Report", ln=True, align="C")

            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 6, f"Total bills: {len(bills)}", ln=True, align="C")
            pdf.ln(8)

            # ── Bills ──────────────────────────────────────
            for i, bill in enumerate(bills, 1):
                # Bill header
                pdf.set_fill_color(240, 245, 255)
                pdf.set_font("Helvetica", "B", 12)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(0, 8, f"{i}. {bill.bill_number} — {bill.title[:70]}{'...' if len(bill.title) > 70 else ''}", ln=True, fill=True)

                # Metadata row
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(80, 80, 80)
                status  = str(bill.status or "").replace("_", " ").title()
                sponsor = bill.sponsor or "Unknown"
                chamber = bill.chamber or "—"
                date    = str(bill.introduced_date)[:10] if bill.introduced_date else "—"
                pdf.cell(0, 5, f"Status: {status}   |   Sponsor: {sponsor}   |   Chamber: {chamber}   |   Introduced: {date}", ln=True)

                # Sentiment
                if bill.sentiment_label:
                    sentiment_colors = {
                        "positive": (34, 197, 94),
                        "negative": (239, 68, 68),
                        "neutral":  (148, 163, 184),
                        "mixed":    (245, 158, 11),
                    }
                    r, g, b = sentiment_colors.get(bill.sentiment_label, (100, 100, 100))
                    pdf.set_text_color(r, g, b)
                    score = f"{bill.sentiment_score:.3f}" if bill.sentiment_score else "—"
                    pdf.set_font("Helvetica", "B", 9)
                    pdf.cell(0, 5, f"Sentiment: {bill.sentiment_label.upper()}  |  Score: {score}  |  Votes: {bill.yea_votes} Yea / {bill.nay_votes} Nay", ln=True)

                # Summary
                if bill.summary:
                    pdf.set_text_color(60, 60, 60)
                    pdf.set_font("Helvetica", "", 9)
                    summary = bill.summary[:300] + "..." if len(bill.summary) > 300 else bill.summary
                    pdf.multi_cell(0, 5, f"Summary: {summary}")

                pdf.set_text_color(0, 0, 0)
                pdf.ln(4)

                # Page break safety
                if pdf.get_y() > 260:
                    pdf.add_page()

            return bytes(pdf.output())

        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            raise

    def export_single_pdf(self, bill: Bill) -> bytes:
        """
        Generate a detailed PDF report for a single bill.
        """
        try:
            from fpdf import FPDF

            pdf = FPDF()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.add_page()

            # ── Header ─────────────────────────────────────
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_text_color(26, 54, 93)
            pdf.cell(0, 10, "PoliticAId — Bill Report", ln=True, align="C")
            pdf.ln(5)

            # ── Bill Number + Title ────────────────────────
            pdf.set_fill_color(26, 54, 93)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 8, f"  {bill.bill_number}", ln=True, fill=True)

            pdf.set_text_color(26, 54, 93)
            pdf.set_font("Helvetica", "B", 14)
            pdf.multi_cell(0, 8, bill.title)
            pdf.ln(4)

            # ── Metadata ───────────────────────────────────
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(80, 80, 80)
            fields = [
                ("Sponsor",    bill.sponsor or "—"),
                ("Party",      bill.sponsor_party or "—"),
                ("Chamber",    bill.chamber or "—"),
                ("Session",    bill.congress_session or "—"),
                ("Status",     str(bill.status or "—").replace("_", " ").title()),
                ("Introduced", str(bill.introduced_date)[:10] if bill.introduced_date else "—"),
                ("Source",     bill.source or "—"),
            ]
            for label, value in fields:
                pdf.set_font("Helvetica", "B", 10)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(35, 7, f"{label}:", border=0)
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(60, 60, 60)
                pdf.cell(0, 7, value, ln=True)
            pdf.ln(4)

            # ── Sentiment ──────────────────────────────────
            if bill.sentiment_label:
                pdf.set_fill_color(240, 245, 255)
                pdf.set_font("Helvetica", "B", 11)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(0, 8, "Sentiment Analysis", ln=True, fill=True)
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(60, 60, 60)
                pdf.cell(0, 6, f"Label: {bill.sentiment_label.upper()}   Score: {bill.sentiment_score:.3f}   Confidence: {(bill.sentiment_confidence or 0)*100:.1f}%", ln=True)
                pdf.ln(3)

            # ── Votes ──────────────────────────────────────
            pdf.set_fill_color(240, 245, 255)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(26, 54, 93)
            pdf.cell(0, 8, "Vote Breakdown", ln=True, fill=True)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(60, 60, 60)
            pdf.cell(0, 6, f"Yea: {bill.yea_votes}   Nay: {bill.nay_votes}   Abstain: {bill.abstain_votes}", ln=True)
            pdf.ln(3)

            # ── Summary ────────────────────────────────────
            if bill.summary:
                pdf.set_fill_color(240, 245, 255)
                pdf.set_font("Helvetica", "B", 11)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(0, 8, "AI Summary", ln=True, fill=True)
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(60, 60, 60)
                pdf.multi_cell(0, 6, bill.summary)
                pdf.ln(3)

            # ── Keywords ───────────────────────────────────
            if bill.keywords:
                pdf.set_fill_color(240, 245, 255)
                pdf.set_font("Helvetica", "B", 11)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(0, 8, "Keywords", ln=True, fill=True)
                pdf.set_font("Helvetica", "", 10)
                pdf.set_text_color(60, 60, 60)
                pdf.cell(0, 6, ", ".join(bill.keywords[:15]), ln=True)
                pdf.ln(3)

            # ── Full Text ──────────────────────────────────
            if bill.full_text:
                pdf.set_fill_color(240, 245, 255)
                pdf.set_font("Helvetica", "B", 11)
                pdf.set_text_color(26, 54, 93)
                pdf.cell(0, 8, "Full Bill Text (excerpt)", ln=True, fill=True)
                pdf.set_font("Helvetica", "", 9)
                pdf.set_text_color(60, 60, 60)
                excerpt = bill.full_text[:2000] + "..." if len(bill.full_text) > 2000 else bill.full_text
                pdf.multi_cell(0, 5, excerpt)

            # ── Footer ─────────────────────────────────────
            pdf.set_y(-20)
            pdf.set_font("Helvetica", "I", 8)
            pdf.set_text_color(150, 150, 150)
            pdf.cell(0, 5, "Generated by PoliticAId — AI Legislative Intelligence Platform", align="C")

            return bytes(pdf.output())

        except Exception as e:
            logger.error(f"Single bill PDF failed: {e}")
            raise