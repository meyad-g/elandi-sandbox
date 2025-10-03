// Deterministic RNG
export function mulberry32(a: number): () => number {
  return function() {
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function useSeeded(seed: number): () => number {
  return mulberry32(seed);
}

// Utility: shuffle immutable
export function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Skill tagging function
export function tagQuestionSkills(q: { text: string; why: string }): string[] {
  const s = new Set<string>();
  const text = (q.text + " " + q.why).toLowerCase();
  if (/auc|roc|precision|recall|f1|pr\b|overfitting|cross-?validation/.test(text)) s.add("Model Evaluation");
  if (/l1|l2|regularization|weight decay/.test(text)) s.add("Regularization");
  if (/smote|imbalance/.test(text)) s.add("Class Imbalance");
  if (/leakage/.test(text)) s.add("Data Leakage");
  if (/pca|dimensionality/.test(text)) s.add("Dimensionality Reduction");
  if (/xgboost/.test(text)) s.add("XGBoost");
  if (/random forest|tree/.test(text)) s.add("Tree-Based Models");
  if (/svm|margin/.test(text)) s.add("SVM");
  if (/relu|dropout|batch normalization|vanishing/.test(text)) s.add("Deep Learning");
  if (/arima|stationar/.test(text) || /time-?series/.test(text)) s.add("Time Series");
  if (/mle|p-?value|central limit|statistics/.test(text)) s.add("Statistics");
  if (/sql/.test(text)) s.add("SQL");
  if (/logistic|softmax|k-?means|knn|svm|random forest|xgboost|pca/.test(text)) s.add("Machine Learning");
  return Array.from(s);
}
