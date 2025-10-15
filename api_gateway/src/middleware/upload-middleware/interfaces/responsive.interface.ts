// Responsive dimension interface
export interface ResponsiveDimension {
  width: number;
  height: number;
  name: string; // e.g., 'mobile', 'tablet', 'desktop', 'custom'
  quality?: number;
}

// Responsive variant interface
export interface ResponsiveVariant {
  name: string;
  width: number;
  height: number;
  url: string;
  size: number;
  quality?: number;
}
