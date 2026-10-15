# Dataset and training notes

## Dataset source

This project uses scikit-learn's `fetch_20newsgroups` dataset as the documented English-language news corpus for the demo training pipeline. It is a legitimate, widely used benchmark dataset distributed through scikit-learn, and it is appropriate for testing text-classification workflows.

## Why this is limited

The dataset is not a purpose-built fake-news dataset and therefore should not be treated as a factual truth detector. It provides a general reference for language-pattern classification and can support a demonstration pipeline, but production deployment should use a dataset with explicit labels for real-versus-false or credible-versus-suspicious news stories.

## Label definitions

In the demo training script, the model maps the text corpus into a binary classification for a credibility-style demonstration. The API presents the classes as `real` and `fake`; these are proxy labels derived from newsgroup topics, not verified truth labels for real articles. For valid input, the higher-scoring class is always selected, even for a close score, so the result must not be treated as a verified fact.

## Known limitations

- The model is only as reliable as its recorded training data.
- It cannot assess the truth of citations, evidence, or sources.
- It may misclassify shorter or out-of-domain text.
- It is not a substitute for source verification or fact checking.

## Retraining guidance

Use the script in `ml/train.py` to rebuild the model artifact after dataset updates or when a production fake-news dataset is available.
