import React from 'react';
import { createRoot } from 'react-dom/client';

import { DemoApp } from './DemoApp';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<DemoApp />);
