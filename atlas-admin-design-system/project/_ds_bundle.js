/* @ds-bundle: {"format":3,"namespace":"AtlasAdminDesignSystem_9d1c70","components":[{"name":"PermissionTree","sourcePath":"components/admin/PermissionTree.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"CardHeader","sourcePath":"components/data-display/Card.jsx"},{"name":"CardBody","sourcePath":"components/data-display/Card.jsx"},{"name":"CardFooter","sourcePath":"components/data-display/Card.jsx"},{"name":"DataTable","sourcePath":"components/data-display/DataTable.jsx"},{"name":"Pagination","sourcePath":"components/data-display/Pagination.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"FormField","sourcePath":"components/forms/FormField.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/RadioGroup.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlays/Dialog.jsx"},{"name":"Drawer","sourcePath":"components/overlays/Drawer.jsx"}],"sourceHashes":{"components/admin/PermissionTree.jsx":"a806dec57c1c","components/data-display/Avatar.jsx":"ef6bf3c591fc","components/data-display/Badge.jsx":"144db07d4ad1","components/data-display/Card.jsx":"fb2e06b42206","components/data-display/DataTable.jsx":"e145c5a23162","components/data-display/Pagination.jsx":"1774e37d51fb","components/data-display/Tag.jsx":"1c6f792d86c7","components/feedback/Alert.jsx":"9e6561a4effc","components/feedback/EmptyState.jsx":"514152d2992b","components/feedback/Skeleton.jsx":"f41949f3dfdf","components/feedback/Toast.jsx":"24df8a5e5291","components/feedback/Tooltip.jsx":"ef97ed9b3741","components/forms/Button.jsx":"17424643fed1","components/forms/Checkbox.jsx":"207ee0f1275b","components/forms/FormField.jsx":"443039ff8716","components/forms/Input.jsx":"4231a24fb731","components/forms/RadioGroup.jsx":"5dafd12d8074","components/forms/Select.jsx":"84688d160061","components/forms/Switch.jsx":"461a2a1c9bf2","components/forms/Textarea.jsx":"247bb803876f","components/navigation/Breadcrumb.jsx":"472dba6b029b","components/navigation/SidebarNav.jsx":"c35a9c78858e","components/navigation/Tabs.jsx":"68d0f7d951de","components/overlays/Dialog.jsx":"392a72d07844","components/overlays/Drawer.jsx":"b3160516abac","ui_kits/admin/AppShell.jsx":"10f7dce93f54","ui_kits/admin/LoginScreen.jsx":"1bb121bd5b4c","ui_kits/admin/LogsScreen.jsx":"41d14e75cb60","ui_kits/admin/MiscScreens.jsx":"aca5be763bce","ui_kits/admin/RolesScreen.jsx":"0b49cd251623","ui_kits/admin/UsersScreen.jsx":"dcf2b20e29ce","ui_kits/admin/data.jsx":"32e5680dfc21","ui_kits/admin/icons.jsx":"ab2d6dddf820"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AtlasAdminDesignSystem_9d1c70 = window.AtlasAdminDesignSystem_9d1c70 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/admin/PermissionTree.jsx
try { (() => {
/* Atlas Admin — PermissionTree.
   Expandable checkbox tree with parent→child cascade and indeterminate
   parents. Powers role → menu/button permission assignment.
   Controlled via checkedKeys + onChange (returns the full next key list). */

function collectKeys(node, acc) {
  acc.push(node.key);
  (node.children || []).forEach(c => collectKeys(c, acc));
  return acc;
}
function CheckBox({
  state,
  onClick
}) {
  const on = state === 'checked' || state === 'indeterminate';
  return /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": state === 'indeterminate' ? 'mixed' : state === 'checked',
    tabIndex: 0,
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    onKeyDown: e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onClick();
      }
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
      flexShrink: 0,
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
      background: on ? 'var(--primary)' : 'var(--card)',
      color: 'var(--primary-foreground)',
      cursor: 'pointer',
      transition: 'background var(--dur-fast), border-color var(--dur-fast)'
    }
  }, state === 'indeterminate' ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1.5",
    y: "4.25",
    width: "7",
    height: "1.5",
    rx: "0.75",
    fill: "currentColor"
  })) : state === 'checked' ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2 5 8.5 9.5 3.5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null);
}
function TreeNode({
  node,
  depth,
  checkedSet,
  expandedSet,
  onToggleCheck,
  onToggleExpand
}) {
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const expanded = expandedSet.has(node.key);
  // derive state
  let state = 'unchecked';
  if (hasChildren) {
    const all = collectKeys(node, []).filter(k => k !== node.key);
    const checkedCount = all.filter(k => checkedSet.has(k)).length;
    if (checkedCount === 0) state = checkedSet.has(node.key) ? 'checked' : 'unchecked';else if (checkedCount === all.length) state = 'checked';else state = 'indeterminate';
  } else {
    state = checkedSet.has(node.key) ? 'checked' : 'unchecked';
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      height: '32px',
      paddingLeft: 6 + depth * 20 + 'px',
      paddingRight: '6px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--foreground)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => hasChildren && onToggleExpand(node.key),
    style: {
      display: 'inline-flex',
      width: '14px',
      height: '14px',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: hasChildren ? 'pointer' : 'default',
      color: 'var(--muted-foreground)',
      flexShrink: 0
    }
  }, hasChildren ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      transform: expanded ? 'rotate(90deg)' : 'none',
      transition: 'transform var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 4l4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), /*#__PURE__*/React.createElement(CheckBox, {
    state: state,
    onClick: () => onToggleCheck(node)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'default'
    },
    onClick: () => hasChildren && onToggleExpand(node.key)
  }, node.label, node.code ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--muted-foreground)',
      background: 'var(--muted)',
      padding: '1px 5px',
      borderRadius: 'var(--radius-xs)'
    }
  }, node.code) : null, node.type === 'button' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--info-subtle-foreground)',
      background: 'var(--info-subtle)',
      padding: '0 5px',
      borderRadius: 'var(--radius-xs)'
    }
  }, "\u6309\u94AE") : null)), hasChildren && expanded ? /*#__PURE__*/React.createElement("div", null, children.map(c => /*#__PURE__*/React.createElement(TreeNode, {
    key: c.key,
    node: c,
    depth: depth + 1,
    checkedSet: checkedSet,
    expandedSet: expandedSet,
    onToggleCheck: onToggleCheck,
    onToggleExpand: onToggleExpand
  }))) : null);
}
function PermissionTree({
  nodes = [],
  checkedKeys = [],
  onChange,
  defaultExpandAll = true,
  style
}) {
  const checkedSet = React.useMemo(() => new Set(checkedKeys), [checkedKeys]);
  const [expandedSet, setExpanded] = React.useState(() => {
    const s = new Set();
    if (defaultExpandAll) {
      const walk = n => {
        if (n.children) {
          s.add(n.key);
          n.children.forEach(walk);
        }
      };
      nodes.forEach(walk);
    }
    return s;
  });
  const onToggleExpand = key => setExpanded(prev => {
    const s = new Set(prev);
    s.has(key) ? s.delete(key) : s.add(key);
    return s;
  });
  const onToggleCheck = node => {
    const keys = collectKeys(node, []);
    const all = keys.filter(k => k !== node.key || !node.children);
    const isFullyChecked = keys.every(k => checkedSet.has(k));
    const next = new Set(checkedSet);
    if (isFullyChecked) keys.forEach(k => next.delete(k));else keys.forEach(k => next.add(k));
    onChange && onChange([...next]);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, nodes.map(n => /*#__PURE__*/React.createElement(TreeNode, {
    key: n.key,
    node: n,
    depth: 0,
    checkedSet: checkedSet,
    expandedSet: expandedSet,
    onToggleCheck: onToggleCheck,
    onToggleExpand: onToggleExpand
  })));
}
Object.assign(__ds_scope, { PermissionTree });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/PermissionTree.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Avatar. Initials fallback with deterministic tint; optional image + status. */

const tints = [['var(--primary-muted)', 'var(--primary)'], ['var(--info-subtle)', 'var(--info-subtle-foreground)'], ['var(--success-subtle)', 'var(--success-subtle-foreground)'], ['var(--warning-subtle)', 'var(--warning-subtle-foreground)']];
const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40
};
function Avatar({
  src,
  name = '',
  size = 'md',
  shape = 'circle',
  style,
  ...props
}) {
  const px = sizeMap[size] || size;
  const initials = name.trim().slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(i) >>> 0;
  const [bg, fg] = tints[hash % tints.length];
  const box = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: px + 'px',
    height: px + 'px',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: shape === 'square' ? 'var(--radius-md)' : 'var(--radius-full)',
    background: bg,
    color: fg,
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-semibold)',
    fontSize: Math.round(px * 0.4) + 'px',
    userSelect: 'none',
    ...style
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: box
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '?');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Badge / status label.
   tone: neutral | primary | success | warning | danger | info
   appearance: soft (tinted, default) | solid | outline
   Optional leading status dot. */

const tones = {
  neutral: {
    solidBg: 'var(--muted-foreground)',
    softBg: 'var(--neutral-subtle)',
    softFg: 'var(--neutral-subtle-foreground)',
    line: 'var(--border-strong)',
    dot: 'var(--muted-foreground)'
  },
  primary: {
    solidBg: 'var(--primary)',
    softBg: 'var(--primary-muted)',
    softFg: 'var(--primary)',
    line: 'var(--primary)',
    dot: 'var(--primary)'
  },
  success: {
    solidBg: 'var(--success)',
    softBg: 'var(--success-subtle)',
    softFg: 'var(--success-subtle-foreground)',
    line: 'var(--success)',
    dot: 'var(--success)'
  },
  warning: {
    solidBg: 'var(--warning)',
    softBg: 'var(--warning-subtle)',
    softFg: 'var(--warning-subtle-foreground)',
    line: 'var(--warning)',
    dot: 'var(--warning)'
  },
  danger: {
    solidBg: 'var(--destructive)',
    softBg: 'var(--destructive-subtle)',
    softFg: 'var(--destructive-subtle-foreground)',
    line: 'var(--destructive)',
    dot: 'var(--destructive)'
  },
  info: {
    solidBg: 'var(--info)',
    softBg: 'var(--info-subtle)',
    softFg: 'var(--info-subtle-foreground)',
    line: 'var(--info)',
    dot: 'var(--info)'
  }
};
function Badge({
  tone = 'neutral',
  appearance = 'soft',
  dot = false,
  children,
  style,
  ...props
}) {
  const t = tones[tone] || tones.neutral;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '2px 8px',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    border: '1px solid transparent'
  };
  const look = appearance === 'solid' ? {
    background: t.solidBg,
    color: tone === 'warning' ? 'var(--warning-foreground)' : '#fff'
  } : appearance === 'outline' ? {
    background: 'transparent',
    color: t.softFg,
    borderColor: t.line
  } : {
    background: t.softBg,
    color: t.softFg
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      ...look,
      ...style
    }
  }, props), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: 'var(--radius-full)',
      background: appearance === 'solid' ? 'currentColor' : t.dot,
      flexShrink: 0
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Card + CardHeader/CardBody/CardFooter. Flat, low-radius surface. */

