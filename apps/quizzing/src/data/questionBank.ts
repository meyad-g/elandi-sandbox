import { Question } from '../types/quiz';
import { tagQuestionSkills } from '../utils/quizUtils';

export const QUESTION_BANK: Question[] = [
  { text: "AUC‑ROC is threshold independent.", answer: true, why: "ROC considers TPR/FPR across all thresholds, so it doesn't depend on a single cut‑off.", skill: "Machine Learning" },
  { text: "Precision measures the proportion of predicted positives that are actually positive.", answer: true, why: "Precision = TP / (TP + FP)." },
  { text: "Recall is TP/(TP+FP).", answer: false, why: "Recall = TP / (TP + FN). TP/(TP+FP) is precision." },
  { text: "L1 regularization tends to produce sparse models by driving some weights to zero.", answer: true, why: "L1 adds an absolute‑value penalty that encourages exact zeros." },
  { text: "During inference, batch normalization uses the current batch statistics.", answer: false, why: "At inference you use the running (moving‑average) mean/variance from training, not the batch." },
  { text: "In k‑means, increasing k never increases within‑cluster SSE (inertia).", answer: true, why: "With more clusters you can only match or reduce within‑cluster sum of squares." },
  { text: "Vanishing gradients are more common with sigmoid/tanh than ReLU.", answer: true, why: "Sigmoid/tanh saturate; ReLU alleviates saturation for positive activations." },
  { text: "A p‑value < 0.05 proves the alternative hypothesis is true.", answer: false, why: "P‑values quantify evidence under H0; they don't prove HA is true." },
  { text: "Random Forests overfit less than a single decision tree.", answer: true, why: "Bagging + feature subsampling reduce variance vs. one deep tree." },
  { text: "Multicollinearity inflates the variance of coefficient estimates.", answer: true, why: "High correlation among predictors makes estimates unstable/high‑variance." },
  { text: "Dropout is only used at inference time to improve generalization.", answer: false, why: "Dropout is applied during training; it's disabled (or averaged via MC‑dropout) at inference." },
  { text: "SMOTE creates synthetic minority samples by interpolating between neighbors.", answer: true, why: "It synthesizes samples along line segments joining k‑nearest minority neighbors." },
  { text: "The bias (intercept) in linear models shifts the decision boundary.", answer: true, why: "The intercept translates the hyperplane without changing its orientation." },
  { text: "Logistic regression outputs probabilities conditioned on features.", answer: true, why: "p(y=1|x) = σ(w·x + b)." },
  { text: "Softmax regression is equivalent to binary logistic regression when there are two classes.", answer: true, why: "Softmax with 2 classes reduces to the logistic function." },
  { text: "The Central Limit Theorem says any distribution becomes normal with enough data.", answer: false, why: "It says the sampling distribution of the mean tends to normal, not the data themselves." },
  { text: "On highly imbalanced datasets, AUC‑PR is usually more informative than AUC‑ROC.", answer: true, why: "PR focuses on performance on the positive class and ignores TNs." },
  { text: "Cross‑validation should be performed only after hyperparameter tuning.", answer: false, why: "Use CV during tuning; for unbiased evaluation, use nested CV or a held‑out test set." },
  { text: "One‑hot encoding all levels with an intercept can cause the dummy variable trap.", answer: true, why: "You need to drop one level to avoid perfect multicollinearity." },
  { text: "t‑SNE preserves global distances better than PCA.", answer: false, why: "t‑SNE excels at local structure; PCA preserves global variance structure linearly." },
  { text: "XGBoost uses second‑order gradient information in its objective.", answer: true, why: "It uses both first and second derivatives (Newton boosting)." },
  { text: "In SVMs, smaller C encourages a wider margin with more tolerance to misclassification.", answer: true, why: "C controls penalty strength; small C → softer margin (higher bias, lower variance)." },
  { text: "Feature scaling is required for tree‑based models.", answer: false, why: "Trees split on feature orderings; scaling typically doesn't change splits." },
  { text: "For time‑series CV, you can shuffle folds freely.", answer: false, why: "Time order must be respected (e.g., expanding/rolling window)." },
  { text: "Stationarity means a series' statistical properties don't change over time.", answer: true, why: "Mean/variance/autocovariance are time‑invariant in (weak) stationarity." },
  { text: "ARIMA handles non‑stationarity via differencing (the I in ARIMA).", answer: true, why: "Differencing removes trends to achieve stationarity before ARMA modeling." },
  { text: "Maximum Likelihood Estimation chooses parameters maximizing the probability of observed data.", answer: true, why: "That's the definition of MLE." },
  { text: "Label leakage is when training data contain information not available at prediction time.", answer: true, why: "Leakage inflates offline metrics and fails in production." },
  { text: "In k‑NN, larger k increases model variance.", answer: false, why: "Larger k increases bias and decreases variance (more smoothing)." },
  { text: "ReLU is differentiable everywhere.", answer: false, why: "ReLU is non‑differentiable at 0 (subgradient used)." },
  { text: "F1 is the harmonic mean of precision and recall.", answer: true, why: "F1 = 2PR/(P+R)." },
  { text: "Adam adapts learning rates per parameter using estimates of first and second moments.", answer: true, why: "Adam maintains moving averages of gradients and squared gradients (m, v)." },
  { text: "L2 regularization is equivalent to weight decay.", answer: true, why: "For SGD they are equivalent; some optimizers implement decoupled weight decay." },
  { text: "PCA requires features to be on comparable scales.", answer: true, why: "Otherwise variables with large scales dominate the covariance matrix." },
  { text: "Overfitting can appear as decreasing training loss but increasing validation loss.", answer: true, why: "Classic divergence indicating poor generalization." }
];

// Add skills to all questions
QUESTION_BANK.forEach(q => {
  if (!q.skills) {
    q.skills = tagQuestionSkills(q);
  }
});

export default QUESTION_BANK;
