# An Event-Ready Fundraising Thermometer.

A simple, fundraising tracker with a display view and admin panel to display live fund tracking at a fundraising dinner or auction.

## How to Use This Tracker

Open `index.html` and `admin.html` in a browser via localhost.
- Open each in two separate browser windows.

If using Windows, press `fn` + `F11` if using a Chrome browser to enter full screen.

---
## Fundraising Goal Behavior

The default goal is:

```javascript
goal: 30000
```

When the goal is **not locked**, the display goal automatically expands in $10,000 increments when the fundraiser exceeds the current goal.

Examples:

| Amount Raised | Display Goal |
|---:|---:|
| $25,000 | $30,000 |
| $30,000 | $30,000 |
| $30,001 | $40,000 |
| $40,000 | $40,000 |
| $40,001 | $50,000 |

This lets the fundraiser continue visually beyond the original goal.

### Goal Lock

When the goal is locked, the display goal remains at the configured goal even if the amount raised exceeds it.

The state property is:

```javascript
goalLocked: false
```

This can be changed during an event through the admin page.

---

## Milestones

The default milestone values are:

```javascript
const FUNDRAISING_MILESTONES = [
  10000,
  15000,
  25000,
  30000
];
```

When **not locked** and the display goal expands, the milestones shift with it so the thermometer continues to provide updated milestones toward the new goal.

---

## Goal Celebration

When the amount raised reaches the **original configured goal**, the public display triggers a confetti celebration.

The celebration is based on the original goal rather than the dynamically expanded display goal.

The celebration resets if the total drops below the original goal and can trigger again when the goal is reached again.

---

## Customizing Fundraising Items

The default fundraising items are defined in `app.js` inside `DEFAULT_STATE`.

Example:

```javascript
const DEFAULT_STATE = {
  goal: 30000,
  goalLocked: false,
  items: [
    {
      id: 1,
      name: "Primary Care for 15 Patients",
      price: 5000,
      quantity: 0
    }
  ]
};
```

To add an item:

```javascript
{
  id: 8,
  name: "New Fundraising Item",
  price: 750,
  quantity: 0
}
```

Each item should have a unique `id`.
