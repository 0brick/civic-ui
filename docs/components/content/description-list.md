# DescriptionList

Term/value pairs as a semantic `<dl>`: key facts, bank details, contact data. Unlike [ListGroup](list-group.md) (a `<ul>` of framed rows, meant for navigation) or [DataTable](data-table.md), it is a description list, so a screen reader announces each term together with its value.

## Import

```js
import { DescriptionList } from 'civic-ui'
```

## Basic usage

```vue
<DescriptionList
  :items="[
    { term: 'Founded', value: '1998' },
    { term: 'Members', value: '214' },
    { term: 'Website', value: 'example.org', href: 'https://example.org', newTab: true }
  ]"
/>
```

## Bank details

`layout="stacked"` puts a small uppercase term above each value; `emphasis` makes a value larger, `copyable` adds a copy button. Inside an outlined card that is a complete bank-details box without any CSS of your own:

```vue
<Card accent="top" appearance="outlined">
  <DescriptionList
    layout="stacked"
    :items="[
      { term: 'Account holder', value: 'Friends of the School e.V.' },
      { term: 'IBAN', value: 'DE12 3456 7890 1234 5678 90', emphasis: true, copyable: true },
      { term: 'BIC', value: 'GENODEF1XYZ', copyable: true }
    ]"
  />
</Card>
```

The copy button writes the value to the clipboard and confirms with a toast via [`useToast()`](../../composables.md): mount a [ToastContainer](../feedback/toast.md) once in the app for it to appear.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ term, value, href?, newTab?, emphasis?, copyable? }[]` | `[]` | `href` renders the value as a link (router-aware, see [configureLinks](../../getting-started.md)); `emphasis` a larger, heavier value; `copyable` a copy button. |
| `layout` | `'inline' \| 'stacked'` | `'inline'` | `inline`: term and value side by side, all values aligned on one column (stacks below 480px). `stacked`: small uppercase term above the value. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |

## Localization

The texts come from the [i18n catalog](../../accessibility.md#language-and-labels-wcag-312):

| Key | Default |
|---|---|
| `descriptionList.copy` | `'Copy {term}'`: the copy button's accessible name |
| `descriptionList.copied` | `'{term} copied to the clipboard'` |
| `descriptionList.copyFailed` | `"{term} couldn't be copied"` |

## Accessibility notes

Each pair is a `<dt>`/`<dd>` grouped in a `<div>` (allowed inside `<dl>`), so the list keeps its semantics in both layouts. Values use tabular figures, so numbers and IBANs line up. The copy button is named after its term ("Copy IBAN"), and its result is announced through the toast's live region.