function Card({
  children,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--card)',
      color: 'var(--card-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      ...style
    }
  }, props), children);
}
function CardHeader({
  title,
  description,
  actions,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, title != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-semibold)',
      color: 'var(--foreground)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title) : null, description != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, description) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexShrink: 0
    }
  }, actions) : null);
}
function CardBody({
  children,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      padding: '16px',
      ...style
    }
  }, props), children);
}
function CardFooter({
  children,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '12px 16px',
      borderTop: '1px solid var(--border)',
      background: 'var(--muted)',
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Card, CardHeader, CardBody, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/DataTable.jsx
try { (() => {
/* Atlas Admin — DataTable.
   Config-driven table: sortable headers, zebra/divider rows, row selection,
   sticky header, dense mode. The core surface of the admin scaffold. */

function SortIcon({
  dir
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      lineHeight: 0,
      marginLeft: '2px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "6",
    viewBox: "0 0 8 6",
    style: {
      marginBottom: '1px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 0l3 4H1z",
    fill: dir === 'asc' ? 'var(--primary)' : 'var(--border-strong)'
  })), /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "6",
    viewBox: "0 0 8 6"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6L1 2h6z",
    fill: dir === 'desc' ? 'var(--primary)' : 'var(--border-strong)'
  })));
}
function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  zebra = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortKey,
  sortDir,
  onSort,
  dense = false,
  stickyHeader = false,
  emptyText = '暂无数据',
  style
}) {
  const getKey = (row, i) => typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? i;
  const allKeys = data.map(getKey);
  const allChecked = allKeys.length > 0 && allKeys.every(k => selectedKeys.includes(k));
  const someChecked = selectedKeys.length > 0 && !allChecked;
  const toggleAll = () => onSelectionChange && onSelectionChange(allChecked ? [] : allKeys);
  const toggleRow = k => onSelectionChange && onSelectionChange(selectedKeys.includes(k) ? selectedKeys.filter(x => x !== k) : [...selectedKeys, k]);
  const rowH = dense ? 'var(--row-h-dense)' : 'var(--row-h)';
  const cellPad = dense ? '0 12px' : '0 14px';
  const th = {
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--muted-foreground)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'none',
    padding: cellPad,
    height: '38px',
    whiteSpace: 'nowrap',
    background: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
    position: stickyHeader ? 'sticky' : 'static',
    top: 0,
    zIndex: 2
  };
  const td = {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    color: 'var(--foreground)',
    padding: cellPad,
    height: rowH,
    verticalAlign: 'middle'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      overflowX: 'auto',
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, selectable ? /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      width: '40px',
      paddingRight: 0
    }
  }, /*#__PURE__*/React.createElement(CheckboxCell, {
    checked: allChecked,
    indeterminate: someChecked,
    onChange: toggleAll
  })) : null, columns.map(col => {
    const active = sortKey === col.key;
    return /*#__PURE__*/React.createElement("th", {
      key: col.key,
      style: {
        ...th,
        width: col.width,
        textAlign: col.align || 'left',
        cursor: col.sortable ? 'pointer' : 'default',
        color: active ? 'var(--foreground)' : th.color
      },
      onClick: () => col.sortable && onSort && onSort(col.key, active && sortDir === 'asc' ? 'desc' : 'asc')
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start'
      }
    }, col.header, col.sortable ? /*#__PURE__*/React.createElement(SortIcon, {
      dir: active ? sortDir : null
    }) : null));
  }))), /*#__PURE__*/React.createElement("tbody", null, data.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (selectable ? 1 : 0),
    style: {
      ...td,
      textAlign: 'center',
      color: 'var(--muted-foreground)',
      height: '96px'
    }
  }, emptyText)) : data.map((row, i) => {
    const k = getKey(row, i);
    const isSel = selectedKeys.includes(k);
    const zebraBg = zebra && i % 2 === 1 ? 'var(--muted)' : 'transparent';
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      style: {
        background: isSel ? 'var(--primary-muted)' : zebraBg,
        borderBottom: zebra ? 'none' : '1px solid var(--border)',
        transition: 'background var(--dur-fast) var(--ease-standard)'
      },
      onMouseEnter: e => {
        if (!isSel) e.currentTarget.style.background = 'var(--accent)';
      },
      onMouseLeave: e => {
        if (!isSel) e.currentTarget.style.background = zebraBg;
      }
    }, selectable ? /*#__PURE__*/React.createElement("td", {
      style: {
        ...td,
        paddingRight: 0
      }
    }, /*#__PURE__*/React.createElement(CheckboxCell, {
      checked: isSel,
      onChange: () => toggleRow(k)
    })) : null, columns.map(col => /*#__PURE__*/React.createElement("td", {
      key: col.key,
      style: {
        ...td,
        textAlign: col.align || 'left'
      }
    }, col.render ? col.render(row, i) : row[col.key])));
  }))));
}

/* internal — avoids hard dependency on Checkbox import order */
function CheckboxCell({
  checked,
  indeterminate,
  onChange
}) {
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": indeterminate ? 'mixed' : checked,
    tabIndex: 0,
    onClick: e => {
      e.stopPropagation();
      onChange && onChange();
    },
    onKeyDown: e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange && onChange();
      }
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
      borderRadius: 'var(--radius-sm)',
      border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
      background: on ? 'var(--primary)' : 'var(--card)',
      color: 'var(--primary-foreground)',
      cursor: 'pointer'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1.5",
    y: "4.25",
    width: "7",
    height: "1.5",
    rx: "0.75",
    fill: "currentColor"
  })) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2 5 8.5 9.5 3.5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null);
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Pagination.jsx
try { (() => {
/* Atlas Admin — Pagination. Page size + page navigation with total count. */

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  aria
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    disabled: disabled,
    "aria-label": aria,
    "aria-current": active ? 'page' : undefined,
    style: {
      minWidth: '30px',
      height: '30px',
      padding: '0 6px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
      color: active ? 'var(--primary-foreground)' : disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
      background: active ? 'var(--primary)' : 'var(--card)',
      border: '1px solid ' + (active ? 'var(--primary)' : 'var(--border-strong)'),
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-fast), border-color var(--dur-fast)'
    },
    onMouseEnter: e => {
      if (!active && !disabled) e.currentTarget.style.background = 'var(--accent)';
    },
    onMouseLeave: e => {
      if (!active && !disabled) e.currentTarget.style.background = 'var(--card)';
    }
  }, children);
}
function pageList(page, total) {
  const pages = [];
  const push = p => pages.push(p);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) push(i);
    return pages;
  }
  push(1);
  if (page > 3) push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) push(i);
  if (page < total - 2) push('…');
  push(total);
  return pages;
}
function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  style
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, "\u5171 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--foreground)',
      fontWeight: 'var(--font-medium)'
    }
  }, total), " \u6761\uFF0C\u7B2C ", from, "-", to, " \u6761"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u6BCF\u9875"), /*#__PURE__*/React.createElement("select", {
    value: pageSize,
    onChange: e => onPageSizeChange && onPageSizeChange(Number(e.target.value)),
    style: {
      height: '30px',
      padding: '0 6px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-strong)',
      background: 'var(--card)',
      color: 'var(--foreground)',
      fontFamily: 'inherit',
      fontSize: 'var(--text-sm)',
      cursor: 'pointer'
    }
  }, pageSizeOptions.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement(PageBtn, {
    disabled: page <= 1,
    onClick: () => onPageChange && onPageChange(page - 1),
    aria: "\u4E0A\u4E00\u9875"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 4l-4 4 4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), pageList(page, totalPages).map((p, i) => p === '…' ? /*#__PURE__*/React.createElement("span", {
    key: 'e' + i,
    style: {
      minWidth: '20px',
      textAlign: 'center'
    }
  }, "\u2026") : /*#__PURE__*/React.createElement(PageBtn, {
    key: p,
    active: p === page,
    onClick: () => onPageChange && onPageChange(p)
  }, p)), /*#__PURE__*/React.createElement(PageBtn, {
    disabled: page >= totalPages,
    onClick: () => onPageChange && onPageChange(page + 1),
    aria: "\u4E0B\u4E00\u9875"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 4l4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Tag. Role/label chip, optionally removable. Subtle by default. */

const palette = {
  neutral: {
    bg: 'var(--neutral-subtle)',
    fg: 'var(--neutral-subtle-foreground)'
  },
  primary: {
    bg: 'var(--primary-muted)',
    fg: 'var(--primary)'
  },
  info: {
    bg: 'var(--info-subtle)',
    fg: 'var(--info-subtle-foreground)'
  },
  success: {
    bg: 'var(--success-subtle)',
    fg: 'var(--success-subtle-foreground)'
  },
  warning: {
    bg: 'var(--warning-subtle)',
    fg: 'var(--warning-subtle-foreground)'
  },
  danger: {
    bg: 'var(--destructive-subtle)',
    fg: 'var(--destructive-subtle-foreground)'
  }
};
function Tag({
  tone = 'neutral',
  onRemove,
  children,
  style,
  ...props
}) {
  const p = palette[tone] || palette.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: onRemove ? '2px 4px 2px 8px' : '2px 8px',
      borderRadius: 'var(--radius-sm)',
      background: p.bg,
      color: p.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-medium)',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      ...style
    }
  }, props), children, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": "\u79FB\u9664",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '15px',
      height: '15px',
      padding: 0,
      border: 'none',
      borderRadius: 'var(--radius-xs)',
      background: 'transparent',
      color: 'currentColor',
      opacity: 0.7,
      cursor: 'pointer'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'color-mix(in oklch, currentColor 18%, transparent)';
      e.currentTarget.style.opacity = 1;
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.opacity = 0.7;
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 10 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 2l6 6M8 2l-6 6",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  }))) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
/* Atlas Admin — Alert. Inline contextual message with semantic tone. */

const map = {
  info: {
    fg: 'var(--info-subtle-foreground)',
    bg: 'var(--info-subtle)',
    line: 'var(--info)',
    icon: 'info'
  },
  success: {
    fg: 'var(--success-subtle-foreground)',
    bg: 'var(--success-subtle)',
    line: 'var(--success)',
    icon: 'check'
  },
  warning: {
    fg: 'var(--warning-subtle-foreground)',
    bg: 'var(--warning-subtle)',
    line: 'var(--warning)',
    icon: 'warn'
  },
  danger: {
    fg: 'var(--destructive-subtle-foreground)',
    bg: 'var(--destructive-subtle)',
    line: 'var(--destructive)',
    icon: 'x'
  }
};
function Glyph({
  kind
}) {
  const p = {
    width: 16,
    height: 16,
    viewBox: '0 0 20 20',
    fill: 'none',
    style: {
      flexShrink: 0,
      marginTop: '1px'
    }
  };
  if (kind === 'check') return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "8",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 10l2.2 2.2L13.5 7.5",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
  if (kind === 'warn') return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
    d: "M10 3l7 13H3z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 8.5v3.5M10 14h.01",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }));
  if (kind === 'x') return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "8",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 7.5l5 5M12.5 7.5l-5 5",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }));
  return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
    cx: "10",
    cy: "10",
    r: "8",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9v4M10 6.5h.01",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }));
}
function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  style
}) {
  const t = map[tone] || map.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: 'flex',
      gap: '10px',
      padding: '11px 12px',
      background: t.bg,
      color: t.fg,
      border: '1px solid color-mix(in oklch, ' + t.line + ' 30%, transparent)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.line
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    kind: t.icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-semibold)',
      marginBottom: children ? '2px' : 0
    }
  }, title) : null, children != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'color-mix(in oklch, ' + t.fg + ' 88%, transparent)',
      lineHeight: 'var(--leading-snug)'
    }
  }, children) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'currentColor',
      opacity: 0.6,
      cursor: 'pointer',
      padding: '2px',
      height: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l8 8M11 3l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))) : null);
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
/* Atlas Admin — EmptyState. No-data / no-results placeholder. */

