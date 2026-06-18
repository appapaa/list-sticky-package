import { useCallback, useMemo, useState } from 'react';
import List from 'list-sticky';
import type { ListItem } from 'list-sticky';
import type { ReactElement } from 'react';

// --- Types ---
interface User extends ListItem {
    id: number;
    name: string;
    email: string;
    color: string;
}

// --- Helpers ---
const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a18cd1', '#fbc2eb'];

function makeUsers(count: number, stickyInterval: number): User[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        color: COLORS[i % COLORS.length],
        sticky: i > 0 && i % stickyInterval === 0,
    }));
}

function renderRow({ element }: { element: User }): ReactElement {
    return (
        <div className={`row${element.sticky ? ' sticky' : ''}`}>
            <div className="avatar" style={{ background: element.color }}>
                {element.name.charAt(0)}
            </div>
            <div className="info">
                <div className="name">{element.name}</div>
                <div className="email">{element.email}</div>
            </div>
        </div>
    );
}

// --- Section components ---

function BasicDemo() {
    const data = useMemo(() => makeUsers(10000, 0), []);

    return (
        <div className="section">
            <div className="section-title">📋 Basic: 10,000 items without sticky</div>
            <div className="demo-panel">
                <div className="info">Simple virtualized list with 10,000 rows. Fast scrolling, minimal DOM nodes.</div>
                <div className="list-wrapper">
                    <List data={data} renderRow={renderRow} />
                </div>
            </div>
        </div>
    );
}

function StickyDemo() {
    const data = useMemo(() => makeUsers(5000, 10), []);

    return (
        <div className="section">
            <div className="section-title">📌 Sticky headers: 5,000 items, sticky every 10</div>
            <div className="demo-panel">
                <div className="info">Items with <code>sticky: true</code> stick to the top while scrolling. Group headers remain visible.</div>
                <div className="list-wrapper">
                    <List data={data} renderRow={renderRow} />
                </div>
            </div>
        </div>
    );
}

function ShortListDemo() {
    const data = useMemo(() => makeUsers(5, 0), []);

    return (
        <div className="section">
            <div className="section-title">📏 Short list: 5 items (fits without scroll)</div>
            <div className="demo-panel">
                <div className="info">When data fits the container, no virtual scrolling is needed — the list renders normally.</div>
                <div className="list-wrapper short">
                    <List data={data} renderRow={renderRow} />
                </div>
            </div>
        </div>
    );
}

function EmptyListDemo() {
    const data = useMemo(() => [] as User[], []);

    return (
        <div className="section">
            <div className="section-title">🫙 Empty list with placeholder</div>
            <div className="demo-panel">
                <div className="info">When the data array is empty, the <code>placeholder</code> prop is shown.</div>
                <div className="list-wrapper short">
                    <List data={data} renderRow={renderRow} placeholder={<div style={{ padding: 40, textAlign: 'center', color: '#999' }}>✨ Nothing here yet</div>} />
                </div>
            </div>
        </div>
    );
}

function TargetKeyDemo() {
    const data = useMemo(() => makeUsers(10000, 0), []);
    const [target, setTarget] = useState(0);

    return (
        <div className="section">
            <div className="section-title">🎯 Scroll to item (targetKey)</div>
            <div className="demo-panel">
                <div className="info">Use <code>targetKey</code> and <code>fieldKey</code> to programmatically scroll to a specific item.</div>
                <div className="controls">
                    {[0, 500, 1000, 2500, 5000, 9999].map(id => (
                        <button
                            key={id}
                            className={target === id ? 'active' : ''}
                            onClick={() => setTarget(id)}
                        >
                            #{id + 1}
                        </button>
                    ))}
                </div>
                <div className="list-wrapper">
                    <List data={data} renderRow={renderRow} fieldKey="id" targetKey={target} />
                </div>
            </div>
        </div>
    );
}

function CustomRowHeightDemo() {
    const data = useMemo(() => makeUsers(5000, 20), []);

    const tallRenderRow = useCallback(({ element }: { element: User }): ReactElement => (
        <div className={`row${element.sticky ? ' sticky' : ''}`} style={{ padding: '20px 16px' }}>
            <div className="avatar" style={{ background: element.color, width: 48, height: 48, fontSize: '1.1rem' }}>
                {element.name.charAt(0)}
            </div>
            <div className="info">
                <div className="name" style={{ fontSize: '1.1rem' }}>{element.name}</div>
                <div className="email">{element.email}</div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 4 }}>Custom row height = 80px</div>
            </div>
        </div>
    ), []);

    return (
        <div className="section">
            <div className="section-title">📐 Custom row height: 80px</div>
            <div className="demo-panel">
                <div className="info">Pass <code>rowHeight={80}</code> to override the default 50px row height.</div>
                <div className="list-wrapper">
                    <List data={data} renderRow={tallRenderRow} rowHeight={80} />
                </div>
            </div>
        </div>
    );
}

function MixedStickyDemo() {
    const data = useMemo(() => {
        const groups = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Spices'];
        const items: User[] = [];
        groups.forEach((group, gi) => {
            items.push({
                id: gi * 1000,
                name: `🥕 ${group}`,
                email: '',
                color: '#667eea',
                sticky: true,
            });
            for (let j = 0; j < 100; j++) {
                const idx = gi * 100 + j;
                items.push({
                    id: gi * 1000 + j + 1,
                    name: `Item ${idx + 1}`,
                    email: `item${idx + 1}@grocery.com`,
                    color: COLORS[(gi + j) % COLORS.length],
                    sticky: false,
                });
            }
        });
        return items;
    }, []);

    return (
        <div className="section">
            <div className="section-title">🏷️ Grouped list with category sticky headers</div>
            <div className="demo-panel">
                <div className="info">Real-world example: categories as sticky headers, each followed by 100 items.</div>
                <div className="list-wrapper">
                    <List data={data} renderRow={renderRow} />
                </div>
            </div>
        </div>
    );
}

// --- App ---
export default function App() {
    return (
        <>
            <div className="header">
                <h1>list-sticky Demo</h1>
                <p>A virtualized sticky list component for React</p>
            </div>
            <div className="container">
                <BasicDemo />
                <StickyDemo />
                <CustomRowHeightDemo />
                <MixedStickyDemo />
                <TargetKeyDemo />
                <ShortListDemo />
                <EmptyListDemo />
            </div>
        </>
    );
}