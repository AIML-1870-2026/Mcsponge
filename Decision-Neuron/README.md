# Decision Neuron — Should I Work On This Class?

A single perceptron interactive visualization that models a real decision: whether to work on a class right now. Adjust inputs, watch the math unfold in real time, train the boundary, and explore how each factor influences the outcome.

## Live Demo

[View the simulation](https://aiml-1870-2026.github.io/Mcsponge/Decision-Neuron/)

## Features

### Main View — Perceptron Visualization

**Input Factors (0 – 1):**

| Input | Weight | Meaning |
|-------|--------|---------|
| Homework Due / Exam | +0.80 | High = due soon, pushes toward YES |
| Health | +0.40 | High = fed, slept, mentally well |
| My Understanding | -0.70 | High = easier class, pushes toward NO |
| My Grade | -0.30 | High = good grade, pushes toward NO |

**Bias:**
- Homework Tendency slider (-1 to 1, default 0.50)
- Shifts the decision threshold — higher bias makes YES more likely

**The Math (right panel):**
- Weighted Sum — each input × its weight
- Sum + Bias — z = weighted sum + bias
- Sigmoid Activation — σ(z) = 1 / (1 + e⁻ᶻ)
- Decision — σ(z) ≥ 0.5 → YES, otherwise NO

**Neuron Diagram (center canvas):**
- Four colored input nodes connected to a central neuron
- Connection thickness reflects weight magnitude
- Green lines = positive weight, red lines = negative weight
- Weight labels on each connection
- Bias node connected from below
- Output arrow with YES/NO result and glow effect

### 2D Decision Boundary

Visualize how two key inputs divide the decision space:

- **X-axis**: Homework Due / Exam
- **Y-axis**: My Understanding
- Green region = YES, Red region = NO
- Yellow decision boundary line with glow

**Training Mode:**
1. Select a label (Yes or No)
2. Click on the plot to place data points
3. Press **Step** to train one gradient descent iteration
4. Press **Train** to run continuous training
5. Watch the boundary shift to classify your points

**Controls:**
- Learning Rate slider (0.01 – 1.0)
- Step / Train / Reset buttons

**Stats Panel:**
- Current weights and bias
- Step counter
- Number of points
- Classification accuracy

### Sensitivity Analysis

See how much each input actually matters to the neuron's decision:

- **Line chart** sweeps each input from 0 → 1 while holding others fixed
- Steep curves = highly influential inputs
- Upward curves = positive weight, downward = negative weight
- **Vertical markers** show current slider values on each curve
- **Dashed threshold line** at 0.5 (the decision boundary)
- **Influence Ranking** bar chart sorts inputs by sensitivity (|Δ output|)
- **Current Values** panel shows each input's value and weight

## How It Works

The perceptron computes:

```
z = (x1 × w1) + (x2 × w2) + (x3 × w3) + (x4 × w4) + bias
output = σ(z) = 1 / (1 + e^(-z))
decision = output ≥ 0.5 ? YES : NO
```

Training uses gradient descent on individual samples:

```
error = target - predicted
gradient = predicted × (1 - predicted)
Δw = learning_rate × error × gradient × input
```

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