function EmptyState({
  title = '暂无数据',
  description,
  icon,
  action,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      gap: '4px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--muted)',
      color: 'var(--muted-foreground)',
      marginBottom: '8px'
    }
  }, icon || /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 7l1.5 12a2 2 0 002 2h9a2 2 0 002-2L20 7M4 7h16M4 7l1-3h14l1 3M9 11v6M15 11v6",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--font-semibold)',
      color: 'var(--foreground)'
    }
  }, title), description != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
      maxWidth: '280px'
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
/* Atlas Admin — Skeleton. Loading placeholder with shimmer. */

function Skeleton({
  width = '100%',
  height = 14,
  radius = 'var(--radius-sm)',
  circle = false,
  style
}) {
  const size = circle ? typeof height === 'number' ? height + 'px' : height : undefined;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: circle ? size : typeof width === 'number' ? width + 'px' : width,
      height: typeof height === 'number' ? height + 'px' : height,
      borderRadius: circle ? 'var(--radius-full)' : radius,
      background: 'linear-gradient(90deg, var(--muted) 0%, color-mix(in oklch, var(--muted) 55%, var(--card)) 50%, var(--muted) 100%)',
      backgroundSize: '200% 100%',
      animation: 'atlas-shimmer 1.3s ease-in-out infinite',
      ...style
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes atlas-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/* Atlas Admin — Toast. Transient notification (presentational). */

const map = {
  info: 'var(--info)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--destructive)'
};
function Toast({
  tone = 'success',
  title,
  description,
  onClose,
  style
}) {
  const c = map[tone] || map.success;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      width: '320px',
      maxWidth: '92vw',
      padding: '12px 12px 12px 14px',
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-popover)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '3px',
      background: c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: 'var(--radius-full)',
      background: c,
      marginTop: '5px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-semibold)'
    }
  }, title) : null, description != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)',
      marginTop: '2px',
      lineHeight: 'var(--leading-snug)'
    }
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
      padding: '2px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 3l8 8M11 3l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/* Atlas Admin — Tooltip. Hover/focus label; lightweight CSS positioning. */

function Tooltip({
  label,
  side = 'top',
  children,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: '6px'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '6px'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: '6px'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: '6px'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, children, open && label ? /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 60,
      ...pos[side],
      whiteSpace: 'nowrap',
      padding: '4px 8px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--foreground)',
      color: 'var(--background)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-medium)',
      boxShadow: 'var(--shadow-md)',
      pointerEvents: 'none'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Button
   Variants: default (indigo), secondary, outline, ghost, destructive, link
   Sizes: sm, md, lg, icon. Compact heights for dense admin UIs. */

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-medium)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid transparent',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
  outline: 'none'
};
const sizes = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 10px',
    fontSize: 'var(--text-xs)',
    gap: '4px'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 14px',
    fontSize: 'var(--text-base)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 20px',
    fontSize: 'var(--text-md)'
  },
  icon: {
    height: 'var(--control-h-md)',
    width: 'var(--control-h-md)',
    padding: 0
  },
  'icon-sm': {
    height: 'var(--control-h-sm)',
    width: 'var(--control-h-sm)',
    padding: 0
  }
};
const variants = {
  default: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--primary-hover)'
  },
  secondary: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    borderColor: 'var(--border)',
    '--hover-bg': 'var(--accent)'
  },
  outline: {
    background: 'var(--card)',
    color: 'var(--foreground)',
    borderColor: 'var(--border-strong)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--accent)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--foreground)',
    '--hover-bg': 'var(--accent)'
  },
  destructive: {
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'color-mix(in oklch, var(--destructive) 88%, black)'
  },
  link: {
    background: 'transparent',
    color: 'var(--primary)',
    textUnderlineOffset: '3px',
    padding: 0,
    height: 'auto'
  }
};
function Button({
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
  style,
  children,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const v = variants[variant] || variants.default;
  const s = {
    ...base,
    ...(sizes[size] || sizes.md),
    ...v
  };
  if (v['--hover-bg']) delete s['--hover-bg'];
  const merged = {
    ...s,
    ...(hover && !disabled && v['--hover-bg'] ? {
      background: v['--hover-bg']
    } : null),
    ...(hover && !disabled && variant === 'link' ? {
      textDecoration: 'underline'
    } : null),
    ...(disabled ? {
      opacity: 0.5,
      pointerEvents: 'none'
    } : null),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    style: merged,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: e => e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--ring) 40%, transparent)',
    onBlur: e => e.currentTarget.style.boxShadow = s.boxShadow || 'none'
  }, props), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Checkbox. Supports checked + indeterminate (for tree parents). */

function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  label = null,
  id,
  style,
  ...props
}) {
  const on = checked || indeterminate;
  const box = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    flexShrink: 0,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
    background: on ? 'var(--primary)' : 'var(--card)',
    color: 'var(--primary-foreground)',
    transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
    cursor: disabled ? 'not-allowed' : 'pointer'
  };
  const wrap = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    color: 'var(--foreground)',
    userSelect: 'none',
    ...style
  };
  return /*#__PURE__*/React.createElement("label", {
    style: wrap
  }, /*#__PURE__*/React.createElement("span", _extends({
    role: "checkbox",
    "aria-checked": indeterminate ? 'mixed' : checked,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(!checked),
    onKeyDown: e => {
      if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        onChange && onChange(!checked);
      }
    },
    style: box
  }, props), indeterminate ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1.5",
    y: "4.25",
    width: "7",
    height: "1.5",
    rx: "0.75",
    fill: "currentColor"
  })) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2 5 8.5 9.5 3.5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null), label != null ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/FormField.jsx
try { (() => {
/* Atlas Admin — FormField. Label + control + help/error, with required marker. */

function FormField({
  label,
  required = false,
  error = null,
  help = null,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, label != null ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      color: 'var(--foreground)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px'
    }
  }, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--destructive)',
      fontWeight: 'var(--font-semibold)'
    }
  }, "*") : null, label) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--destructive)'
    }
  }, error) : help ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)'
    }
  }, help) : null);
}
Object.assign(__ds_scope, { FormField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FormField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Input. Supports leading/trailing adornments, invalid state, sizes. */

const wrapBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  background: 'var(--card)',
  border: '1px solid var(--input)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-xs)',
  transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
};
const sizeMap = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 8px',
    fontSize: 'var(--text-xs)'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 10px',
    fontSize: 'var(--text-sm)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 12px',
    fontSize: 'var(--text-base)'
  }
};
function Input({
  size = 'md',
  invalid = false,
  disabled = false,
  leading = null,
  trailing = null,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  const sz = sizeMap[size] || sizeMap.md;
  const wrap = {
    ...wrapBase,
    height: sz.height,
    padding: sz.padding,
    ...(invalid ? {
      borderColor: 'var(--destructive)'
    } : null),
    ...(focus && !invalid ? {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)'
    } : null),
    ...(focus && invalid ? {
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--destructive) 30%, transparent)'
    } : null),
    ...(disabled ? {
      opacity: 0.55,
      pointerEvents: 'none',
      background: 'var(--muted)'
    } : null),
    ...style
  };
  const iconStyle = {
    display: 'inline-flex',
    color: 'var(--muted-foreground)',
    flexShrink: 0
  };
  return /*#__PURE__*/React.createElement("span", {
    style: wrap
  }, leading ? /*#__PURE__*/React.createElement("span", {
    style: iconStyle
  }, leading) : null, /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    onFocus: e => {
      setFocus(true);
      props.onFocus && props.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      props.onBlur && props.onBlur(e);
    }
  }, props, {
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--foreground)',
      fontFamily: 'inherit',
      fontSize: sz.fontSize,
      padding: 0
    }
  })), trailing ? /*#__PURE__*/React.createElement("span", {
    style: iconStyle
  }, trailing) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
/* Atlas Admin — RadioGroup. Single-select from a small option set. */

function RadioGroup({
  value,
  onChange,
  options = [],
  name,
  direction = 'vertical',
  disabled = false,
  style
}) {
  const wrap = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '10px',
    fontFamily: 'var(--font-sans)',
    ...style
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: wrap
  }, options.map(opt => {
    const selected = opt.value === value;
    const dis = disabled || opt.disabled;
    return /*#__PURE__*/React.createElement("label", {
      key: opt.value,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: dis ? 'not-allowed' : 'pointer',
        opacity: dis ? 0.5 : 1,
        fontSize: 'var(--text-sm)',
        color: 'var(--foreground)',
        userSelect: 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      role: "radio",
      "aria-checked": selected,
      tabIndex: dis ? -1 : 0,
      onClick: () => !dis && onChange && onChange(opt.value),
      onKeyDown: e => {
        if (!dis && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange && onChange(opt.value);
        }
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: 'var(--radius-full)',
        border: '1.5px solid ' + (selected ? 'var(--primary)' : 'var(--border-strong)'),
        background: 'var(--card)',
        flexShrink: 0,
        transition: 'border-color var(--dur-fast) var(--ease-standard)'
      }
    }, selected ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: '8px',
        height: '8px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--primary)'
      }
    }) : null), /*#__PURE__*/React.createElement("span", null, opt.label));
  }));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/* Atlas Admin — Select. Lightweight custom dropdown (styled trigger + popover). */

