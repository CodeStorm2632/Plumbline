**Button** — the primary action control; indigo `default` for the main action, quieter variants for the rest.

```jsx
<Button>Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon" aria-label="More"><MoreIcon /></Button>
```

Variants: `default` (indigo), `secondary`, `outline`, `ghost`, `destructive`, `link`.
Sizes: `sm` (30px), `md` (34px, default), `lg` (40px), `icon`, `icon-sm`.
One primary button per view; pair with `outline`/`ghost` for secondary actions.
