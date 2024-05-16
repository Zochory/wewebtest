import { getDisplayValue } from '@/_common/helpers/component/component';

export function getLayoutStyleFromContent(content, style, componentConfiguration) {
    const display = getDisplayValue(style.display, componentConfiguration);

    const layoutStyle = { display };

    if (display === true || display === 'flex' || display === 'inline-flex') {
        const flexDirection = content['_ww-layout_flexDirection'];
        const justifyContent = content['_ww-layout_justifyContent'];
        const alignItems = content['_ww-layout_alignItems'];
        const alignContent = content['_ww-layout_alignContent'];
        const rowGap = content['_ww-layout_rowGap'];
        const columnGap = content['_ww-layout_columnGap'];
        const flexWrap = content['_ww-layout_flexWrap'];

        if (flexDirection) layoutStyle.flexDirection = flexDirection;
        if (justifyContent) layoutStyle.justifyContent = justifyContent;
        if (alignItems) layoutStyle.alignItems = alignItems;
        if (alignContent && flexWrap) layoutStyle.alignContent = alignContent;
        if (rowGap) layoutStyle.rowGap = rowGap;
        if (columnGap) layoutStyle.columnGap = columnGap;
        if (flexDirection === 'column' || flexWrap)
            layoutStyle.flexWrap = flexDirection === 'column' ? 'nowrap' : flexWrap === false ? 'nowrap' : 'wrap';
    } else if (display === 'grid' || display === 'inline-grid') {
        const gridFlowDirection = content['_ww-grid_flowDirection'];
        const gridTemplateColumns = Array.isArray(content['_ww-grid_columns'])
            ? content['_ww-grid_columns'].join(' ')
            : '';
        const gridTemplateRows = Array.isArray(content['_ww-grid_rows']) ? content['_ww-grid_rows'].join(' ') : '';
        const gridColumnGap = content['_ww-grid_columnGap'];
        const gridRowGap = content['_ww-grid_rowGap'];

        if (gridFlowDirection) layoutStyle.gridAutoFlow = gridFlowDirection;
        if (gridTemplateColumns) layoutStyle.gridTemplateColumns = gridTemplateColumns;
        if (gridTemplateRows) layoutStyle.gridTemplateRows = gridTemplateRows;
        if (gridColumnGap) layoutStyle.columnGap = gridColumnGap;
        if (gridRowGap) layoutStyle.rowGap = gridRowGap;
    } else if (display === 'block' || display === 'inline-block') {
        layoutStyle.height = '100%';
        if (style.textAlign) layoutStyle.textAlign = style.textAlign;
    }

    return layoutStyle;
}