function Select({
  value,
  onChange,
  options = [],
  placeholder = '请选择',
  size = 'md',
  disabled = false,
  invalid = false,
  style
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.value === value);
  const heights = {
    sm: 'var(--control-h-sm)',
    md: 'var(--control-h-md)',
    lg: 'var(--control-h-lg)'
  };
  const fonts = {
    sm: 'var(--text-xs)',
    md: 'var(--text-sm)',
    lg: 'var(--text-base)'
  };
  const trigger = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    height: heights[size],
    padding: '0 10px',
    fontFamily: 'var(--font-sans)',
    fontSize: fonts[size],
    color: selected ? 'var(--foreground)' : 'var(--muted-foreground)',
    background: 'var(--card)',
    border: '1px solid ' + (invalid ? 'var(--destructive)' : open ? 'var(--ring)' : 'var(--input)'),
    borderRadius: 'var(--radius-md)',
    boxShadow: open ? '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)' : 'var(--shadow-xs)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)'
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      width: '100%',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: () => setOpen(o => !o),
    style: trigger,
    "aria-haspopup": "listbox",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, selected ? selected.label : placeholder), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      flexShrink: 0,
      color: 'var(--muted-foreground)',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--dur-fast)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6l4 4 4-4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), open ? /*#__PURE__*/React.createElement("div", {
    role: "listbox",
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-popover)',
      padding: '4px',
      maxHeight: '240px',
      overflowY: 'auto'
    }
  }, options.map(o => {
    const sel = o.value === value;
    return /*#__PURE__*/React.createElement("div", {
      key: o.value,
      role: "option",
      "aria-selected": sel,
      onClick: () => {
        if (!o.disabled) {
          onChange && onChange(o.value);
          setOpen(false);
        }
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--accent)',
      onMouseLeave: e => e.currentTarget.style.background = sel ? 'var(--primary-muted)' : 'transparent',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '7px 8px',
        borderRadius: 'var(--radius-sm)',
        cursor: o.disabled ? 'not-allowed' : 'pointer',
        fontSize: 'var(--text-sm)',
        color: 'var(--foreground)',
        opacity: o.disabled ? 0.5 : 1,
        background: sel ? 'var(--primary-muted)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", null, o.label), sel ? /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 12 12",
      fill: "none",
      style: {
        color: 'var(--primary)'
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 6.2 5 8.5 9.5 3.5",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })) : null);
  })) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Switch. Status toggle (enable/disable). */

const sizeMap = {
  sm: {
    w: 30,
    h: 17,
    knob: 13
  },
  md: {
    w: 38,
    h: 21,
    knob: 17
  }
};
function Switch({
  checked = false,
  disabled = false,
  onChange,
  size = 'md',
  style,
  ...props
}) {
  const s = sizeMap[size] || sizeMap.md;
  const track = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: s.w + 'px',
    height: s.h + 'px',
    flexShrink: 0,
    borderRadius: 'var(--radius-full)',
    background: checked ? 'var(--primary)' : 'var(--border-strong)',
    transition: 'background var(--dur-med) var(--ease-standard)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    padding: '2px',
    border: 'none',
    ...style
  };
  const knob = {
    position: 'absolute',
    top: '2px',
    left: checked ? s.w - s.knob - 2 + 'px' : '2px',
    width: s.knob + 'px',
    height: s.knob + 'px',
    borderRadius: 'var(--radius-full)',
    background: '#fff',
    boxShadow: 'var(--shadow-sm)',
    transition: 'left var(--dur-med) var(--ease-out)'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: track
  }, props), /*#__PURE__*/React.createElement("span", {
    style: knob
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin — Textarea. Auto-inherits field styling; vertical resize only. */

function Textarea({
  invalid = false,
  disabled = false,
  rows = 4,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  const s = {
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-snug)',
    color: 'var(--foreground)',
    background: 'var(--card)',
    border: '1px solid var(--input)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-xs)',
    padding: '8px 10px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
    ...(invalid ? {
      borderColor: 'var(--destructive)'
    } : null),
    ...(focus && !invalid ? {
      borderColor: 'var(--ring)',
      boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)'
    } : null),
    ...(disabled ? {
      opacity: 0.55,
      pointerEvents: 'none',
      background: 'var(--muted)'
    } : null),
    ...style
  };
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    onFocus: e => {
      setFocus(true);
      props.onFocus && props.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      props.onBlur && props.onBlur(e);
    }
  }, props, {
    style: s
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
/* Atlas Admin — Breadcrumb. Location trail; last item is current page. */

function Breadcrumb({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "breadcrumb",
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      ...style
    }
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, last ? /*#__PURE__*/React.createElement("span", {
      "aria-current": "page",
      style: {
        color: 'var(--foreground)',
        fontWeight: 'var(--font-medium)'
      }
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || '#',
      onClick: it.onClick,
      style: {
        color: 'var(--muted-foreground)',
        textDecoration: 'none',
        cursor: 'pointer'
      },
      onMouseEnter: e => e.currentTarget.style.color = 'var(--foreground)',
      onMouseLeave: e => e.currentTarget.style.color = 'var(--muted-foreground)'
    }, it.label), !last ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--border-strong)'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 16 16",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M6 4l4 4-4 4",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))) : null);
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
/* Atlas Admin — SidebarNav.
   Multi-level collapsible menu with grouped sections, active state,
   badges, and an icon-only collapsed mode. Icons are passed as nodes. */

function Chevron({
  open
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      transition: 'transform var(--dur-fast)',
      transform: open ? 'rotate(90deg)' : 'none',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 4l4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
function Leaf({
  item,
  active,
  collapsed,
  depth,
  onNavigate
}) {
  const isActive = active === item.key;
  return /*#__PURE__*/React.createElement("a", {
    href: item.url || '#',
    title: collapsed ? item.title : undefined,
    onClick: e => {
      e.preventDefault();
      onNavigate && onNavigate(item.key, item);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      textDecoration: 'none',
      height: '34px',
      padding: collapsed ? '0' : '0 8px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      paddingLeft: collapsed ? 0 : depth > 0 ? 8 + depth * 18 + 'px' : '8px',
      borderRadius: 'var(--radius-md)',
      margin: '1px 0',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
      color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
      background: isActive ? 'var(--sidebar-primary)' : 'transparent',
      transition: 'background var(--dur-fast), color var(--dur-fast)'
    },
    onMouseEnter: e => {
      if (!isActive) e.currentTarget.style.background = 'var(--sidebar-accent)';
    },
    onMouseLeave: e => {
      if (!isActive) e.currentTarget.style.background = 'transparent';
    }
  }, item.icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '18px',
      height: '18px',
      flexShrink: 0,
      color: isActive ? 'inherit' : 'var(--muted-foreground)'
    }
  }, item.icon) : depth > 0 && !collapsed ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      background: 'currentColor',
      opacity: 0.4,
      flexShrink: 0
    }
  }) : null, !collapsed ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, item.title) : null, !collapsed && item.badge != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--font-semibold)',
      minWidth: '18px',
      textAlign: 'center',
      padding: '0 5px',
      lineHeight: '17px',
      borderRadius: 'var(--radius-full)',
      background: isActive ? 'color-mix(in oklch, white 25%, transparent)' : 'var(--primary-muted)',
      color: isActive ? 'inherit' : 'var(--primary)'
    }
  }, item.badge) : null);
}
function Branch({
  item,
  active,
  collapsed,
  onNavigate,
  defaultOpen
}) {
  const hasActiveChild = (item.items || []).some(c => c.key === active);
  const [open, setOpen] = React.useState(defaultOpen || hasActiveChild);
  if (collapsed) {
    return /*#__PURE__*/React.createElement(Leaf, {
      item: item,
      active: hasActiveChild ? item.key : active,
      collapsed: true,
      onNavigate: onNavigate,
      depth: 0
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      width: '100%',
      height: '34px',
      padding: '0 8px',
      margin: '1px 0',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      color: hasActiveChild ? 'var(--foreground)' : 'var(--sidebar-foreground)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--sidebar-accent)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, item.icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '18px',
      height: '18px',
      flexShrink: 0,
      color: 'var(--muted-foreground)'
    }
  }, item.icon) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, item.title), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted-foreground)'
    }
  }, /*#__PURE__*/React.createElement(Chevron, {
    open: open
  }))), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, (item.items || []).map(c => /*#__PURE__*/React.createElement(Leaf, {
    key: c.key,
    item: c,
    active: active,
    collapsed: false,
    depth: 1,
    onNavigate: onNavigate
  }))) : null);
}
function SidebarNav({
  groups = [],
  active,
  onNavigate,
  collapsed = false,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: collapsed ? '8px 8px' : '8px 10px',
      ...style
    }
  }, groups.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi
  }, g.title && !collapsed ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--font-semibold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
      padding: '4px 8px 2px'
    }
  }, g.title) : null, (g.items || []).map(item => item.items ? /*#__PURE__*/React.createElement(Branch, {
    key: item.key,
    item: item,
    active: active,
    collapsed: collapsed,
    onNavigate: onNavigate,
    defaultOpen: item.defaultOpen
  }) : /*#__PURE__*/React.createElement(Leaf, {
    key: item.key,
    item: item,
    active: active,
    collapsed: collapsed,
    depth: 0,
    onNavigate: onNavigate
  })))));
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/* Atlas Admin — Tabs. Underline-style segmented navigation. */

function Tabs({
  tabs = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, tabs.map(t => {
    const active = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": active,
      onClick: () => !t.disabled && onChange && onChange(t.value),
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        border: 'none',
        background: 'transparent',
        cursor: t.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
        color: active ? 'var(--primary)' : t.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
        opacity: t.disabled ? 0.5 : 1,
        marginBottom: '-1px',
        borderBottom: '2px solid ' + (active ? 'var(--primary)' : 'transparent'),
        transition: 'color var(--dur-fast), border-color var(--dur-fast)'
      },
      onMouseEnter: e => {
        if (!active && !t.disabled) e.currentTarget.style.color = 'var(--primary)';
      },
      onMouseLeave: e => {
        if (!active && !t.disabled) e.currentTarget.style.color = 'var(--foreground)';
      }
    }, t.label, t.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)',
        background: 'var(--muted)',
        borderRadius: 'var(--radius-full)',
        padding: '0 6px',
        lineHeight: '16px'
      }
    }, t.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Dialog.jsx
try { (() => {
/* Atlas Admin — Dialog. Centered modal for confirmations and compact forms. */

const sizes = {
  sm: '400px',
  md: '520px',
  lg: '680px'
};
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  children,
  closeOnOverlay = true,
  style
}) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => e.key === 'Escape' && onClose && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => closeOnOverlay && onClose && onClose(),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'oklch(0.2 0.03 262 / 0.45)',
      backdropFilter: 'blur(1px)',
      animation: 'atlas-fade var(--dur-med) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: sizes[size] || sizes.md,
      maxHeight: '86vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      animation: 'atlas-pop var(--dur-med) var(--ease-out)',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes atlas-fade{from{opacity:0}to{opacity:1}}@keyframes atlas-pop{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '16px 18px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, title != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-semibold)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title) : null, description != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, description) : null), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: 'var(--radius-sm)',
      margin: '-2px -4px 0 0'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px',
      overflowY: 'auto',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '12px 18px',
      borderTop: '1px solid var(--border)',
      background: 'var(--muted)'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Drawer.jsx
try { (() => {
/* Atlas Admin — Drawer. Side sheet for longer create/edit forms. */

const widths = {
  sm: '360px',
  md: '460px',
  lg: '600px'
};
function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  side = 'right',
  size = 'md',
  children,
  style
}) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => e.key === 'Escape' && onClose && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  const isRight = side === 'right';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'oklch(0.2 0.03 262 / 0.45)',
      animation: 'atlas-fade var(--dur-med) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      [isRight ? 'right' : 'left']: 0,
      width: '100%',
      maxWidth: widths[size] || widths.md,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--popover)',
      color: 'var(--popover-foreground)',
      borderLeft: isRight ? '1px solid var(--border)' : 'none',
      borderRight: isRight ? 'none' : '1px solid var(--border)',
      boxShadow: 'var(--shadow-lg)',
      animation: (isRight ? 'atlas-slide-r' : 'atlas-slide-l') + ' var(--dur-slow) var(--ease-out)',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes atlas-fade{from{opacity:0}to{opacity:1}}@keyframes atlas-slide-r{from{transform:translateX(100%)}to{transform:none}}@keyframes atlas-slide-l{from{transform:translateX(-100%)}to{transform:none}}'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '16px 18px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }
  }, title != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--font-semibold)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title) : null, description != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, description) : null), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--muted-foreground)',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: 'var(--radius-sm)',
      margin: '-2px -4px 0 0'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '18px',
      overflowY: 'auto',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '12px 18px',
      borderTop: '1px solid var(--border)',
      background: 'var(--muted)'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Drawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Drawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/AppShell.jsx
