# SIMULATED EXAMPLE — NOT LIVE RESEARCH

The source excerpts, retrieval dates, draft and approving reviewer are mocked test fixtures. The URLs below identify test candidates; no live article was generated or published. These samples demonstrate category style and rendering, not independent factual verification.

# Cross-validation: keep preprocessing inside the training fold

### Where leakage begins

Data leakage means that information unavailable at prediction time has influenced model building. In preprocessing, the key question is which observations were used to learn a transformation. A reported validation result becomes difficult to interpret when the held-out observations have already informed those fitted choices.

Sources: [S1](https://scikit-learn.org/stable/common_pitfalls.html).

### Separate the evaluation stages

Cross-validation repeatedly creates training and validation subsets. Keep the final test set separate from model selection so that choosing a configuration does not also consume the evidence intended for final evaluation. The two stages answer different questions about the development process.

Sources: [S2](https://scikit-learn.org/stable/modules/cross_validation.html).

### Respect the observations

Choose a splitting strategy that respects grouped or time-ordered observations. A pipeline can help organise fitted transformations, but it does not decide which observations should be held out. Document the intended prediction setting and justify why the evaluation split resembles that setting.

Sources: [S2](https://scikit-learn.org/stable/modules/cross_validation.html).

### Sources

- [S1 — SIMULATED source 1](https://scikit-learn.org/stable/common_pitfalls.html) (accessed 2026-10-28).

- [S2 — SIMULATED source 2](https://scikit-learn.org/stable/modules/cross_validation.html) (accessed 2026-10-28).
