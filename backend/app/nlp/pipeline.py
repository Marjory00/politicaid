import logging
from functools import lru_cache
from app.core.config import settings

logger = logging.getLogger(__name__)


class NLPPipeline:
    def __init__(self):
        self._summarizer = None
        self._sentiment   = None
        self._nlp_spacy   = None

    def _get_summarizer(self):
        if self._summarizer is None:
            from transformers import pipeline
            logger.info("Loading summarization model...")
            self._summarizer = pipeline(
                "summarization", model=settings.SUMMARIZATION_MODEL,
                max_length=256, min_length=60, do_sample=False,
            )
        return self._summarizer

    def _get_sentiment(self):
        if self._sentiment is None:
            from transformers import pipeline
            logger.info("Loading sentiment model...")
            self._sentiment = pipeline("sentiment-analysis", model=settings.SENTIMENT_MODEL)
        return self._sentiment

    def _get_spacy(self):
        if self._nlp_spacy is None:
            import spacy
            logger.info("Loading spaCy model...")
            self._nlp_spacy = spacy.load("en_core_web_sm")
        return self._nlp_spacy

    def summarize(self, text: str, max_length: int = 256) -> str:
        if not text or len(text.strip()) < 100:
            return text
        truncated = " ".join(text.split()[:3000])
        try:
            result = self._get_summarizer()(truncated, max_length=max_length,
                                            min_length=60, truncation=True)
            return result[0]["summary_text"]
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return text[:500] + "..."

    def analyze_sentiment(self, text: str) -> dict:
        if not text:
            return {"label": "neutral", "score": 0.0, "confidence": 0.0}
        try:
            result     = self._get_sentiment()(text[:512])[0]
            raw_label  = result["label"].lower()
            confidence = round(result["score"], 4)
            score      = confidence if "positive" in raw_label else -confidence
            label      = "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral"
            return {"label": label, "score": round(score, 4), "confidence": confidence}
        except Exception as e:
            logger.error(f"Sentiment failed: {e}")
            return {"label": "neutral", "score": 0.0, "confidence": 0.0}

    def extract_keywords(self, text: str, top_n: int = 15) -> list:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            vectorizer = TfidfVectorizer(stop_words="english", max_features=200, ngram_range=(1, 2))
            vectorizer.fit_transform([text])
            scores = zip(vectorizer.get_feature_names_out(), vectorizer.idf_)
            sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
            return [w for w, _ in sorted_scores[:top_n]]
        except Exception as e:
            logger.error(f"Keywords failed: {e}")
            return []

    def extract_entities(self, text: str) -> dict:
        if not text:
            return {}
        try:
            doc      = self._get_spacy()(text[:5000])
            entities: dict = {}
            for ent in doc.ents:
                entities.setdefault(ent.label_, [])
                if ent.text not in entities[ent.label_]:
                    entities[ent.label_].append(ent.text)
            return entities
        except Exception as e:
            logger.error(f"NER failed: {e}")
            return {}

    def full_analysis(self, text: str) -> dict:
        return {
            "summary":   self.summarize(text),
            "sentiment": self.analyze_sentiment(text),
            "keywords":  self.extract_keywords(text),
            "entities":  self.extract_entities(text),
        }


@lru_cache(maxsize=1)
def get_nlp_pipeline() -> NLPPipeline:
    return NLPPipeline()