try { (() => {
/* Atlas Admin UI kit — AppShell. Sidebar + header + screen routing. */
const S_NS = window.AtlasAdminDesignSystem_9d1c70;
function AppShell({
  onLogout
}) {
  const {
    SidebarNav,
    Breadcrumb,
    Input,
    Avatar,
    Button,
    Badge,
    Tooltip
  } = S_NS;
  const {
    LayoutDashboard,
    Users,
    ShieldCheck,
    ListTree,
    Database,
    ScrollText,
    Search,
    Bell,
    Sun,
    Moon,
    PanelLeft,
    LogOut,
    ChevronDown
  } = window;
  const [active, setActive] = React.useState('users');
  const [collapsed, setCollapsed] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  const groups = [{
    title: '总览',
    items: [{
      key: 'dash',
      title: '仪表盘',
      icon: /*#__PURE__*/React.createElement(LayoutDashboard, {
        size: 18
      }),
      url: '#'
    }]
  }, {
    title: '系统管理',
    items: [{
      key: 'sys',
      title: '权限管理',
      icon: /*#__PURE__*/React.createElement(ShieldCheck, {
        size: 18
      }),
      defaultOpen: true,
      items: [{
        key: 'users',
        title: '用户管理',
        url: '#',
        badge: 128
      }, {
        key: 'roles',
        title: '角色管理',
        url: '#'
      }, {
        key: 'menus',
        title: '菜单管理',
        url: '#'
      }]
    }, {
      key: 'basic',
      title: '基础数据',
      icon: /*#__PURE__*/React.createElement(Database, {
        size: 18
      }),
      defaultOpen: true,
      items: [{
        key: 'dict',
        title: '字典管理',
        url: '#'
      }]
    }]
  }, {
    title: '监控',
    items: [{
      key: 'logs',
      title: '日志管理',
      icon: /*#__PURE__*/React.createElement(ScrollText, {
        size: 18
      }),
      url: '#'
    }]
  }];
  const meta = {
    dash: {
      title: '仪表盘',
      crumbs: ['仪表盘']
    },
    users: {
      title: '用户管理',
      crumbs: ['系统管理', '用户管理']
    },
    roles: {
      title: '角色管理',
      crumbs: ['系统管理', '角色管理']
    },
    menus: {
      title: '菜单管理',
      crumbs: ['系统管理', '菜单管理']
    },
    dict: {
      title: '字典管理',
      crumbs: ['基础数据', '字典管理']
    },
    logs: {
      title: '日志管理',
      crumbs: ['监控', '日志管理']
    }
  };
  const cur = meta[active] || meta.users;
  const Screen = {
    users: window.UsersScreen,
    roles: window.RolesScreen,
    menus: window.MenusScreen,
    dict: window.DictScreen,
    logs: window.LogsScreen,
    dash: window.UsersScreen
  }[active] || window.UsersScreen;
  const sideW = collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--background)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: sideW,
      flexShrink: 0,
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      transition: 'width var(--dur-med) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--header-h)',
      display: 'flex',
      alignItems: 'center',
      gap: '9px',
      padding: collapsed ? '0' : '0 16px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderBottom: '1px solid var(--sidebar-border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    width: "28",
    height: "28",
    alt: ""
  }), !collapsed ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      color: 'var(--foreground)',
      letterSpacing: '-0.01em'
    }
  }, "Atlas Admin") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(SidebarNav, {
    groups: groups,
    active: active,
    collapsed: collapsed,
    onNavigate: k => setActive(k)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--sidebar-border)',
      padding: collapsed ? '8px' : '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '9px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "\u5F20\u4F1F",
    size: "sm"
  }), !collapsed ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--foreground)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "\u5F20\u4F1F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--muted-foreground)'
    }
  }, "\u7CFB\u7EDF\u7BA1\u7406\u5458")) : null, !collapsed ? /*#__PURE__*/React.createElement(Tooltip, {
    label: "\u9000\u51FA\u767B\u5F55"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(LogOut, {
    size: 16
  }))) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--header-h)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '0 20px',
      background: 'color-mix(in oklch, var(--card) 88%, transparent)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backdropFilter: 'blur(8px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm",
    onClick: () => setCollapsed(c => !c)
  }, /*#__PURE__*/React.createElement(PanelLeft, {
    size: 18
  })), /*#__PURE__*/React.createElement(Breadcrumb, {
    items: cur.crumbs.map((c, i) => i === cur.crumbs.length - 1 ? {
      label: c
    } : {
      label: c,
      href: '#'
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '220px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "\u5168\u5C40\u641C\u7D22\u2026",
    leading: /*#__PURE__*/React.createElement(Search, {
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: dark ? '浅色模式' : '深色模式'
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon",
    onClick: () => setDark(d => !d)
  }, dark ? /*#__PURE__*/React.createElement(Sun, {
    size: 18
  }) : /*#__PURE__*/React.createElement(Moon, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon"
  }, /*#__PURE__*/React.createElement(Bell, {
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: 'var(--destructive)',
      border: '1.5px solid var(--card)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      paddingLeft: '6px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "\u5F20\u4F1F",
    size: "sm"
  }), /*#__PURE__*/React.createElement(ChevronDown, {
    size: 15,
    style: {
      color: 'var(--muted-foreground)'
    }
  })))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      color: 'var(--foreground)',
      letterSpacing: '-0.01em'
    }
  }, cur.title)), /*#__PURE__*/React.createElement(Screen, null))));
}
window.AppShell = AppShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/LoginScreen.jsx
try { (() => {
/* Atlas Admin UI kit — LoginScreen. Account login + captcha + lock alert. */
const {
  Button,
  Input,
  FormField,
  Checkbox,
  Alert
} = window.AtlasAdminDesignSystem_9d1c70;
function Captcha({
  code = 'A7K9'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '96px',
      height: 'var(--control-h-md)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--input)',
      background: 'linear-gradient(135deg, var(--muted), var(--card))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      userSelect: 'none'
    },
    title: "\u70B9\u51FB\u5237\u65B0"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "96",
    height: "34",
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.35
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 20 Q30 4 60 22 T96 14",
    stroke: "var(--muted-foreground)",
    fill: "none",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 10 Q40 30 96 8",
    stroke: "var(--border-strong)",
    fill: "none",
    strokeWidth: "1"
  })), code.split('').map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '17px',
      fontWeight: 700,
      color: ['var(--primary)', 'var(--foreground)', 'var(--info)', 'var(--foreground)'][i % 4],
      transform: `rotate(${[-8, 6, -4, 10][i % 4]}deg)`,
      margin: '0 1px',
      position: 'relative'
    }
  }, c)));
}
function LoginScreen({
  onLogin
}) {
  const [locked, setLocked] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [u, setU] = React.useState('zhangwei');
  const [p, setP] = React.useState('••••••••');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'linear-gradient(160deg, oklch(0.32 0.11 264), oklch(0.2 0.06 264))',
      color: '#fff',
      padding: '48px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.14,
      backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      color: '#fff'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '11px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    width: "34",
    height: "34",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '18px',
      fontWeight: 700,
      letterSpacing: '-0.01em'
    }
  }, "Atlas Admin")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.02em'
    }
  }, "\u4F01\u4E1A\u7EA7\u4E2D\u540E\u53F0", /*#__PURE__*/React.createElement("br", null), "\u7BA1\u7406\u7CFB\u7EDF\u811A\u624B\u67B6"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '14px',
      fontSize: 'var(--text-base)',
      color: 'rgba(255,255,255,0.72)',
      maxWidth: '340px',
      lineHeight: 1.6
    }
  }, "\u7EDF\u4E00\u7684\u6743\u9650\u6A21\u578B\u3001\u6570\u636E\u8868\u683C\u4E0E\u5BA1\u8BA1\u8FFD\u8E2A\uFF0C\u5FEB\u901F\u642D\u5EFA\u5404\u7C7B\u4E1A\u52A1\u7CFB\u7EDF\u7684\u7BA1\u7406\u7AEF\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '28px',
      display: 'flex',
      gap: '20px'
    }
  }, [['RBAC', '细粒度权限'], ['AES', '敏感字段加密'], ['Audit', '操作审计']].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '15px',
      fontWeight: 700
    }
  }, a), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'rgba(255,255,255,0.6)'
    }
  }, b))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      fontSize: 'var(--text-xs)',
      color: 'rgba(255,255,255,0.5)'
    }
  }, "\xA9 2026 Atlas Admin \xB7 v1.0 Scaffold")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '340px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      color: 'var(--foreground)',
      letterSpacing: '-0.01em'
    }
  }, "\u767B\u5F55"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)',
      marginTop: '4px',
      marginBottom: '22px'
    }
  }, "\u8BF7\u8F93\u5165\u8D26\u6237\u4FE1\u606F\u4EE5\u8FDB\u5165\u7BA1\u7406\u540E\u53F0"), locked ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "\u8D26\u6237\u5DF2\u9501\u5B9A",
    onClose: () => setLocked(false)
  }, "\u8FDE\u7EED 5 \u6B21\u5BC6\u7801\u9519\u8BEF\uFF0C\u8D26\u6237\u5DF2\u9501\u5B9A\uFF0C\u8BF7 15 \u5206\u949F\u540E\u91CD\u8BD5\u6216\u8054\u7CFB\u7BA1\u7406\u5458\u3002")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "\u8D26\u53F7",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: u,
    onChange: e => setU(e.target.value),
    placeholder: "\u8BF7\u8F93\u5165\u767B\u5F55\u8D26\u53F7"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u5BC6\u7801",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "password",
    value: p,
    onChange: e => setP(e.target.value),
    placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u9A8C\u8BC1\u7801",
    required: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Captcha, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: remember,
    onChange: setRemember,
    label: "\u8BB0\u4F4F\u767B\u5F55"
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--primary)',
      textDecoration: 'none'
    }
  }, "\u5FD8\u8BB0\u5BC6\u7801\uFF1F")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    style: {
      width: '100%',
      marginTop: '4px'
    },
    onClick: onLogin
  }, "\u767B \u5F55"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setLocked(v => !v),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--muted-foreground)',
      fontSize: 'var(--text-xs)',
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, "\uFF08\u6F14\u793A\uFF1A\u5207\u6362\u8D26\u6237\u9501\u5B9A\u63D0\u793A\uFF09")))));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/LogsScreen.jsx
try { (() => {
/* Atlas Admin UI kit — LogsScreen. Login & operation logs with tabs + search. */
const L_NS = window.AtlasAdminDesignSystem_9d1c70;
function LogsScreen() {
  const {
    Card,
    DataTable,
    Badge,
    Button,
    Input,
    Select,
    Tabs,
    Pagination
  } = L_NS;
  const {
    Download,
    Search
  } = window;
  const Toolbar = window.KitToolbar,
    Field = window.KitField;
  const [tab, setTab] = React.useState('login');
  const D = window.ATLAS_DATA;
  const methodTone = {
    GET: 'neutral',
    POST: 'info',
    PUT: 'warning',
    DELETE: 'danger'
  };
  const loginCols = [{
    key: 'user',
    header: '账号',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)'
      }
    }, r.user)
  }, {
    key: 'ip',
    header: 'IP 地址',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.ip)
  }, {
    key: 'location',
    header: '登录地点',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: r.location === '境外' ? 'var(--destructive)' : 'var(--foreground)'
      }
    }, r.location)
  }, {
    key: 'browser',
    header: '浏览器',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.browser)
  }, {
    key: 'os',
    header: '系统',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.os)
  }, {
    key: 'status',
    header: '结果',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      tone: r.status === 'success' ? 'success' : 'danger',
      dot: true
    }, r.msg)
  }, {
    key: 'time',
    header: '登录时间',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.time)
  }];
  const opCols = [{
    key: 'user',
    header: '操作人',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)'
      }
    }, r.user)
  }, {
    key: 'module',
    header: '模块',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, r.module)
  }, {
    key: 'action',
    header: '操作',
    render: r => r.action
  }, {
    key: 'method',
    header: '请求',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      tone: methodTone[r.method],
      appearance: "outline"
    }, r.method)
  }, {
    key: 'code',
    header: '权限码',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.code)
  }, {
    key: 'ms',
    header: '耗时',
    align: 'right',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: r.ms > 300 ? 'var(--warning-subtle-foreground)' : 'var(--muted-foreground)'
      }
    }, r.ms, "ms")
  }, {
    key: 'status',
    header: '结果',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      tone: r.status === 'success' ? 'success' : 'danger'
    }, r.status === 'success' ? '成功' : '失败')
  }, {
    key: 'time',
    header: '时间',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.time)
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: 'login',
      label: '登录日志',
      count: 128
    }, {
      value: 'oper',
      label: '操作日志',
      count: 542
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, /*#__PURE__*/React.createElement(Download, {
      size: 15
    }), "\u5BFC\u51FA")
  }, /*#__PURE__*/React.createElement(Field, {
    label: tab === 'login' ? '账号' : '操作人'
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "\u641C\u7D22\u8D26\u53F7",
    leading: /*#__PURE__*/React.createElement(Search, {
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u7ED3\u679C",
    w: 120
  }, /*#__PURE__*/React.createElement(Select, {
    size: "sm",
    placeholder: "\u5168\u90E8",
    options: [{
      value: 's',
      label: '成功'
    }, {
      value: 'f',
      label: '失败'
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u65E5\u671F",
    w: 150
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "2026-06-30"
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "\u67E5\u8BE2"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "\u91CD\u7F6E")), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: tab === 'login' ? loginCols : opCols,
    data: tab === 'login' ? D.LOGIN_LOGS : D.OP_LOGS,
    rowKey: "id",
    zebra: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px'
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    pageSize: 10,
    total: tab === 'login' ? 128 : 542,
    onPageChange: () => {},
    onPageSizeChange: () => {}
  })))));
}
window.LogsScreen = LogsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/LogsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/MiscScreens.jsx
try { (() => {
/* Atlas Admin UI kit — MenusScreen (menu tree) + DictScreen (dictionary). */
const M_NS = window.AtlasAdminDesignSystem_9d1c70;
function MenusScreen() {
  const {
    Card,
    Badge,
    Button,
    Switch,
    Tooltip
  } = M_NS;
  const {
    Plus,
    Pencil,
    Trash,
    ChevronRight,
    ChevronDown,
    LayoutDashboard,
    ShieldCheck,
    ScrollText
  } = window;
  const Toolbar = window.KitToolbar;
  const [expanded, setExpanded] = React.useState({
    system: true,
    monitor: true
  });
  const tree = window.ATLAS_DATA.MENU_TREE;
  const typeBadge = {
    dir: /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, "\u76EE\u5F55"),
    menu: /*#__PURE__*/React.createElement(Badge, {
      tone: "info",
      appearance: "outline"
    }, "\u83DC\u5355")
  };
  const icons = {
    dash: LayoutDashboard,
    system: ShieldCheck,
    monitor: ScrollText
  };
  const rows = [];
  tree.forEach(n => {
    const IconC = icons[n.key];
    rows.push({
      ...n,
      depth: 0,
      IconC
    });
    if (n.children && expanded[n.key]) n.children.forEach(c => rows.push({
      ...c,
      depth: 1
    }));
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, /*#__PURE__*/React.createElement(Plus, {
      size: 15
    }), "\u65B0\u589E\u83DC\u5355")
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "\u540E\u53F0\u83DC\u5355\u4E0E\u6743\u9650\u7801\u7EF4\u62A4\uFF0C\u652F\u6301\u591A\u7EA7\u76EE\u5F55")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, ['菜单名称', '类型', '权限码', '路由', '状态', '操作'].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      textAlign: i === 5 ? 'right' : 'left',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--muted-foreground)',
      padding: '0 14px',
      height: '38px',
      background: 'var(--muted)',
      borderBottom: '1px solid var(--border)',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.key,
    style: {
      borderBottom: '1px solid var(--border)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px',
      height: 'var(--row-h)',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      paddingLeft: r.depth * 22 + 'px'
    }
  }, r.children ? /*#__PURE__*/React.createElement("span", {
    onClick: () => setExpanded(e => ({
      ...e,
      [r.key]: !e[r.key]
    })),
    style: {
      cursor: 'pointer',
      display: 'inline-flex',
      color: 'var(--muted-foreground)'
    }
  }, expanded[r.key] ? /*#__PURE__*/React.createElement(ChevronDown, {
    size: 15
  }) : /*#__PURE__*/React.createElement(ChevronRight, {
    size: 15
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: '15px',
      display: 'inline-block'
    }
  }), r.IconC ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted-foreground)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(r.IconC, {
    size: 16
  })) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: r.depth === 0 ? 600 : 400
    }
  }, r.label))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px'
    }
  }, typeBadge[r.type]), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)'
    }
  }, r.code)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)'
    }
  }, r.path || '—')), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    size: "sm",
    checked: true,
    onChange: () => {}
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '2px',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: "\u7F16\u8F91"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm"
  }, /*#__PURE__*/React.createElement(Pencil, {
    size: 15
  }))), /*#__PURE__*/React.createElement(Tooltip, {
    label: "\u5220\u9664"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm",
    style: {
      color: 'var(--destructive)'
    }
  }, /*#__PURE__*/React.createElement(Trash, {
    size: 15
  })))))))))));
}
function DictScreen() {
  const {
    Card,
    DataTable,
    Badge,
    Button,
    Input,
    Tag,
    Tooltip
  } = M_NS;
  const {
    Plus,
    Search,
    Pencil,
    Trash
  } = window;
  const Toolbar = window.KitToolbar,
    Field = window.KitField;
  const cols = [{
    key: 'label',
    header: '字典名称',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, r.label)
  }, {
    key: 'code',
    header: '字典类型',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.code)
  }, {
    key: 'items',
    header: '数据项',
    align: 'right',
    render: r => /*#__PURE__*/React.createElement(Tag, {
      tone: "neutral"
    }, r.items, " \u9879")
  }, {
    key: 'remark',
    header: '取值',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.remark)
  }, {
    key: 'status',
    header: '状态',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      tone: r.status ? 'success' : 'neutral',
      dot: true
    }, r.status ? '启用' : '停用')
  }, {
    key: 'ops',
    header: '操作',
    align: 'right',
    width: 110,
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '2px',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u7F16\u8F91"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm"
    }, /*#__PURE__*/React.createElement(Pencil, {
      size: 15
    }))), /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u5220\u9664"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm",
      style: {
        color: 'var(--destructive)'
      }
    }, /*#__PURE__*/React.createElement(Trash, {
      size: 15
    }))))
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, /*#__PURE__*/React.createElement(Plus, {
      size: 15
    }), "\u65B0\u589E\u5B57\u5178")
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u5B57\u5178\u540D\u79F0"
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "\u641C\u7D22\u5B57\u5178",
    leading: /*#__PURE__*/React.createElement(Search, {
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "\u67E5\u8BE2"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "\u91CD\u7F6E")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    data: window.ATLAS_DATA.DICTS,
    rowKey: "id",
    zebra: true
  })));
}
window.MenusScreen = MenusScreen;
window.DictScreen = DictScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/MiscScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/RolesScreen.jsx
try { (() => {
/* Atlas Admin UI kit — RolesScreen. Role table + permission-assignment drawer. */
const R_NS = window.AtlasAdminDesignSystem_9d1c70;
function RolesScreen() {
  const {
    Card,
    DataTable,
    Badge,
    Tag,
    Button,
    Input,
    Drawer,
    PermissionTree,
    FormField,
    Switch,
    Tooltip
  } = R_NS;
  const {
    Plus,
    Search,
    Pencil,
    Trash,
    ShieldCheck
  } = window;
  const Toolbar = window.KitToolbar,
    Field = window.KitField;
  const [roles, setRoles] = React.useState(window.ATLAS_DATA.ROLES);
  const [assign, setAssign] = React.useState(null);
  const [checked, setChecked] = React.useState(['user:list', 'user:add', 'role:list', 'log:login', 'log:oper']);
  const cols = [{
    key: 'name',
    header: '角色名称',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      tone: r.tone
    }, r.name))
  }, {
    key: 'code',
    header: '权限字符',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.code)
  }, {
    key: 'users',
    header: '用户数',
    align: 'right',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, r.users)
  }, {
    key: 'perms',
    header: '权限数',
    align: 'right',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.perms)
  }, {
    key: 'remark',
    header: '说明',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.remark)
  }, {
    key: 'status',
    header: '状态',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      tone: r.status ? 'success' : 'neutral',
      dot: true
    }, r.status ? '启用' : '停用')
  }, {
    key: 'ops',
    header: '操作',
    align: 'right',
    width: 150,
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '2px',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u5206\u914D\u6743\u9650"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm",
      onClick: () => setAssign(r)
    }, /*#__PURE__*/React.createElement(ShieldCheck, {
      size: 15
    }))), /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u7F16\u8F91"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm"
    }, /*#__PURE__*/React.createElement(Pencil, {
      size: 15
    }))), /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u5220\u9664"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm",
      style: {
        color: 'var(--destructive)'
      }
    }, /*#__PURE__*/React.createElement(Trash, {
      size: 15
    }))))
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, /*#__PURE__*/React.createElement(Plus, {
      size: 15
    }), "\u65B0\u589E\u89D2\u8272")
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u89D2\u8272\u540D\u79F0"
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "\u641C\u7D22\u89D2\u8272",
    leading: /*#__PURE__*/React.createElement(Search, {
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "\u67E5\u8BE2"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "\u91CD\u7F6E")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    data: roles,
    rowKey: "id"
  })), /*#__PURE__*/React.createElement(Drawer, {
    open: !!assign,
    onClose: () => setAssign(null),
    size: "md",
    title: assign ? `分配权限 · ${assign.name}` : '分配权限',
    description: "\u52FE\u9009\u8BE5\u89D2\u8272\u53EF\u8BBF\u95EE\u7684\u83DC\u5355\u4E0E\u6309\u94AE\u6743\u9650",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, "\u5DF2\u9009 ", checked.length, " \u9879"), /*#__PURE__*/React.createElement(R_NS.Button, {
      variant: "outline",
      onClick: () => setAssign(null)
    }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(R_NS.Button, {
      onClick: () => setAssign(null)
    }, "\u4FDD\u5B58\u6743\u9650"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "\u89D2\u8272\u540D\u79F0"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: assign ? assign.name : ''
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u6743\u9650\u5B57\u7B26"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: assign ? assign.code : ''
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--foreground)',
      marginBottom: '8px'
    }
  }, "\u83DC\u5355 / \u6309\u94AE\u6743\u9650"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px',
      maxHeight: '320px',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(PermissionTree, {
    nodes: window.ATLAS_DATA.PERM_TREE,
    checkedKeys: checked,
    onChange: setChecked
  }))))));
}
window.RolesScreen = RolesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/RolesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/UsersScreen.jsx
try { (() => {
/* Atlas Admin UI kit — UsersScreen. Filters, table, bulk actions, drawer, delete dialog. */
const U_NS = window.AtlasAdminDesignSystem_9d1c70;
function Toolbar({
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      flexWrap: 'wrap'
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, right));
}
function Field({
  label,
  children,
  w = 160
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      width: w
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--muted-foreground)',
      fontWeight: 500
    }
  }, label), children);
}
window.KitToolbar = Toolbar;
window.KitField = Field;
function UsersScreen() {
  const {
    Card,
    DataTable,
    Pagination,
    Badge,
    Tag,
    Avatar,
    Button,
    Input,
    Select,
    Switch,
    Drawer,
    Dialog,
    FormField,
    Tooltip
  } = U_NS;
  const {
    Plus,
    Download,
    Search,
    Pencil,
    Trash,
    KeyRound,
    X
  } = window;
  const [data, setData] = React.useState(window.ATLAS_DATA.USERS);
  const [sel, setSel] = React.useState([]);
  const [sortKey, setSortKey] = React.useState('id');
  const [sortDir, setSortDir] = React.useState('asc');
  const [drawer, setDrawer] = React.useState(null); // 'new' | user
  const [del, setDel] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const cols = [{
    key: 'name',
    header: '用户',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '9px'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: "sm"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        lineHeight: 1.2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.username)))
  }, {
    key: 'dept',
    header: '部门',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted-foreground)'
      }
    }, r.dept)
  }, {
    key: 'role',
    header: '角色',
    render: r => /*#__PURE__*/React.createElement(Tag, {
      tone: r.roleTone
    }, r.role)
  }, {
    key: 'phone',
    header: '手机号',
    render: r => /*#__PURE__*/React.createElement("span", {
      className: "atlas-mono",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)'
      }
    }, r.phone)
  }, {
    key: 'status',
    header: '状态',
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      size: "sm",
      checked: r.status,
      onChange: v => setData(d => d.map(x => x.id === r.id ? {
        ...x,
        status: v
      } : x))
    }), /*#__PURE__*/React.createElement(Badge, {
      tone: r.status ? 'success' : 'neutral',
      dot: true
    }, r.status ? '启用' : '停用'))
  }, {
    key: 'last',
    header: '最近登录',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--muted-foreground)'
      }
    }, r.last)
  }, {
    key: 'ops',
    header: '操作',
    align: 'right',
    width: 130,
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '2px',
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u7F16\u8F91"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm",
      onClick: () => setDrawer(r)
    }, /*#__PURE__*/React.createElement(Pencil, {
      size: 15
    }))), /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u91CD\u7F6E\u5BC6\u7801"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm"
    }, /*#__PURE__*/React.createElement(KeyRound, {
      size: 15
    }))), /*#__PURE__*/React.createElement(Tooltip, {
      label: "\u5220\u9664"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "icon-sm",
      onClick: () => setDel(r),
      style: {
        color: 'var(--destructive)'
      }
    }, /*#__PURE__*/React.createElement(Trash, {
      size: 15
    }))))
  }];
  const sorted = [...data].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "sm"
    }, /*#__PURE__*/React.createElement(Download, {
      size: 15
    }), "\u5BFC\u51FA"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setDrawer('new')
    }, /*#__PURE__*/React.createElement(Plus, {
      size: 15
    }), "\u65B0\u589E\u7528\u6237"))
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u7528\u6237\u540D"
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    placeholder: "\u641C\u7D22\u59D3\u540D/\u8D26\u53F7",
    leading: /*#__PURE__*/React.createElement(Search, {
      size: 14
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u89D2\u8272",
    w: 140
  }, /*#__PURE__*/React.createElement(Select, {
    size: "sm",
    placeholder: "\u5168\u90E8\u89D2\u8272",
    options: [{
      value: 'admin',
      label: '系统管理员'
    }, {
      value: 'audit',
      label: '审计员'
    }, {
      value: 'op',
      label: '运营'
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u72B6\u6001",
    w: 120
  }, /*#__PURE__*/React.createElement(Select, {
    size: "sm",
    placeholder: "\u5168\u90E8",
    options: [{
      value: '1',
      label: '启用'
    }, {
      value: '0',
      label: '停用'
    }]
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "\u67E5\u8BE2"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "\u91CD\u7F6E")), /*#__PURE__*/React.createElement(Card, null, sel.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      background: 'var(--primary-muted)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--primary)',
      fontWeight: 500
    }
  }, "\u5DF2\u9009\u62E9 ", sel.length, " \u9879"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm"
  }, "\u6279\u91CF\u505C\u7528"), /*#__PURE__*/React.createElement(Button, {
    variant: "destructive",
    size: "sm"
  }, "\u6279\u91CF\u5220\u9664"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon-sm",
    onClick: () => setSel([])
  }, /*#__PURE__*/React.createElement(X, {
    size: 15
  })))) : null, /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    data: sorted,
    rowKey: "id",
    zebra: true,
    selectable: true,
    selectedKeys: sel,
    onSelectionChange: setSel,
    sortKey: sortKey,
    sortDir: sortDir,
    onSort: (k, d) => {
      setSortKey(k);
      setSortDir(d);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageSize: 10,
    total: 128,
    onPageChange: setPage,
    onPageSizeChange: () => {}
  }))), /*#__PURE__*/React.createElement(Drawer, {
    open: !!drawer,
    onClose: () => setDrawer(null),
    title: drawer === 'new' ? '新增用户' : '编辑用户',
    description: "\u8D26\u6237\u4FE1\u606F\u4E0E\u89D2\u8272\u5206\u914D",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(U_NS.Button, {
      variant: "outline",
      onClick: () => setDrawer(null)
    }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(U_NS.Button, {
      onClick: () => setDrawer(null)
    }, "\u4FDD\u5B58"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "\u767B\u5F55\u8D26\u53F7",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: drawer !== 'new' && drawer ? drawer.username : '',
    placeholder: "\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u59D3\u540D",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: drawer !== 'new' && drawer ? drawer.name : '',
    placeholder: "\u771F\u5B9E\u59D3\u540D"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(FormField, {
    label: "\u90E8\u95E8",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "\u9009\u62E9\u90E8\u95E8",
    options: [{
      value: 'tech',
      label: '技术部'
    }, {
      value: 'ops',
      label: '运营部'
    }, {
      value: 'risk',
      label: '风控部'
    }]
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u89D2\u8272",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "\u9009\u62E9\u89D2\u8272",
    options: [{
      value: 'admin',
      label: '系统管理员'
    }, {
      value: 'audit',
      label: '审计员'
    }, {
      value: 'op',
      label: '运营'
    }]
  }))), /*#__PURE__*/React.createElement(FormField, {
    label: "\u624B\u673A\u53F7",
    help: "\u7528\u4E8E\u63A5\u6536\u5B89\u5168\u901A\u77E5\uFF0C\u5C06\u52A0\u5BC6\u5B58\u50A8"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u9009\u586B"
  })), /*#__PURE__*/React.createElement(FormField, {
    label: "\u8D26\u6237\u72B6\u6001"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: true,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--muted-foreground)'
    }
  }, "\u542F\u7528\u540E\u7528\u6237\u65B9\u53EF\u767B\u5F55"))))), /*#__PURE__*/React.createElement(Dialog, {
    open: !!del,
    onClose: () => setDel(null),
    size: "sm",
    title: "\u5220\u9664\u7528\u6237",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(U_NS.Button, {
      variant: "outline",
      onClick: () => setDel(null)
    }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement(U_NS.Button, {
      variant: "destructive",
      onClick: () => {
        setData(d => d.filter(x => x.id !== del.id));
        setDel(null);
      }
    }, "\u786E\u8BA4\u5220\u9664"))
  }, "\u786E\u5B9A\u8981\u5220\u9664\u7528\u6237\u300C", del ? del.name : '', "\u300D\u5417\uFF1F\u8BE5\u64CD\u4F5C\u5C06\u8BB0\u5F55\u5230\u64CD\u4F5C\u65E5\u5FD7\uFF0C\u4E14\u4E0D\u53EF\u64A4\u9500\u3002"));
}
window.UsersScreen = UsersScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/UsersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.jsx
try { (() => {
/* Atlas Admin UI kit — mock data. Exports to window. */

const USERS = [{
  id: 1,
  username: 'zhangwei',
  name: '张伟',
  dept: '技术部',
  role: '系统管理员',
  roleTone: 'primary',
  phone: '138****6621',
  status: true,
  last: '2026-06-30 09:12',
  mail: 'z***@atlas.io'
}, {
  id: 2,
  username: 'lina',
  name: '李娜',
  dept: '风控部',
  role: '审计员',
  roleTone: 'info',
  phone: '139****0088',
  status: true,
  last: '2026-06-30 08:47',
  mail: 'l***@atlas.io'
}, {
  id: 3,
  username: 'wangqiang',
  name: '王强',
  dept: '运营部',
  role: '运营',
  roleTone: 'success',
  phone: '137****3312',
  status: false,
  last: '2026-06-12 17:20',
  mail: 'w***@atlas.io'
}, {
  id: 4,
  username: 'liuyang',
  name: '刘洋',
  dept: '技术部',
  role: '开发',
  roleTone: 'neutral',
  phone: '135****7754',
  status: true,
  last: '2026-06-29 22:03',
  mail: 'l***@atlas.io'
}, {
  id: 5,
  username: 'chenjing',
  name: '陈静',
  dept: '财务部',
  role: '财务',
  roleTone: 'warning',
  phone: '136****9901',
  status: true,
  last: '2026-06-28 11:33',
  mail: 'c***@atlas.io'
}, {
  id: 6,
  username: 'zhaolei',
  name: '赵磊',
  dept: '运营部',
  role: '运营',
  roleTone: 'success',
  phone: '138****2245',
  status: false,
  last: '2026-05-30 14:10',
  mail: 'z***@atlas.io'
}, {
  id: 7,
  username: 'sunli',
  name: '孙丽',
  dept: '风控部',
  role: '审计员',
  roleTone: 'info',
  phone: '139****6678',
  status: true,
  last: '2026-06-30 07:55',
  mail: 's***@atlas.io'
}];
const ROLES = [{
  id: 1,
  name: '系统管理员',
  code: 'admin',
  tone: 'primary',
  users: 2,
  perms: 42,
  status: true,
  remark: '拥有全部菜单与按钮权限',
  created: '2025-01-04'
}, {
  id: 2,
  name: '审计员',
  code: 'auditor',
  tone: 'info',
  users: 3,
  perms: 11,
  status: true,
  remark: '仅可查看日志与审计追踪',
  created: '2025-02-18'
}, {
  id: 3,
  name: '运营',
  code: 'operator',
  tone: 'success',
  users: 8,
  perms: 19,
  status: true,
  remark: '用户与字典的日常维护',
  created: '2025-03-22'
}, {
  id: 4,
  name: '财务',
  code: 'finance',
  tone: 'warning',
  users: 4,
  perms: 9,
  status: true,
  remark: '财务相关数据只读',
  created: '2025-04-11'
}, {
  id: 5,
  name: '访客',
  code: 'guest',
  tone: 'neutral',
  users: 1,
  perms: 3,
  status: false,
  remark: '临时只读账户',
  created: '2025-06-02'
}];
const LOGIN_LOGS = [{
  id: 1,
  user: 'zhangwei',
  ip: '10.12.4.51',
  location: '北京',
  browser: 'Chrome 138',
  os: 'macOS',
  status: 'success',
  msg: '登录成功',
  time: '2026-06-30 09:12:03'
}, {
  id: 2,
  user: 'unknown',
  ip: '203.0.113.9',
  location: '境外',
  browser: 'curl',
  os: '—',
  status: 'fail',
  msg: '验证码错误',
  time: '2026-06-30 08:55:41'
}, {
  id: 3,
  user: 'lina',
  ip: '10.12.4.77',
  location: '上海',
  browser: 'Edge 138',
  os: 'Windows',
  status: 'success',
  msg: '登录成功',
  time: '2026-06-30 08:47:12'
}, {
  id: 4,
  user: 'wangqiang',
  ip: '10.12.9.14',
  location: '深圳',
  browser: 'Chrome 137',
  os: 'Windows',
  status: 'fail',
  msg: '账户已停用',
  time: '2026-06-30 08:30:56'
}, {
  id: 5,
  user: 'sunli',
  ip: '10.12.4.63',
  location: '上海',
  browser: 'Safari 18',
  os: 'iOS',
  status: 'success',
  msg: '登录成功',
  time: '2026-06-30 07:55:20'
}, {
  id: 6,
  user: 'zhangwei',
  ip: '198.51.100.2',
  location: '境外',
  browser: 'Firefox 129',
  os: 'Linux',
  status: 'fail',
  msg: '密码错误（第3次）',
  time: '2026-06-29 23:41:08'
}];
const OP_LOGS = [{
  id: 1,
  user: 'zhangwei',
  module: '用户管理',
  action: '新增',
  method: 'POST',
  code: 'system:user:add',
  status: 'success',
  ms: 84,
  time: '2026-06-30 09:20:11'
}, {
  id: 2,
  user: 'zhangwei',
  module: '角色管理',
  action: '分配权限',
  method: 'PUT',
  code: 'system:role:assign',
  status: 'success',
  ms: 132,
  time: '2026-06-30 09:18:47'
}, {
  id: 3,
  user: 'lina',
  module: '日志管理',
  action: '导出',
  method: 'POST',
  code: 'monitor:operlog:export',
  status: 'success',
  ms: 421,
  time: '2026-06-30 08:59:02'
}, {
  id: 4,
  user: 'wangqiang',
  module: '用户管理',
  action: '删除',
  method: 'DELETE',
  code: 'system:user:remove',
  status: 'fail',
  ms: 26,
  time: '2026-06-30 08:33:19'
}, {
  id: 5,
  user: 'zhangwei',
  module: '字典管理',
  action: '编辑',
  method: 'PUT',
  code: 'system:dict:edit',
  status: 'success',
  ms: 57,
  time: '2026-06-29 18:22:40'
}];
const MENU_TREE = [{
  key: 'dash',
  label: '仪表盘',
  code: 'dashboard',
  type: 'menu',
  path: '/dashboard'
}, {
  key: 'system',
  label: '系统管理',
  code: 'system',
  type: 'dir',
  children: [{
    key: 'user',
    label: '用户管理',
    code: 'system:user:list',
    type: 'menu',
    path: '/system/user'
  }, {
    key: 'role',
    label: '角色管理',
    code: 'system:role:list',
    type: 'menu',
    path: '/system/role'
  }, {
    key: 'menu',
    label: '菜单管理',
    code: 'system:menu:list',
    type: 'menu',
    path: '/system/menu'
  }, {
    key: 'dict',
    label: '字典管理',
    code: 'system:dict:list',
    type: 'menu',
    path: '/system/dict'
  }]
}, {
  key: 'monitor',
  label: '日志管理',
  code: 'monitor',
  type: 'dir',
  children: [{
    key: 'login',
    label: '登录日志',
    code: 'monitor:logininfor:list',
    type: 'menu',
    path: '/monitor/login'
  }, {
    key: 'oper',
    label: '操作日志',
    code: 'monitor:operlog:list',
    type: 'menu',
    path: '/monitor/oper'
  }]
}];
const PERM_TREE = [{
  key: 'user',
  label: '用户管理',
  code: 'system:user',
  children: [{
    key: 'user:list',
    label: '查询',
    code: 'system:user:list',
    type: 'button'
  }, {
    key: 'user:add',
    label: '新增',
    code: 'system:user:add',
    type: 'button'
  }, {
    key: 'user:edit',
    label: '编辑',
    code: 'system:user:edit',
    type: 'button'
  }, {
    key: 'user:remove',
    label: '删除',
    code: 'system:user:remove',
    type: 'button'
  }, {
    key: 'user:reset',
    label: '重置密码',
    code: 'system:user:resetPwd',
    type: 'button'
  }]
}, {
  key: 'role',
  label: '角色管理',
  code: 'system:role',
  children: [{
    key: 'role:list',
    label: '查询',
    code: 'system:role:list',
    type: 'button'
  }, {
    key: 'role:add',
    label: '新增',
    code: 'system:role:add',
    type: 'button'
  }, {
    key: 'role:assign',
    label: '分配权限',
    code: 'system:role:assign',
    type: 'button'
  }]
}, {
  key: 'dict',
  label: '字典管理',
  code: 'system:dict',
  children: [{
    key: 'dict:list',
    label: '查询',
    code: 'system:dict:list',
    type: 'button'
  }, {
    key: 'dict:edit',
    label: '编辑',
    code: 'system:dict:edit',
    type: 'button'
  }]
}, {
  key: 'log',
  label: '日志管理',
  code: 'monitor:log',
  children: [{
    key: 'log:login',
    label: '登录日志',
    code: 'monitor:logininfor:list',
    type: 'button'
  }, {
    key: 'log:oper',
    label: '操作日志',
    code: 'monitor:operlog:list',
    type: 'button'
  }, {
    key: 'log:export',
    label: '日志导出',
    code: 'monitor:operlog:export',
    type: 'button'
  }]
}];
const DICTS = [{
  id: 1,
  label: '用户状态',
  code: 'sys_user_status',
  items: 2,
  remark: '启用 / 停用',
  status: true
}, {
  id: 2,
  label: '性别',
  code: 'sys_user_sex',
  items: 3,
  remark: '男 / 女 / 未知',
  status: true
}, {
  id: 3,
  label: '操作类型',
  code: 'sys_oper_type',
  items: 6,
  remark: '增删改查导入导出',
  status: true
}, {
  id: 4,
  label: '是否',
  code: 'sys_yes_no',
  items: 2,
  remark: '是 / 否',
  status: false
}];
Object.assign(window, {
  ATLAS_DATA: {
    USERS,
    ROLES,
    LOGIN_LOGS,
    OP_LOGS,
    MENU_TREE,
    PERM_TREE,
    DICTS
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Atlas Admin UI kit — Lucide icon set (paths from lucide.dev, ISC license).
   Loaded via babel in index.html; exports Icon + named glyphs to window.
   Lucide is the icon system used by the source shadcn-admin project. */

function Icon({
  children,
  size = 18,
  stroke = 1.75,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      ...style
    }
  }, props), children);
}
const P = d => props => /*#__PURE__*/React.createElement(Icon, props, /*#__PURE__*/React.createElement("path", {
  d: d
}));
const LayoutDashboard = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "9",
  x: "3",
  y: "3",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "5",
  x: "14",
  y: "3",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "9",
  x: "14",
  y: "12",
  rx: "1"
}), /*#__PURE__*/React.createElement("rect", {
  width: "7",
  height: "5",
  x: "3",
  y: "16",
  rx: "1"
}));
const Users = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "7",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 21v-2a4 4 0 0 0-3-3.87"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 3.13a4 4 0 0 1 0 7.75"
}));
const ShieldCheck = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const ListTree = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12h-8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 6H8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 18h-8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 6v4c0 1.1.9 2 2 2h3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 10v6c0 1.1.9 2 2 2h3"
}));
const Database = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("ellipse", {
  cx: "12",
  cy: "5",
  rx: "9",
  ry: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 5V19A9 3 0 0 0 21 19V5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 12A9 3 0 0 0 21 12"
}));
const ScrollText = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M15 12h-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 8h-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19 17V5a2 2 0 0 0-2-2H4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"
}));
const Search = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "8"
}), /*#__PURE__*/React.createElement("path", {
  d: "m21 21-4.3-4.3"
}));
const Bell = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M10.268 21a2 2 0 0 0 3.464 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
}));
const Sun = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
}));
const Moon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
}));
const ChevronDown = P("m6 9 6 6 6-6");
const ChevronRight = P("m9 18 6-6-6-6");
const Plus = P("M5 12h14M12 5v14");
const Pencil = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m15 5 4 4"
}));
const Trash = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 11v6M14 11v6"
}));
const Download = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 10l5 5 5-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 15V3"
}));
const Filter = P("M22 3H2l8 9.46V19l4 2v-8.54L22 3z");
const X = P("M18 6 6 18M6 6l12 12");
const Check = P("M20 6 9 17l-5-5");
const PanelLeft = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  width: "18",
  height: "18",
  x: "3",
  y: "3",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 3v18"
}));
const LogOut = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 17l5-5-5-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12H9"
}));
const Settings = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}));
const MoreHorizontal = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "19",
  cy: "12",
  r: "1"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "5",
  cy: "12",
  r: "1"
}));
const Lock = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  width: "18",
  height: "11",
  x: "3",
  y: "11",
  rx: "2",
  ry: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 11V7a5 5 0 0 1 10 0v4"
}));
const User = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "7",
  r: "4"
}));
const RefreshCw = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 3v5h-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 16H3v5"
}));
const KeyRound = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "16.5",
  cy: "7.5",
  r: ".5",
  fill: "currentColor"
}));
const Building = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  width: "16",
  height: "20",
  x: "4",
  y: "2",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"
}));
Object.assign(window, {
  Icon,
  LayoutDashboard,
  Users,
  ShieldCheck,
  ListTree,
  Database,
  ScrollText,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash,
  Download,
  Filter,
  X,
  Check,
  PanelLeft,
  LogOut,
  Settings,
  MoreHorizontal,
  Lock,
  User,
  RefreshCw,
  KeyRound,
  Building
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.PermissionTree = __ds_scope.PermissionTree;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardBody = __ds_scope.CardBody;

__ds_ns.CardFooter = __ds_scope.CardFooter;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.FormField = __ds_scope.FormField;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Drawer = __ds_scope.Drawer;

})();
