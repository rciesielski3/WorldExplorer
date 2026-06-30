import React from 'react';

const Icon = React.forwardRef((props, ref) => React.createElement('Icon', { ...props, ref }));
Icon.displayName = 'Icon';

module.exports = Icon;
