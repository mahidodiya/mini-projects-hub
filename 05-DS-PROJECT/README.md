# Comparative Study of Classification Algorithms Using Wine Quality Dataset

## Mini Project – Data Science

### Algorithms Compared
1. Decision Tree Classifier
2. Gaussian Naive Bayes Classifier
3. Random Forest Classifier

### Evaluation Metrics
- Accuracy
- Precision
- Recall

**Dataset:** Wine Quality (Red Wine)

**Classification rule:**  
- Quality >= 6 → Good (1)
- Quality < 6 → Bad (0)

> This notebook is designed as a complete mini-project. Run the cells from top to bottom. Actual metric values are calculated from the dataset rather than hard-coded.

## Project Objective

The objective of this project is to perform a comparative study of three supervised machine learning classification algorithms using the Wine Quality dataset.

The models will be trained on the same training data and evaluated on the same test data using Accuracy, Precision, and Recall. 

## 2. Dataset Description

The Wine Quality dataset contains physicochemical measurements of red wine samples.

### Input Features
- Fixed acidity
- Volatile acidity
- Citric acid
- Residual sugar
- Chlorides
- Free sulfur dioxide
- Total sulfur dioxide
- Density
- pH
- Sulphates
- Alcohol

### Target
The original `quality` column contains quality scores. For this classification project:

- `quality < 6` → **Bad**
- `quality >= 6` → **Good**


# Project Summary

### Objective
Compare Decision Tree, Gaussian Naive Bayes, and Random Forest classifiers using the Wine Quality dataset.

### Target
- 0 → Bad wine
- 1 → Good wine

### Metrics
- Accuracy
- Precision
- Recall

### Main Finding
The best-performing model should be selected from the actual results generated above rather than assuming a model will always perform best.

---

# Questions

### Q1. Why is this a classification problem?
Because the target is divided into discrete classes: Good and Bad.

### Q2. Why did we convert the original quality score?
The project requires classification algorithms. Converting the numerical quality score into Good/Bad creates a binary classification target.

### Q3. Why use Gaussian Naive Bayes?
The input variables are continuous numerical measurements, making Gaussian Naive Bayes a suitable Naive Bayes variant.

### Q4. What is the difference between Decision Tree and Random Forest?
A Decision Tree uses one tree, while Random Forest combines many decision trees to improve robustness and reduce overfitting.

### Q5. What is accuracy?
The proportion of all predictions that are correct.

### Q6. What is precision?
Among samples predicted as positive, precision tells us how many were actually positive.

### Q7. What is recall?
Among all actual positive samples, recall tells us how many were correctly identified.

### Q8. Why do we use a test set?
To evaluate how well the trained model performs on unseen data.

### Q9. Why use `random_state=42`?
It makes the train/test split and model results reproducible.

### Q10. Why use `stratify=y`?
It helps preserve the proportion of Good and Bad classes in both training and testing sets.

---
