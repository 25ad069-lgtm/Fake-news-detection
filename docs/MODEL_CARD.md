# Model card

## Intended use

TruthLens AI is intended as an educational media-literacy tool that estimates whether a submitted article looks more like standard informational reporting or more suspicious, sensational language patterns. It is not a definitive fact-checking or source-verification system.

## Safety and limitations

The system provides estimates using a learned text-classification model. It does not verify the underlying factual accuracy of a claim or detect deception in real time.

## Decision logic

- Predictions are generated only from the trained TF-IDF + classifier pipeline.
- Valid article predictions are presented as `real` or `fake`, using whichever class has the higher model score. Closely matched scores are still assigned to the higher-scoring class; users should not treat the label as verified truth.
- Too-short text or an unavailable model cannot be classified and returns an explanatory non-prediction response.
- Too-short text, unavailable models, or unsupported model artifacts return an explanatory non-prediction response.
- The application avoids presenting a high-confidence estimate as proof of truth or falsehood.

## Training and validation

The demo training script fits a TF-IDF vectorizer and compares a logistic regression model with a linear SVM, then selects the model using validation performance. The final model is evaluated on a held-out test set, and the evaluation metrics are saved in the model metadata.

## Required caution

Use the output as a starting point for responsible review, not as evidence in legal, journalistic, or professional decisions.
