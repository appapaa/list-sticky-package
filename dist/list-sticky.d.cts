import * as react from 'react';
import { ReactElement, ReactNode, CSSProperties } from 'react';

interface ListItem {
    [key: string]: unknown;
    sticky?: boolean;
}
interface ListProps<T extends ListItem> {
    data: T[];
    renderRow: (props: {
        element: T;
    }) => ReactElement;
    rowHeight?: number;
    fieldKey?: string;
    targetKey?: string | number;
    placeholder?: string | ReactNode;
    style?: CSSProperties;
    autoSize?: boolean;
}
declare function List<T extends ListItem>({ data, renderRow, rowHeight: rowHeightProp, fieldKey, targetKey, placeholder, style, autoSize }: ListProps<T>): react.JSX.Element;

export { List, type ListItem, type ListProps, List as default };
