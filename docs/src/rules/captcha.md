# captcha

<div class="rule-meta">

| | |
| --- | --- |
| **Category** | <!-- @rule:category -->[Other](/rules/#other)<!-- /@rule:category --> |
| **Related** | <!-- @rule:related -->—<!-- /@rule:related --> |
| **Bundle size** | <!-- @size:rule -->199 B<!-- /@size --> |

</div>

Validates that the captcha has been verified. The rule is asynchronous — it calls the element's `verify()` method and awaits the result. Captcha elements apply it automatically, so you rarely add it by hand.

<!-- @rule:params start -->
<!-- @rule:params end -->

## Error Messages

| Key | Default Message |
| --- | --- |
| `rule_captcha_error` | Please verify that you are not a robot. |

## Source

[packages/core/src/rules/captcha.ts](https://github.com/vueform/next/blob/main/packages/core/src/rules/captcha.ts)
