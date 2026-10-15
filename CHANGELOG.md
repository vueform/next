## 2.0.0 (2026-10-15)

> **Dummy entry** — this first section is handwritten by design (generation starts from the second release, anchored on the first tag). It demonstrates every section a generated entry can contain with the project's preset (scripts/changelog-preset.json) and every decoration a bullet can carry: a **scope** (bold prefix, from `type(scope):`), none (plain bullet), a comma-joined scope list (`type(core,ui):`), the short-hash commit link every bullet ends with, and issue references (`, closes [#42]`, one link per referenced issue). From the second release on, the version header also carries a compare link — `## [2.1.0](https://github.com/vueform/next/compare/v2.0.0...v2.1.0) (2026-11-02)` — and prerelease versions appear verbatim (`## [2.1.0-alpha.1](…)`). Replace this section with the real first-release notes before the real release; until then it doubles as the rehearsal draft-release notes.

### ⚠ BREAKING CHANGES

* **core:** `createForm` now returns the form instance directly instead of a `{ form }` wrapper
* **ui:** the `theme` prop was removed from `<VueformProvider>` — themes are configured per form instead

### ✨ Features

* **core:** add conditional validation via `when` clauses ([a1b2c3d](https://github.com/vueform/next/commit/a1b2c3d))
* **primevue:** map `Select` and `MultiSelect` to the new listbox elements ([e4f5a6b](https://github.com/vueform/next/commit/e4f5a6b)), closes [#42](https://github.com/vueform/next/issues/42)
* add Spanish and Japanese locales ([c7d8e9f](https://github.com/vueform/next/commit/c7d8e9f))

### 🐛 Bug Fixes

* **core,ui:** keep matrix cells reactive after row removal ([f0e1d2c](https://github.com/vueform/next/commit/f0e1d2c))
* **expr-eval:** stop coercing `null` to `0` in numeric comparisons ([0a1b2c3](https://github.com/vueform/next/commit/0a1b2c3)), closes [#57](https://github.com/vueform/next/issues/57) [#58](https://github.com/vueform/next/issues/58)
* **nuxt-module:** resolve `#vueform` alias in layer setups ([4d5e6f7](https://github.com/vueform/next/commit/4d5e6f7))

### ⚡ Performance Improvements

* **ui:** memoize slot fallback resolution in list elements ([8a9b0c1](https://github.com/vueform/next/commit/8a9b0c1))

### ⏪ Reverts

* revert "feat(core): eager-validate on mount" ([2d3e4f5](https://github.com/vueform/next/commit/2d3e4f5))

### ♻️ Code Refactoring

* **core:** split element registration out of the form factory ([6f7a8b9](https://github.com/vueform/next/commit/6f7a8b9))

### 📚 Documentation

* **docs:** document the `columns` layout prop with live examples ([0c1d2e3](https://github.com/vueform/next/commit/0c1d2e3))

### 💄 Styles

* **ui:** align checkbox groups to the 4px spacing grid ([4f5a6b7](https://github.com/vueform/next/commit/4f5a6b7))

### ✅ Tests

* **core:** cover conditional validation across nested groups ([8b9c0d1](https://github.com/vueform/next/commit/8b9c0d1))

### 📦 Build System

* **repo:** emit module-format-free dist filenames ([2e3f4a5](https://github.com/vueform/next/commit/2e3f4a5))

### 🤖 Continuous Integration

* **repo:** parallelize release gates with a shared build cache ([6a7b8c9](https://github.com/vueform/next/commit/6a7b8c9))

### 🧹 Chores

* **repo:** regenerate adapter registries and size sections ([0d1e2f3](https://github.com/vueform/next/commit/0d1e2f3))
