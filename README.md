# list-sticky

A virtualized sticky list component for React with smooth scrolling and sticky headers support.

## Installation

```bash
npm install list-sticky
```

## Usage

```tsx
import List from 'list-sticky';

interface Item {
  id: number;
  text: string;
  sticky?: boolean;
}

const DATA: Item[] = [];
for (let i = 0; i < 10000; i++) {
  DATA.push({
    id: i,
    text: 'Item ' + i,
    sticky: !(i % 10), // every 10th item is sticky
  });
}

const renderRow = ({ element }: { element: Item }) => {
  return <div>{element.text}</div>;
};

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <List
        data={DATA}
        renderRow={renderRow}
        rowHeight={50}
        fieldKey="id"
        placeholder="Нет данных"
      />
    </div>
  );
}
```

## Props

| Prop          | Type                          | Default        | Description                                      |
|---------------|-------------------------------|----------------|--------------------------------------------------|
| `data`        | `T[]`                         | required       | Array of items to render                         |
| `renderRow`   | `({ element: T }) => ReactElement` | required   | Render function                                  |
| `rowHeight`   | `number`                      | `50`           | Height of each row in pixels                     |
| `fieldKey`    | `string`                      | `'id'`         | Key field name for item identification           |
| `targetKey`   | `string \| number`            | `undefined`    | Scroll to item with this key value               |
| `placeholder` | `string \| ReactNode`         | `'Нет данных'` | Content shown when data is empty                 |

## Features

- Virtual scrolling for large datasets
- Sticky headers support (items with `sticky: true`)
- Smooth auto-scroll to target item
- Resize observer for responsive container height
- Written in TypeScript with full type definitions
